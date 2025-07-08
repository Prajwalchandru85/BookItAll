import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Container, Row, Col, Card, Button, Badge, Form, Alert, Modal, Spinner } from 'react-bootstrap'
import { createBooking, confirmBooking, getSeats } from './firebase/database'

function EntertainmentDetails({ user, onBooking }) {
  const { category, id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [item, setItem] = useState(null)
  const [selectedShowtime, setSelectedShowtime] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [seats, setSeats] = useState({})
  const [selectedSeats, setSelectedSeats] = useState([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [showTestPayment, setShowTestPayment] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentBookingId, setCurrentBookingId] = useState(null)

  useEffect(() => {
    loadItemDetails()
  }, [id, category])

  useEffect(() => {
    if (item && selectedShowtime && selectedDate) {
      loadSeats()
    }
  }, [item, selectedShowtime, selectedDate])

  const loadItemDetails = () => {
    setLoading(true)
    setError('')

    // Get item data from location state (passed from Home component)
    if (location.state && location.state.item) {
      setItem(location.state.item)
      setSelectedDate(new Date().toISOString().split('T')[0])
    } else {
      setError('Item details not found')
    }
    
    setLoading(false)
  }

  const loadSeats = async () => {
    const result = await getSeats(item.id, selectedShowtime, selectedDate)
    if (result.success) {
      const seatLayout = {}
      result.data.forEach(seat => {
        if (!seatLayout[seat.row]) {
          seatLayout[seat.row] = []
        }
        seatLayout[seat.row].push(seat)
      })
      Object.keys(seatLayout).forEach(row => {
        seatLayout[row].sort((a, b) => parseInt(a.seatNumber) - parseInt(b.seatNumber))
      })
      setSeats(seatLayout)
    }
    setSelectedSeats([])
  }

  const handleSeatClick = (seat) => {
    if (!selectedShowtime) {
      alert('Please select a showtime first')
      return
    }
    if (seat.isBooked) {
      return
    }
    const seatId = `${seat.row}${seat.seatNumber}`
    if (selectedSeats.find(s => s.id === seatId)) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seatId))
    } else {
      setSelectedSeats(prev => [...prev, { id: seatId, row: seat.row, seatNumber: seat.seatNumber }])
    }
  }

  const handleProceedToCheckout = async () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat')
      return
    }

    setIsProcessing(true)

    // Double-check seat availability
    const currentSeatsResult = await getSeats(item.id, selectedShowtime, selectedDate)
    if (!currentSeatsResult.success) {
      alert('Failed to check seat availability. Please try again.')
      setIsProcessing(false)
      return
    }

    const currentSeats = currentSeatsResult.data
    const unavailableSeats = selectedSeats.filter(selSeat => {
      return currentSeats.some(seat => 
        seat.row === selSeat.row && 
        seat.seatNumber === selSeat.seatNumber && 
        seat.isBooked === true
      )
    })

    if (unavailableSeats.length > 0) {
      alert(`Seats ${unavailableSeats.map(s => s.id).join(', ')} are no longer available. Please select different seats.`)
      setIsProcessing(false)
      loadSeats()
      return
    }

    setShowCheckout(true)
    setIsProcessing(false)
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    try {
      const totalAmount = selectedSeats.length * getSelectedShowtimePrice()

      // Create booking record first
      const bookingResult = await createBooking({
        userId: user.id,
        movieId: item.id, // Using movieId field for compatibility
        movieTitle: item.title,
        showtime: selectedShowtime,
        showDate: selectedDate,
        seats: selectedSeats,
        totalAmount,
        category: category // Add category for identification
      })

      if (!bookingResult.success) {
        throw new Error('Failed to create booking')
      }

      setCurrentBookingId(bookingResult.bookingId)

      // Initialize Razorpay with test mode handling
      const options = {
        key: 'YOUR_RAZORPAY_KEY', // Replace with your Razorpay key
        amount: totalAmount * 100,
        currency: 'INR',
        name: 'Movie Dekho',
        description: `${item.title} - ${selectedSeats.length} seats`,
        image: item.poster,
        handler: function (response) {
          console.log('Razorpay handler called:', response)
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || '9999999999'
        },
        theme: {
          color: '#3182ce'
        },
        modal: {
          ondismiss: function() {
            setShowTestPayment(true)
            setIsProcessing(false)
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()

      // Since we're in test mode, immediately show test payment modal
      setTimeout(() => {
        setShowTestPayment(true)
        setIsProcessing(false)
      }, 2000)

    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment initialization failed. Please try again.')
      setIsProcessing(false)
    }
  }

  // Handle test payment scenarios
  const handleTestPaymentSuccess = async () => {
    setIsProcessing(true)
    setShowTestPayment(false)

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const mockPaymentId = `pay_test_${Date.now()}`

      const confirmResult = await confirmBooking(
        currentBookingId,
        mockPaymentId,
        selectedSeats,
        item.id,
        selectedShowtime,
        selectedDate,
        user.id
      )

      if (confirmResult.success) {
        const receiptData = {
          bookingId: currentBookingId,
          bookingReference: `BK${Date.now()}`,
          movieTitle: item.title,
          category: category,
          showtime: selectedShowtime,
          date: selectedDate,
          seats: selectedSeats,
          totalAmount: selectedSeats.length * getSelectedShowtimePrice(),
          paymentId: mockPaymentId,
          bookingTime: new Date().toISOString(),
          userEmail: user.email,
          paymentMode: 'TEST_MODE'
        }

        onBooking(receiptData)
        setReceipt(receiptData)
        setBookingComplete(true)
        setShowCheckout(false)
        loadSeats()
      }
    } catch (error) {
      console.error('Booking confirmation error:', error)
      alert('Booking confirmation failed. Please try again.')
    }
    
    setIsProcessing(false)
  }

  const handleTestPaymentFailure = () => {
    setShowTestPayment(false)
    setIsProcessing(false)
    alert('Payment failed! Please try again with different payment method.')
  }

  const handleTestPaymentCancel = () => {
    setShowTestPayment(false)
    setIsProcessing(false)
  }

  const getSelectedShowtimePrice = () => {
    const showtime = item.showtimes.find(st => st.time === selectedShowtime)
    return showtime ? showtime.price : 0
  }

  const getCategoryDisplayName = () => {
    const categoryMap = {
      'shows': 'Live Show',
      'concerts': 'Concert',
      'sports': 'Sports Event',
      'parks': 'Amusement Park',
      'festivals': 'Festival/Exhibition'
    }
    return categoryMap[category] || 'Entertainment'
  }

  if (loading) {
    return (
      <div className="app-container">
        <Container className="text-center py-5">
          <Spinner animation="border" role="status" style={{ color: '#3182ce' }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading event details...</p>
        </Container>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="app-container">
        <Container className="py-5">
          <Alert variant="danger">
            <Alert.Heading>Event Not Found</Alert.Heading>
            <p>{error || 'The requested event could not be found.'}</p>
            <Button variant="outline-danger" onClick={() => navigate('/')}>
              <i className="fas fa-arrow-left me-2"></i>
              Back to Home
            </Button>
          </Alert>
        </Container>
      </div>
    )
  }

  const totalAmount = selectedSeats.length * getSelectedShowtimePrice()

  return (
    <div className="app-container">
      <Container className="py-5">
        {/* Event Details Header */}
        <Row className="mb-5">
          <Col lg={4} className="mb-4">
            <Card className="movie-card">
              <Card.Img 
                variant="top" 
                src={item.poster} 
                alt={item.title}
                className="movie-poster"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/300x400/1a2332/ffffff?text=${encodeURIComponent(item.title)}`
                }}
              />
            </Card>
          </Col>
          <Col lg={8}>
            <div className="mb-3">
              <Badge className="movie-genre me-3">{Array.isArray(item.genre) ? item.genre[0] : item.genre}</Badge>
              <Badge className="movie-rating">
                <i className="fas fa-star me-1"></i>
                {item.rating}
              </Badge>
            </div>
            <h1 className="display-4 fw-bold text-light mb-3">{item.title}</h1>
            <p className="lead text-light opacity-75 mb-4">{item.description}</p>
            
            <Row className="movie-details">
              <Col md={6}>
                <p className="mb-2"><strong>Category:</strong> {getCategoryDisplayName()}</p>
                <p className="mb-2"><strong>Duration:</strong> {Math.floor(item.duration / 60)}h {item.duration % 60}m</p>
                <p className="mb-2"><strong>Year:</strong> {item.year}</p>
              </Col>
              <Col md={6}>
                <p className="mb-2"><strong>Venue:</strong> {item.venue || item.director}</p>
                <p className="mb-2"><strong>Genre:</strong> {Array.isArray(item.genre) ? item.genre.join(', ') : item.genre}</p>
                <p className="mb-2"><strong>Rating:</strong> {item.rating}/10</p>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Show Selection */}
        <Row className="mb-5">
          <Col md={6}>
            <Card className="booking-summary">
              <Card.Body>
                <h5 className="mb-3">
                  <i className="fas fa-calendar-alt me-2"></i>
                  Select Date
                </h5>
                <Form.Control
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="bg-dark text-light border-secondary"
                />
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="booking-summary">
              <Card.Body>
                <h5 className="mb-3">
                  <i className="fas fa-clock me-2"></i>
                  Select Time
                </h5>
                <div className="d-flex flex-wrap gap-2">
                  {item.showtimes?.map((showtime) => (
                    <Button
                      key={showtime.time}
                      variant={selectedShowtime === showtime.time ? 'primary' : 'outline-light'}
                      size="sm"
                      onClick={() => setSelectedShowtime(showtime.time)}
                      className="px-3"
                    >
                      {showtime.time} (₹{showtime.price})
                    </Button>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Seat Selection */}
        {selectedShowtime && (
          <div className="mb-5">
            <h4 className="text-center mb-4">
              <i className="fas fa-couch me-2"></i>
              Select Your Seats
            </h4>
            
            <div className="seat-map">
              <div className="text-center mb-4">
                <div className="screen-indicator d-inline-block">
                  <i className="fas fa-tv me-2"></i>
                  {category === 'concerts' ? 'STAGE' : 
                   category === 'sports' ? 'FIELD' : 
                   category === 'parks' ? 'ENTRY' : 'STAGE'}
                </div>
              </div>
              
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(row => (
                <div key={row} className="seat-row">
                  <span className="row-label">{row}</span>
                  {seats[row]?.map(seat => {
                    const seatId = `${seat.row}${seat.seatNumber}`
                    const isSelected = selectedSeats.find(s => s.id === seatId)
                    
                    return (
                      <button
                        key={seat.id}
                        className={`seat-btn ${
                          seat.isBooked ? 'booked' : 
                          isSelected ? 'selected' : 'available'
                        }`}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.isBooked}
                        title={`${seatId} - ${
                          seat.isBooked ? 'Booked' : 
                          isSelected ? 'Selected' : 'Available'
                        }`}
                      >
                        {seat.seatNumber}
                      </button>
                    )
                  })}
                </div>
              ))}

              <div className="seat-legend">
                <div className="legend-item">
                  <div className="legend-seat available"></div>
                  <span>Available</span>
                </div>
                <div className="legend-item">
                  <div className="legend-seat selected"></div>
                  <span>Selected</span>
                </div>
                <div className="legend-item">
                  <div className="legend-seat booked"></div>
                  <span>Booked</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking Summary */}
        {selectedSeats.length > 0 && (
          <Card className="booking-summary mb-4">
            <Card.Body>
              <h5 className="mb-3">
                <i className="fas fa-receipt me-2"></i>
                Booking Summary
              </h5>
              <Row>
                <Col md={8}>
                  <p><strong>Event:</strong> {item.title}</p>
                  <p><strong>Category:</strong> {getCategoryDisplayName()}</p>
                  <p><strong>Date:</strong> {selectedDate}</p>
                  <p><strong>Time:</strong> {selectedShowtime}</p>
                  <p><strong>Seats:</strong> {selectedSeats.map(s => s.id).join(', ')}</p>
                  <p><strong>Price per seat:</strong> ₹{getSelectedShowtimePrice()}</p>
                </Col>
                <Col md={4} className="text-end">
                  <h4 className="text-primary">₹{totalAmount}</h4>
                  <Button 
                    variant="primary" 
                    size="lg" 
                    onClick={handleProceedToCheckout}
                    className="w-100"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-credit-card me-2"></i>
                        Proceed to Pay
                      </>
                    )}
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {/* Checkout Modal */}
        <Modal show={showCheckout} onHide={() => setShowCheckout(false)} size="lg" centered>
          <Modal.Header closeButton className="border-0">
            <Modal.Title>
              <i className="fas fa-credit-card me-2"></i>
              Secure Checkout
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="text-center mb-4">
              <img src={item.poster} alt={item.title} style={{ width: '100px', borderRadius: '8px' }} />
              <h5 className="mt-3">{item.title}</h5>
              <Badge bg="info">{getCategoryDisplayName()}</Badge>
            </div>
            
            <table className="table table-dark">
              <tbody>
                <tr><td><strong>Date:</strong></td><td>{selectedDate}</td></tr>
                <tr><td><strong>Time:</strong></td><td>{selectedShowtime}</td></tr>
                <tr><td><strong>Seats:</strong></td><td>{selectedSeats.map(s => s.id).join(', ')}</td></tr>
                <tr><td><strong>Price per seat:</strong></td><td>₹{getSelectedShowtimePrice()}</td></tr>
                <tr className="table-primary"><td><strong>Total Amount:</strong></td><td><strong>₹{totalAmount}</strong></td></tr>
              </tbody>
            </table>
            
            <Alert variant="warning" className="mt-3">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Test Mode:</strong> This is Razorpay test mode. After the payment gateway opens, you'll see test payment options to simulate different scenarios.
            </Alert>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="secondary" onClick={() => setShowCheckout(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handlePayment}
              disabled={isProcessing}
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-lock me-2"></i>
                  Pay ₹{totalAmount}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Test Payment Modal */}
        <Modal show={showTestPayment} onHide={() => setShowTestPayment(false)} size="md" centered backdrop="static">
          <Modal.Header className="border-0 bg-warning text-dark">
            <Modal.Title>
              <i className="fas fa-flask me-2"></i>
              Test Payment Simulation
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <div className="mb-4">
              <i className="fas fa-credit-card text-primary" style={{ fontSize: '3rem' }}></i>
            </div>
            
            <h5 className="mb-3">Razorpay Test Mode</h5>
            <p className="text-muted mb-4">
              Since this is test mode, please choose how you want to simulate the payment:
            </p>

            <div className="d-grid gap-3">
              <Button 
                variant="success" 
                size="lg"
                onClick={handleTestPaymentSuccess}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle me-2"></i>
                    Simulate Successful Payment
                  </>
                )}
              </Button>

              <Button 
                variant="danger" 
                size="lg"
                onClick={handleTestPaymentFailure}
                disabled={isProcessing}
              >
                <i className="fas fa-times-circle me-2"></i>
                Simulate Payment Failure
              </Button>

              <Button 
                variant="secondary" 
                size="lg"
                onClick={handleTestPaymentCancel}
                disabled={isProcessing}
              >
                <i className="fas fa-ban me-2"></i>
                Cancel Payment
              </Button>
            </div>

            <div className="mt-4 p-3 bg-light rounded">
              <small className="text-muted">
                <strong>Note:</strong> In production mode, this would be handled automatically by Razorpay's payment gateway.
              </small>
            </div>
          </Modal.Body>
        </Modal>

        {/* Booking Confirmation Modal */}
        <Modal show={bookingComplete} onHide={() => setBookingComplete(false)} size="lg" centered>
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="text-success">
              <i className="fas fa-check-circle me-2"></i>
              Booking Confirmed!
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {receipt && (
              <div className="text-center">
                <div className="mb-4">
                  <i className="fas fa-ticket-alt text-success" style={{ fontSize: '4rem' }}></i>
                </div>
                
                <Alert variant="success">
                  <strong>Congratulations!</strong> Your {getCategoryDisplayName().toLowerCase()} booking has been confirmed. Your seats are now permanently reserved.
                </Alert>
                
                <div className="booking-receipt bg-dark p-4 rounded">
                  <h5 className="text-primary mb-3">Digital Receipt</h5>
                  <table className="table table-dark">
                    <tbody>
                      <tr><td><strong>Booking ID:</strong></td><td>{receipt.bookingReference}</td></tr>
                      <tr><td><strong>Event:</strong></td><td>{receipt.movieTitle}</td></tr>
                      <tr><td><strong>Category:</strong></td><td>{getCategoryDisplayName()}</td></tr>
                      <tr><td><strong>Date:</strong></td><td>{receipt.date}</td></tr>
                      <tr><td><strong>Time:</strong></td><td>{receipt.showtime}</td></tr>
                      <tr><td><strong>Seats:</strong></td><td>{receipt.seats.map(s => s.id).join(', ')}</td></tr>
                      <tr><td><strong>Total Amount:</strong></td><td>₹{receipt.totalAmount}</td></tr>
                      <tr><td><strong>Payment ID:</strong></td><td className="small">{receipt.paymentId}</td></tr>
                      {receipt.paymentMode && (
                        <tr><td><strong>Payment Mode:</strong></td><td><Badge bg="warning" text="dark">{receipt.paymentMode}</Badge></td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0 justify-content-center">
            <Button variant="primary" size="lg" onClick={() => navigate('/')}>
              <i className="fas fa-home me-2"></i>
              Back to Home
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>

      {/* Load Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  )
}

export default EntertainmentDetails
