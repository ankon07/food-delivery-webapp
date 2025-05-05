import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCreditCard, FaMoneyBill, FaMapMarkerAlt } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createOrder, createBkashPayment } from '../services/orderService';
import { PaymentMethod, CreateOrderData } from '../types/models';

interface CheckoutPageProps {
  isCanteenOpen: boolean;
}

const DELIVERY_LOCATIONS = [
  'Main Building',
  'Science Building',
  'Engineering Building',
  'Business Building',
  'Library',
  'Student Center',
  'Cafeteria Pickup'
];

const CheckoutPage = ({ isCanteenOpen }: CheckoutPageProps) => {
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [deliveryLocation, setDeliveryLocation] = useState<string>(DELIVERY_LOCATIONS[0]);
  const [customLocation, setCustomLocation] = useState<string>('');
  const [isCustomLocation, setIsCustomLocation] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Redirect if cart is empty or canteen is closed
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
    
    if (!isCanteenOpen) {
      navigate('/');
    }
  }, [items, isCanteenOpen, navigate]);
  
  const getSelectedLocation = () => {
    return isCustomLocation ? customLocation : deliveryLocation;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }
    
    const selectedLocation = getSelectedLocation();
    
    if (!selectedLocation.trim()) {
      setError('Please select a delivery location');
      return;
    }
    
    try {
      setError(null);
      setIsLoading(true);
      
      // Prepare order data
      const orderData: CreateOrderData = {
        items: items.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity
        })),
        deliveryLocation: selectedLocation,
        paymentMethod
      };
      
      // Create order
      const order = await createOrder(orderData);
      
      // If payment method is bKash, redirect to bKash payment page
      if (paymentMethod === 'BKASH') {
        const paymentResponse = await createBkashPayment(order.id);
        
        // Clear cart before redirecting to bKash
        clearCart();
        
        // Redirect to bKash payment page
        window.location.href = paymentResponse.bkashURL;
      } else {
        // For cash payment, clear cart and redirect to order details
        clearCart();
        navigate(`/orders/${order.id}`, { state: { newOrder: true } });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (items.length === 0 || !isCanteenOpen) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <Container className="py-4">
      <h1 className="mb-4">Checkout</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col lg={8} className="mb-4">
            <Card className="shadow-sm mb-4">
              <Card.Header>
                <h4 className="mb-0">Delivery Information</h4>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaMapMarkerAlt className="me-2" />
                    Delivery Location
                  </Form.Label>
                  
                  <div className="mb-3">
                    <Form.Check
                      type="radio"
                      id="predefined-location"
                      label="Choose from common locations"
                      checked={!isCustomLocation}
                      onChange={() => setIsCustomLocation(false)}
                      className="mb-2"
                    />
                    
                    {!isCustomLocation && (
                      <Form.Select
                        value={deliveryLocation}
                        onChange={(e) => setDeliveryLocation(e.target.value)}
                        disabled={isCustomLocation || isLoading}
                      >
                        {DELIVERY_LOCATIONS.map((location) => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ))}
                      </Form.Select>
                    )}
                  </div>
                  
                  <div>
                    <Form.Check
                      type="radio"
                      id="custom-location"
                      label="Specify another location"
                      checked={isCustomLocation}
                      onChange={() => setIsCustomLocation(true)}
                      className="mb-2"
                    />
                    
                    {isCustomLocation && (
                      <Form.Control
                        type="text"
                        placeholder="Enter your specific location on campus"
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        disabled={!isCustomLocation || isLoading}
                        required={isCustomLocation}
                      />
                    )}
                  </div>
                </Form.Group>
              </Card.Body>
            </Card>
            
            <Card className="shadow-sm">
              <Card.Header>
                <h4 className="mb-0">Payment Method</h4>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6} className="mb-3">
                    <Card
                      className={`payment-method-card h-100 ${paymentMethod === 'BKASH' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('BKASH')}
                    >
                      <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                        <div className="mb-3">
                          <img
                            src="https://www.bkash.com/sites/all/themes/bkash/logo.png"
                            alt="bKash"
                            height="40"
                          />
                        </div>
                        <Form.Check
                          type="radio"
                          id="bkash-payment"
                          label="Pay with bKash"
                          checked={paymentMethod === 'BKASH'}
                          onChange={() => setPaymentMethod('BKASH')}
                          className="mb-2"
                        />
                        <p className="text-muted small text-center mb-0">
                          Pay securely using your bKash account
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={6} className="mb-3">
                    <Card
                      className={`payment-method-card h-100 ${paymentMethod === 'CASH' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('CASH')}
                    >
                      <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                        <div className="mb-3 text-success">
                          <FaMoneyBill size={40} />
                        </div>
                        <Form.Check
                          type="radio"
                          id="cash-payment"
                          label="Cash on Delivery"
                          checked={paymentMethod === 'CASH'}
                          onChange={() => setPaymentMethod('CASH')}
                          className="mb-2"
                        />
                        <p className="text-muted small text-center mb-0">
                          Pay with cash when your order is delivered
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4}>
            <Card className="shadow-sm cart-summary">
              <Card.Header>
                <h4 className="mb-0">Order Summary</h4>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush" className="mb-3">
                  {items.map((item) => (
                    <ListGroup.Item key={item.menuItem.id} className="d-flex justify-content-between align-items-center px-0">
                      <div>
                        <span>{item.menuItem.name}</span>
                        <span className="text-muted ms-2">x{item.quantity}</span>
                      </div>
                      <span>৳{item.menuItem.price * item.quantity}</span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>৳{totalAmount}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Delivery Fee:</span>
                  <span>৳0</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-4">
                  <strong>Total:</strong>
                  <strong>৳{totalAmount}</strong>
                </div>
                
                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCreditCard className="me-2" />
                        Place Order
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/cart')}
                    disabled={isLoading}
                  >
                    <FaArrowLeft className="me-2" />
                    Back to Cart
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default CheckoutPage;
