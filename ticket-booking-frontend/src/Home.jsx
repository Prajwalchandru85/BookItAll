import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Nav } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { getMovies, initializeSampleMovies } from './firebase/database'

function Home() {
  const navigate = useNavigate()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState('movies')

  // Entertainment categories
  const categories = [
    {
      id: 'movies',
      name: 'Movies',
      icon: '🎥',
      description: 'Latest blockbusters and cinema experiences'
    },
    {
      id: 'shows',
      name: 'Live Shows',
      icon: '🎭',
      description: 'Theatre plays and live performances'
    },
    {
      id: 'concerts',
      name: 'Concerts',
      icon: '🎶',
      description: 'Music concerts and live performances'
    },
    {
      id: 'sports',
      name: 'Sports',
      icon: '🏏',
      description: 'Cricket, football and other sports events'
    },
    {
      id: 'parks',
      name: 'Amusement Parks',
      icon: '🎢',
      description: 'Theme parks and adventure experiences'
    },
    {
      id: 'festivals',
      name: 'Festivals & Exhibitions',
      icon: '🛍️',
      description: 'Cultural festivals and exhibitions'
    }
  ]

  // Sample data for other categories with working poster URLs
  const entertainmentData = {
    shows: [
      {
        id: "show1",
        title: "Hamilton - The Musical",
        description: "The revolutionary musical about Alexander Hamilton, America's founding father.",
        genre: ["Musical", "Drama"],
        duration: 165,
        rating: 9.2,
        poster: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=450&fit=crop&crop=center",
        venue: "National Theatre",
        showtimes: [
          { time: "7:00 PM", price: 800 },
          { time: "2:00 PM", price: 600 }
        ],
        year: "2024",
        director: "Thomas Kail",
        category: "shows"
      },
      {
        id: "show2",
        title: "The Lion King Musical",
        description: "Disney's award-winning musical brings the Pride Lands to life with stunning costumes and music.",
        genre: ["Musical", "Family"],
        duration: 150,
        rating: 8.9,
        poster:  "https://images.unsplash.com/photo-1552410260-0fd9b577afa6?w=800&h=600&fit=crop",
        venue: "Broadway Theatre",
        showtimes: [
          { time: "8:00 PM", price: 900 },
          { time: "3:00 PM", price: 700 }
        ],
        year: "2024",
        director: "Julie Taymor",
        category: "shows"
      },
      {
        id: "show3",
        title: "Romeo and Juliet",
        description: "Shakespeare's timeless tale of love and tragedy performed by acclaimed actors.",
        genre: ["Drama", "Classic"],
        duration: 140,
        rating: 8.7,
        poster: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=300&h=450&fit=crop&crop=center",
        venue: "Royal Theatre",
        showtimes: [
          { time: "7:30 PM", price: 650 },
          { time: "2:30 PM", price: 500 }
        ],
        year: "2024",
        director: "Kenneth Branagh",
        category: "shows"
      }
    ],
    concerts: [
      {
        id: "concert1",
        title: "AR Rahman Live",
        description: "The Mozart of Madras performs his greatest hits live with a full orchestra.",
        genre: ["Classical", "Bollywood"],
        duration: 180,
        rating: 9.5,
        poster: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=450&fit=crop&crop=center",
        venue: "Wembley Stadium",
        showtimes: [
          { time: "8:00 PM", price: 1200 },
          { time: "6:00 PM", price: 1000 }
        ],
        year: "2024",
        director: "AR Rahman",
        category: "concerts"
      },
      {
        id: "concert2",
        title: "Coldplay World Tour",
        description: "British rock band's spectacular world tour with stunning visuals and pyrotechnics.",
        genre: ["Rock", "Pop"],
        duration: 120,
        rating: 9.1,
        poster: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&h=450&fit=crop&crop=center",
        venue: "Madison Square Garden",
        showtimes: [
          { time: "9:00 PM", price: 1500 },
          { time: "7:00 PM", price: 1200 }
        ],
        year: "2024",
        director: "Coldplay",
        category: "concerts"
      }
    ],
    sports: [
      {
        id: "sport1",
        title: "India vs Australia ODI",
        description: "Thrilling One Day International cricket match between two cricket powerhouses.",
        genre: ["Cricket", "International"],
        duration: 480,
        rating: 8.7,
        poster: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=300&h=450&fit=crop&crop=center",
        venue: "Wankhede Stadium",
        showtimes: [
          { time: "2:30 PM", price: 500 },
          { time: "9:30 AM", price: 300 }
        ],
        year: "2024",
        director: "BCCI",
        category: "sports"
      },
      {
        id: "sport2",
        title: "Premier League Final",
        description: "The ultimate football championship final match with the best teams in England.",
        genre: ["Football", "Championship"],
        duration: 120,
        rating: 9.0,
        poster: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&h=450&fit=crop&crop=center",
        venue: "Emirates Stadium",
        showtimes: [
          { time: "8:00 PM", price: 800 },
          { time: "5:00 PM", price: 600 }
        ],
        year: "2024",
        director: "Premier League",
        category: "sports"
      }
    ],
    parks: [
      {
        id: "park1",
        title: "Wonderla Bangalore",
        description: "India's premier amusement park with thrilling rides and water attractions for all ages.",
        genre: ["Adventure", "Family"],
        duration: 600,
        rating: 8.5,
        poster: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=300&h=450&fit=crop&crop=center",
        venue: "Wonderla Bangalore",
        showtimes: [
          { time: "10:00 AM", price: 800 },
          { time: "2:00 PM", price: 600 }
        ],
        year: "2024",
        director: "Wonderla Holidays",
        category: "parks"
      },
      {
        id: "park2",
        title: "Imagica Theme Park",
        description: "Magical theme park with world-class rides, shows and entertainment for the whole family.",
        genre: ["Adventure", "Fantasy"],
        duration: 720,
        rating: 8.8,
        poster: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=300&h=450&fit=crop&crop=center",
        venue: "Adlabs Imagica",
        showtimes: [
          { time: "9:00 AM", price: 1000 },
          { time: "1:00 PM", price: 800 }
        ],
        year: "2024",
        director: "Adlabs Entertainment",
        category: "parks"
      }
    ],
    festivals: [
      {
        id: "festival1",
        title: "Diwali Mela 2024",
        description: "Grand celebration of lights with cultural performances, food stalls and shopping.",
        genre: ["Cultural", "Festival"],
        duration: 360,
        rating: 8.6,
        poster:  "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&h=600&fit=crop",
        venue: "India Gate Grounds",
        showtimes: [
          { time: "6:00 PM", price: 200 },
          { time: "4:00 PM", price: 150 }
        ],
        year: "2024",
        director: "Delhi Tourism",
        category: "festivals"
      },
      {
        id: "festival2",
        title: "Comic Con India",
        description: "India's biggest pop culture convention with celebrities, exhibitions and cosplay competitions.",
        genre: ["Entertainment", "Exhibition"],
        duration: 480,
        rating: 9.0,
        poster:" https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=600&fit=crop",
        venue: "NSCI Dome",
        showtimes: [
          { time: "10:00 AM", price: 400 },
          { time: "2:00 PM", price: 350 }
        ],
        year: "2024",
        director: "Comic Con India",
        category: "festivals"
      }
    ]
  }

  useEffect(() => {
    if (activeCategory === 'movies') {
      loadMovies()
    } else {
      setLoading(false)
    }
  }, [activeCategory])

  const loadMovies = async () => {
    setLoading(true)
    setError('')

    let result = await getMovies()
    
    if (result.success && result.data.length === 0) {
      const initResult = await initializeSampleMovies()
      if (initResult.success) {
        result = await getMovies()
      }
    }

    if (result.success) {
      setMovies(result.data)
    } else {
      setError(result.message)
    }
    
    setLoading(false)
  }

  // FIXED: Handle booking for different categories
  const handleBookNow = (item, category = 'movies') => {
    if (category === 'movies') {
      navigate(`/movie/${item.id}`)
    } else {
      // For other categories, navigate to a unified entertainment booking page
      navigate(`/entertainment/${category}/${item.id}`, { 
        state: { 
          item: item, 
          category: category 
        } 
      })
    }
  }

  const getCurrentData = () => {
    if (activeCategory === 'movies') {
      return movies
    }
    return entertainmentData[activeCategory] || []
  }

  const formatDuration = (duration) => {
    if (duration >= 60) {
      const hours = Math.floor(duration / 60)
      const minutes = duration % 60
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }
    return `${duration}m`
  }

  if (loading) {
    return (
      <div className="app-container">
        <Container className="text-center py-5">
          <Spinner animation="border" role="status" style={{ color: '#3182ce' }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading entertainment options...</p>
        </Container>
      </div>
    )
  }

  return (
    <div className="app-container">
      <Container className="py-5">
        {/* Hero Section */}
        <div className="text-center mb-5 fade-in-up">
          <h1 className="display-3 fw-bold mb-3">
  <span className="plain-emoji" role="img" aria-label="circus">🎪</span>
  <span className="gradient-text">Entertainment Hub</span>
</h1>

          <p className="lead text-light opacity-75">
            Your one-stop destination for all entertainment experiences
          </p>
        </div>

        {/* Category Navigation */}
        <div className="mb-5">
          <Nav variant="pills" className="justify-content-center flex-wrap">
            {categories.map((category) => (
              <Nav.Item key={category.id} className="mb-2">
                <Nav.Link
                  active={activeCategory === category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`mx-2 px-4 py-3 rounded-pill ${
                    activeCategory === category.id 
                      ? 'bg-primary text-white' 
                      : 'bg-dark text-light border border-secondary'
                  }`}
                  style={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    minWidth: '150px'
                  }}
                >
                  <div className="text-center">
                    <div style={{ fontSize: '1.5rem' }}>{category.icon}</div>
                    <div className="fw-semibold">{category.name}</div>
                  </div>
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </div>

        {/* Category Description */}
        <div className="text-center mb-4">
          <h3 className="text-light mb-2">
            {categories.find(cat => cat.id === activeCategory)?.icon} {' '}
            {categories.find(cat => cat.id === activeCategory)?.name}
          </h3>
          <p className="text-muted">
            {categories.find(cat => cat.id === activeCategory)?.description}
          </p>
        </div>

        {/* Error Display */}
        {error && activeCategory === 'movies' && (
          <Alert variant="danger">
            <Alert.Heading>Error Loading {categories.find(cat => cat.id === activeCategory)?.name}</Alert.Heading>
            <p>{error}</p>
            <Button variant="outline-danger" onClick={loadMovies}>
              <i className="fas fa-redo me-2"></i>
              Try Again
            </Button>
          </Alert>
        )}

        {/* Content Grid */}
        <Row className="g-4">
          {getCurrentData().map((item, index) => (
            <Col key={item.id} lg={4} md={6} className="fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <Card className="movie-card h-100">
                <div className="position-relative overflow-hidden">
                  <Card.Img 
                    variant="top" 
                    src={item.poster} 
                    alt={item.title}
                    className="movie-poster"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/300x400/1a2332/ffffff?text=${encodeURIComponent(item.title)}`
                    }}
                  />
                  <div className="position-absolute top-0 end-0 m-3">
                    <Badge className="movie-rating">
                      <i className="fas fa-star me-1"></i>
                      {item.rating}
                    </Badge>
                  </div>
                  <div className="position-absolute top-0 start-0 m-3">
                    <Badge bg="info" className="category-badge">
                      {categories.find(cat => cat.id === activeCategory)?.icon}
                    </Badge>
                  </div>
                </div>
                
                <Card.Body className="movie-info d-flex flex-column">
                  <div className="mb-3">
                    <Badge className="movie-genre me-2">
                      {Array.isArray(item.genre) ? item.genre[0] : item.genre}
                    </Badge>
                    <small className="text-muted">
                      {item.year} • {formatDuration(item.duration)}
                    </small>
                  </div>
                  
                  <Card.Title className="movie-title">{item.title}</Card.Title>
                  <Card.Text className="movie-description flex-grow-1">
                    {item.description}
                  </Card.Text>
                  
                  <div className="movie-details mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small><strong>
                        {activeCategory === 'movies' ? 'Director:' : 
                         activeCategory === 'sports' ? 'Organizer:' : 
                         activeCategory === 'parks' ? 'Operator:' : 
                         activeCategory === 'concerts' ? 'Artist:' : 'Venue:'}
                      </strong> {item.director || item.venue}</small>
                      <small><strong>₹{item.showtimes?.[0]?.price || 'N/A'}</strong>/ticket</small>
                    </div>
                    
                    <div className="mb-2">
                      <small className="d-block mb-1"><strong>
                        {activeCategory === 'movies' ? 'Showtimes:' : 
                         activeCategory === 'parks' ? 'Entry Times:' : 
                         activeCategory === 'festivals' ? 'Event Times:' : 'Timings:'}
                      </strong></small>
                      <div className="d-flex flex-wrap gap-1">
                        {item.showtimes?.map((showtime, index) => (
                          <span key={index} className="showtime-badge">
                            {showtime.time}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="book-now-btn mt-auto"
                    onClick={() => handleBookNow(item, activeCategory)}
                  >
                    <i className="fas fa-ticket-alt me-2"></i>
                    Book Now
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Empty State */}
        {getCurrentData().length === 0 && !loading && !error && (
          <div className="text-center py-5">
            <div style={{ fontSize: '4rem' }}>
              {categories.find(cat => cat.id === activeCategory)?.icon}
            </div>
            <h4 className="mt-3 text-muted">Coming Soon!</h4>
            <p className="text-muted">
              {categories.find(cat => cat.id === activeCategory)?.name} will be available soon.
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="text-center mt-5 fade-in-up">
          <p className="text-muted">
            <i className="fas fa-shield-alt me-2"></i>
            Secure payments • Premium experiences • 24/7 support
          </p>
        </div>
      </Container>
    </div>
  )
}

export default Home
