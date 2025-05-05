import { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const LoginPage = () => {
  const [universityId, setUniversityId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default to home
  const from = (location.state as LocationState)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!universityId.trim()) {
      setError('University ID is required');
      return;
    }
    
    if (!password) {
      setError('Password is required');
      return;
    }
    
    try {
      setError(null);
      setIsLoading(true);
      
      // Call login from auth context
      await login(universityId, password);
      
      // Redirect to the page they were trying to access or home
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6} xl={5}>
          <Card className="shadow auth-form">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2>Login</h2>
                <p className="text-muted">Sign in to your account</p>
              </div>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="universityId">
                  <Form.Label>University ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your university ID"
                    value={universityId}
                    onChange={(e) => setUniversityId(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-4" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </Form.Group>
                
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mb-3"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : (
                    <>
                      <FaSignInAlt className="me-2" />
                      Login
                    </>
                  )}
                </Button>
                
                <div className="text-center">
                  <p>
                    Don't have an account?{' '}
                    <Link to="/register" className="text-decoration-none">
                      <FaUserPlus className="me-1" />
                      Register
                    </Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
