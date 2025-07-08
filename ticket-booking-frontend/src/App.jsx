import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Navbar, Nav, Container, Button, Badge, Dropdown, Alert, Spinner } from 'react-bootstrap'
import { onAuthStateChange, logoutUser } from './firebase/auth'
import { getUserBookings } from './firebase/database'
import Login from './login'
import Home from './home'
import MovieDetails from './MovieDetails'
import EntertainmentDetails from './EntertainmentDetails'

function App() {
  const [user, setUser] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookingsError, setBookingsError] = useState('')
  const [bookingsLoading, setBookingsLoading] = useState(false)

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          isVerified: firebaseUser.emailVerified
        }
        setUser(userData)
        
        // Load user bookings from Firebase
        await loadUserBookings(firebaseUser.uid)
      } else {
        setUser(null)
        setBookings([])
        setBookingsError('')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Enhanced function to load bookings with error handling
  const loadUserBookings = async (userId) => {
    try {
      setBookingsLoading(true)
      setBookingsError('')
      console.log('Loading bookings for user:', userId)
      
      const bookingsResult = await getUserBookings(userId)
      if (bookingsResult.success) {
        setBookings(bookingsResult.data)
        console.log('Successfully loaded bookings:', bookingsResult.data.length)
      } else {
        console.error('Failed to load bookings:', bookingsResult.message)
        setBookingsError(bookingsResult.message)
        setBookings([])
      }
    } catch (error) {
      console.error('Error loading bookings:', error)
      setBookingsError('Failed to load bookings. Please refresh the page.')
      setBookings([])
    } finally {
      setBookingsLoading(false)
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
    // Bookings will be loaded automatically by the auth state change
  }

  const handleLogout = async () => {
    const result = await logoutUser()
    if (result.success) {
      setUser(null)
      setBookings([])
      setBookingsError('')
    }
  }

  // Enhanced addBooking function with immediate refresh
  const addBooking = async (booking) => {
    console.log('Adding new booking:', booking)
    
    // Add to local state immediately for responsive UI
    setBookings(prev => [booking, ...prev])
    
    // Refresh bookings from Firebase after a short delay
    if (user && user.id) {
      setTimeout(async () => {
        console.log('Refreshing bookings from Firebase...')
        await loadUserBookings(user.id)
      }, 3000) // Wait 3 seconds for Firebase to process
    }
  }

  if (loading) {
    return (
      <div className="app-container min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center fade-in-up">
          <Spinner animation="border" className="text-primary mb-3" style={{ width: '4rem', height: '4rem' }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <h4 className="text-light" style={{ color: '#ffffff' }}>Loading BookItAll...</h4>
          <p className="text-light" style={{ color: '#a0aec0' }}>Please wait while we prepare your cinema experience</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Router>
      <div className="app-container min-vh-100">
        {/* Enhanced Navigation Bar */}
        <Navbar 
          expand="lg" 
          className="py-3 shadow-lg"
          style={{ 
            background: 'linear-gradient(135deg, #0f1419 0%, #1a2332 100%)',
            borderBottom: '2px solid #3182ce'
          }}
        >
          <Container>
            <Navbar.Brand 
              href="/" 
              className="fw-bold fs-2 slide-in"
              style={{ 
                background: 'linear-gradient(45deg, #3182ce, #4299e1)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              🎬 BookItAll
            </Navbar.Brand>
            
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link 
                  href="/" 
                  className="text-light fw-500"
                  style={{ color: '#ffffff !important' }}
                >
                  <i className="fas fa-home me-2"></i>Home
                </Nav.Link>
                <Nav.Link 
                  href="#bookings" 
                  className="text-light fw-500"
                  style={{ color: '#ffffff !important' }}
                >
                  <i className="fas fa-ticket-alt me-2"></i>
                  My Bookings 
                  {bookings.length > 0 && (
                    <Badge bg="primary" className="ms-2">{bookings.length}</Badge>
                  )}
                </Nav.Link>
              </Nav>
              
              <Nav className="ms-auto">
                <Dropdown align="end">
                  <Dropdown.Toggle 
                    variant="outline-light" 
                    id="dropdown-basic"
                    className="d-flex align-items-center"
                    style={{ 
                      borderRadius: '15px', 
                      padding: '10px 20px',
                      color: '#ffffff',
                      borderColor: '#3182ce'
                    }}
                  >
                    <i className="fas fa-user-circle me-2"></i>
                    {user.name || user.email}
                  </Dropdown.Toggle>

                  <Dropdown.Menu 
                    className="shadow-lg"
                    style={{ 
                      background: 'linear-gradient(145deg, #1e2a3a 0%, #2d3748 100%)',
                      border: '1px solid #4a5568',
                      borderRadius: '15px'
                    }}
                  >
                    <Dropdown.Item style={{ color: '#ffffff' }}>
                      <i className="fas fa-envelope me-2"></i>
                      {user.email}
                    </Dropdown.Item>
                    <Dropdown.Divider style={{ borderColor: '#4a5568' }} />
                    <Dropdown.Item onClick={handleLogout} style={{ color: '#3182ce' }}>
                      <i className="fas fa-sign-out-alt me-2"></i>
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/movie/:id" 
            element={<MovieDetails user={user} onBooking={addBooking} />} 
          />
          {/* NEW: Route for entertainment booking */}
          <Route 
            path="/entertainment/:category/:id" 
            element={<EntertainmentDetails user={user} onBooking={addBooking} />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Enhanced My Bookings Section */}
        <div className="py-5" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <Container>
            <div className="text-center mb-5">
              <h2 id="bookings" className="fw-bold" style={{ color: '#ffffff' }}>
                <i className="fas fa-history me-3" style={{ color: '#3182ce' }}></i>
                My Bookings {bookings.length > 0 && `(${bookings.length})`}
              </h2>
              <p style={{ color: '#a0aec0', fontSize: '1.1rem' }}>
                Your complete booking history and upcoming shows
              </p>
            </div>

            {/* Loading state for bookings */}
            {bookingsLoading && (
              <div className="text-center py-4">
                <Spinner animation="border" className="text-primary">
                  <span className="visually-hidden">Loading bookings...</span>
                </Spinner>
                <p className="mt-2" style={{ color: '#a0aec0' }}>Loading your bookings...</p>
              </div>
            )}

            {/* Error message for bookings */}
            {bookingsError && !bookingsLoading && (
              <Alert variant="warning" className="mb-4" style={{ 
                background: 'rgba(237, 137, 54, 0.2)',
                border: '1px solid #ed8936',
                color: '#ffffff'
              }}>
                <Alert.Heading style={{ color: '#ffffff' }}>
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Bookings Loading Issue
                </Alert.Heading>
                <p style={{ color: '#ffffff' }}>{bookingsError}</p>
                <Button 
                  variant="outline-warning" 
                  onClick={() => loadUserBookings(user.id)}
                  style={{ color: '#ffffff', borderColor: '#ed8936' }}
                >
                  <i className="fas fa-redo me-2"></i>
                  Retry Loading Bookings
                </Button>
              </Alert>
            )}

            {/* Bookings display */}
            {!bookingsLoading && bookings.length > 0 ? (
              <div className="row g-4">
                {bookings.map((booking, index) => (
                  <div key={booking.id || booking.bookingId || index} className="col-md-6 col-lg-4 fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="card booking-summary h-100" style={{
                      background: 'linear-gradient(145deg, #1e2a3a 0%, #2d3748 100%)',
                      border: '2px solid #3182ce',
                      borderRadius: '15px'
                    }}>
                      <div className="card-body" style={{ padding: '1.5rem' }}>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h6 className="card-title fw-bold" style={{ color: '#ffffff', fontSize: '1.1rem' }}>
                            {booking.movie?.title || booking.movieTitle || 'Event'}
                          </h6>
                          <div>
                            <Badge bg={booking.status === 'confirmed' ? 'success' : 'warning'} className="ms-2">
                              {booking.status || 'Confirmed'}
                            </Badge>
                            {booking.category && (
                              <Badge bg="info" className="ms-1">
                                {booking.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="booking-details">
                          <p className="mb-2" style={{ color: '#ffffff' }}>
                            <i className="fas fa-calendar me-2 text-primary"></i>
                            <strong>Date:</strong> {booking.showDate || booking.date}
                          </p>
                          <p className="mb-2" style={{ color: '#ffffff' }}>
                            <i className="fas fa-clock me-2 text-primary"></i>
                            <strong>Time:</strong> {booking.showtime}
                          </p>
                          <p className="mb-2" style={{ color: '#ffffff' }}>
                            <i className="fas fa-couch me-2 text-primary"></i>
                            <strong>Seats:</strong> {
                              booking.seats?.map(s => typeof s === 'string' ? s : s.id || `${s.row}${s.seatNumber}`).join(', ')
                            }
                          </p>
                          <p className="mb-2" style={{ color: '#ffffff' }}>
                            <i className="fas fa-rupee-sign me-2 text-primary"></i>
                            <strong>Amount:</strong> ₹{booking.totalAmount}
                          </p>
                          <div className="mb-2 p-3" style={{ 
                            background: 'rgba(49, 130, 206, 0.1)', 
                            borderRadius: '8px',
                            border: '1px solid #3182ce'
                          }}>
                            <p className="mb-1" style={{ color: '#ffffff' }}>
                              <i className="fas fa-barcode me-2 text-primary"></i>
                              <strong>Booking ID:</strong>
                            </p>
                            <code style={{ 
                              color: '#3182ce', 
                              fontSize: '0.9rem',
                              fontWeight: 'bold',
                              background: 'rgba(49, 130, 206, 0.2)',
                              padding: '4px 8px',
                              borderRadius: '4px'
                            }}>
                              {booking.bookingReference || booking.bookingId || `BK${booking.id?.slice(-6)}`}
                            </code>
                          </div>
                          {booking.paymentId && (
                            <p className="mb-0" style={{ color: '#a0aec0' }}>
                              <i className="fas fa-credit-card me-2 text-primary"></i>
                              <strong>Payment ID:</strong> 
                              <small className="ms-1">{booking.paymentId.slice(-8)}</small>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !bookingsError && !bookingsLoading && (
                <div className="text-center py-5 fade-in-up">
                  <i className="fas fa-ticket-alt" style={{ 
                    fontSize: '5rem', 
                    color: '#3182ce',
                    opacity: 0.7
                  }}></i>
                  <h4 className="mt-4" style={{ color: '#ffffff' }}>No bookings yet</h4>
                  <p className="mb-4" style={{ color: '#a0aec0' }}>
                    Book your first entertainment experience to see it here!
                  </p>
                  <Button 
                    variant="primary" 
                    href="/" 
                    className="px-4 py-2"
                    style={{
                      background: 'linear-gradient(45deg, #3182ce, #4299e1)',
                      border: 'none',
                      borderRadius: '25px',
                      fontSize: '1.1rem',
                      fontWeight: '600'
                    }}
                  >
                    <i className="fas fa-film me-2"></i>
                    Browse Entertainment
                  </Button>
                </div>
              )
            )}
          </Container>
        </div>

        {/* Enhanced Footer with Proper Visibility */}
        <footer className="py-5 mt-5" style={{ 
          background: 'linear-gradient(135deg, #0f1419 0%, #1a2332 100%)', 
          borderTop: '3px solid #3182ce'
        }}>
          <Container>
            <div className="text-center">
              <div className="mb-4">
                <h5 className="fw-bold" style={{ 
                  color: '#ffffff',
                  fontSize: '1.5rem',
                  marginBottom: '0.5rem'
                }}>
                  🎬 BookItAll
                </h5>
                <p style={{ 
                  color: '#3182ce',
                  fontSize: '1rem',
                  fontWeight: '500',
                  marginBottom: '0'
                }}>
                  Universal Booking Hub
                </p>
              </div>
              
              <div className="row mb-4">
                <div className="col-md-4 mb-3">
                  <div style={{ 
                    padding: '15px',
                    background: 'rgba(49, 130, 206, 0.1)',
                    borderRadius: '10px',
                    border: '1px solid rgba(49, 130, 206, 0.3)'
                  }}>
                    <i className="fas fa-shield-alt text-primary me-2" style={{ fontSize: '1.2rem' }}></i>
                    <span style={{ color: '#ffffff', fontWeight: '500' }}>Secure Payments</span>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div style={{ 
                    padding: '15px',
                    background: 'rgba(49, 130, 206, 0.1)',
                    borderRadius: '10px',
                    border: '1px solid rgba(49, 130, 206, 0.3)'
                  }}>
                    <i className="fas fa-star text-primary me-2" style={{ fontSize: '1.2rem' }}></i>
                    <span style={{ color: '#ffffff', fontWeight: '500' }}>Premium Experience</span>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div style={{ 
                    padding: '15px',
                    background: 'rgba(49, 130, 206, 0.1)',
                    borderRadius: '10px',
                    border: '1px solid rgba(49, 130, 206, 0.3)'
                  }}>
                    <i className="fas fa-headset text-primary me-2" style={{ fontSize: '1.2rem' }}></i>
                    <span style={{ color: '#ffffff', fontWeight: '500' }}>24/7 Support</span>
                  </div>
                </div>
              </div>
              
              <hr style={{ 
                borderColor: '#3182ce', 
                borderWidth: '2px',
                opacity: 0.5,
                margin: '2rem 0'
              }} />
              
              <div className="mb-3">
                <p style={{ 
                  color: '#ffffff', 
                  fontSize: '1rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  © 2025 <span style={{ color: '#3182ce' }}>BookItAll</span> - By Prajwal. All rights reserved.
                </p>
                <p style={{ 
                  color: '#a0aec0', 
                  fontSize: '0.9rem',
                  marginBottom: '0'
                }}>
                  Powered by 
                  <span style={{ color: '#3182ce', fontWeight: '600' }}> Firebase</span> & 
                  <span style={{ color: '#3182ce', fontWeight: '600' }}> Razorpay</span>
                </p>
              </div>
            </div>
          </Container>
        </footer>
      </div>
    </Router>
  )
}

export default App
