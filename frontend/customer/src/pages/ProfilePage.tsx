import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaUser, FaHistory, FaSignOutAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserOrders } from '../services/orderService';
import { Order } from '../types/models';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setIsLoading(true);
        const ordersData = await getUserOrders();
        
        // Sort orders by creation date (newest first) and take only the 3 most recent
        const sortedOrders = [...ordersData]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
        
        setRecentOrders(sortedOrders);
      } catch (err) {
        setError('Failed to fetch recent orders');
        console.error('Error fetching recent orders:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecentOrders();
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  if (!user) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">
          You need to be logged in to view your profile.
        </Alert>
        <Link to="/login">
          <Button variant="primary">Go to Login</Button>
        </Link>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <h1 className="mb-4">My Profile</h1>
      
      <Row>
        <Col lg={4} className="mb-4">
          <Card className="shadow-sm profile-section">
            <Card.Body>
              <div className="profile-header">
                <div className="profile-avatar">
                  <FaUser size={40} />
                </div>
                <div>
                  <h3>{user.name}</h3>
                  <p className="text-muted mb-0">{user.email}</p>
                </div>
              </div>
              
              <hr />
              
              <div className="mb-3">
                <strong>University ID:</strong>
                <span className="ms-2">{user.universityId}</span>
              </div>
              
              <div className="mb-3">
                <strong>Account Type:</strong>
                <span className="ms-2">{user.role}</span>
              </div>
              
              <div className="mb-3">
                <strong>Member Since:</strong>
                <span className="ms-2">{formatDate(user.createdAt)}</span>
              </div>
              
              <div className="d-grid gap-2 mt-4">
                <Button variant="outline-danger" onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" />
                  Logout
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={8}>
          <Card className="shadow-sm profile-section mb-4">
            <Card.Header>
              <h4 className="mb-0">Account Information</h4>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="name">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={user.name}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="universityId">
                      <Form.Label>University ID</Form.Label>
                      <Form.Control
                        type="text"
                        value={user.universityId}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="email">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={user.email}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="role">
                      <Form.Label>Role</Form.Label>
                      <Form.Control
                        type="text"
                        value={user.role}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <div className="alert alert-info">
                  <small>
                    Note: To update your account information, please contact the canteen administration.
                  </small>
                </div>
              </Form>
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm profile-section">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Recent Orders</h4>
              <Link to="/orders">
                <Button variant="outline-primary" size="sm">
                  <FaHistory className="me-1" />
                  View All Orders
                </Button>
              </Link>
            </Card.Header>
            <Card.Body>
              {isLoading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-3">
                  <p className="mb-0">You haven't placed any orders yet.</p>
                </div>
              ) : (
                <div className="list-group">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      to={`/orders/${order.id}`}
                      className="list-group-item list-group-item-action"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">Order #{order.id.substring(0, 8)}</h5>
                        <small>{formatDate(order.createdAt)}</small>
                      </div>
                      <p className="mb-1">
                        {order.orderItems.length} item(s) - Total: ৳{order.totalAmount}
                      </p>
                      <small className="text-muted">
                        Status: {order.status} | Payment: {order.paymentStatus}
                      </small>
                    </Link>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;
