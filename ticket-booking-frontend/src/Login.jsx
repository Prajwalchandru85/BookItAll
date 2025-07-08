import React, { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Tabs } from 'react-bootstrap'
import { registerUser, loginUser } from './firebase/auth'

function Login({ onLogin }) {
  const [activeTab, setActiveTab] = useState('login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  })
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    
    if (!formData.email || !formData.password) {
      setMessage('Please enter email and password')
      setMessageType('danger')
      setIsLoading(false)
      return
    }

    const result = await loginUser(formData.email, formData.password)
    
    if (result.success) {
      setMessage(result.message)
      setMessageType('success')
      setTimeout(() => {
        onLogin(result.user)
      }, 1000)
    } else {
      setMessage(result.message)
      setMessageType('danger')
    }
    
    setIsLoading(false)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    
    if (!formData.name || !formData.email || !formData.password) {
      setMessage('Please fill all required fields')
      setMessageType('danger')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters')
      setMessageType('danger')
      setIsLoading(false)
      return
    }

    const result = await registerUser(formData.name, formData.email, formData.password, formData.phone)
    
    if (result.success) {
      setMessage(result.message)
      setMessageType('success')
      setTimeout(() => {
        onLogin(result.user)
      }, 2000)
    } else {
      setMessage(result.message)
      setMessageType('danger')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="login-container">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <Card className="login-card shadow-lg">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                 <h1 className="display-4 fw-bold mb-3 brand-heading">
  <span role="img" aria-label="tickets" className="brand-emoji">🎫</span>
  <span className="gradient-text ms-2">BookItAll</span>
</h1>

                  <p className="text-muted lead">Universal Booking Hub</p>
                </div>

                {message && (
                  <Alert variant={messageType} className="mb-4">
                    <i className={`fas ${messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                    {message}
                  </Alert>
                )}

                <Tabs
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k)}
                  className="mb-4"
                  justify
                >
                  <Tab eventKey="login" title={<><i className="fas fa-sign-in-alt me-2"></i>Login</>}>
                    <Form onSubmit={handleLogin}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-light">
                          <i className="fas fa-envelope me-2"></i>
                          Email Address
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          className="login-form-control"
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold text-light">
                          <i className="fas fa-lock me-2"></i>
                          Password
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter your password"
                          className="login-form-control"
                          required
                        />
                      </Form.Group>

                      <Button 
                        type="submit" 
                        className="login-btn"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <i className="fas fa-spinner fa-spin me-2"></i>
                            Logging in...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-sign-in-alt me-2"></i>
                            Login to BookItAll
                          </>
                        )}
                      </Button>
                    </Form>
                  </Tab>

                  <Tab eventKey="register" title={<><i className="fas fa-user-plus me-2"></i>Register</>}>
                    <Form onSubmit={handleRegister}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-light">
                          <i className="fas fa-user me-2"></i>
                          Full Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className="login-form-control"
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-light">
                          <i className="fas fa-envelope me-2"></i>
                          Email Address
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          className="login-form-control"
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-light">
                          <i className="fas fa-phone me-2"></i>
                          Phone Number
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number"
                          className="login-form-control"
                        />
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold text-light">
                          <i className="fas fa-lock me-2"></i>
                          Password
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Create a password (min 6 chars)"
                          className="login-form-control"
                          required
                        />
                      </Form.Group>

                      <Button 
                        type="submit" 
                        className="login-btn"
                        disabled={isLoading}
                        style={{
                          background: 'linear-gradient(45deg, #38a169, #48bb78)'
                        }}
                      >
                        {isLoading ? (
                          <>
                            <i className="fas fa-spinner fa-spin me-2"></i>
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-user-plus me-2"></i>
                            Create Account
                          </>
                        )}
                      </Button>
                    </Form>
                  </Tab>
                </Tabs>

                <div className="text-center mt-4">
                  <div className="border-top border-secondary pt-3">
                    <small className="text-muted">
                      <i className="fas fa-shield-alt me-2"></i>
                      Secure authentication powered by Firebase
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Login
