import { useEffect, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Button, ListGroup } from 'react-bootstrap';
import { FaArrowLeft, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaCreditCard } from 'react-icons/fa';
import { getOrderById, cancelOrder, createBkashPayment } from '../services/orderService';
import { Order, OrderStatus } from '../types/models';
import { useSocket } from '../contexts/SocketContext';

interface LocationState {
  newOrder?: boolean;
}

const getStatusBadgeVariant = (status: OrderStatus): string => {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'CONFIRMED':
      return 'info';
    case 'PREPARING':
      return 'primary';
    case 'READY_FOR_PICKUP':
      return 'success';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'danger';
    default:
      return 'secondary';
  }
};

const getStatusText = (status: OrderStatus): string => {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'PREPARING':
      return 'Preparing';
    case 'READY_FOR_PICKUP':
      return 'Ready for Pickup';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
};

const getPaymentStatusBadgeVariant = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'COMPLETED':
      return 'success';
    case 'FAILED':
      return 'danger';
    default:
      return 'secondary';
  }
};

const OrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { newOrder } = (location.state as LocationState) || {};
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [isRetryingPayment, setIsRetryingPayment] = useState<boolean>(false);
  const { orderUpdates } = useSocket();
  
  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const orderData = await getOrderById(id);
        setOrder(orderData);
      } catch (err) {
        setError('Failed to fetch order details. Please try again later.');
        console.error('Error fetching order details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrder();
  }, [id]);
  
  // Update order when receiving real-time updates
  useEffect(() => {
    if (orderUpdates.length > 0 && order) {
      const updatedOrder = orderUpdates.find((update) => update.id === order.id);
      
      if (updatedOrder) {
        setOrder(updatedOrder);
      }
    }
  }, [orderUpdates, order]);
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const handleCancelOrder = async () => {
    if (!order || !id) return;
    
    try {
      setIsCancelling(true);
      const updatedOrder = await cancelOrder(id);
      setOrder(updatedOrder);
    } catch (err) {
      setError('Failed to cancel order. Please try again later.');
      console.error('Error cancelling order:', err);
    } finally {
      setIsCancelling(false);
    }
  };
  
  const handleRetryPayment = async () => {
    if (!order || !id) return;
    
    try {
      setIsRetryingPayment(true);
      const paymentResponse = await createBkashPayment(id);
      
      // Redirect to bKash payment page
      window.location.href = paymentResponse.bkashURL;
    } catch (err) {
      setError('Failed to initiate payment. Please try again later.');
      console.error('Error initiating payment:', err);
      setIsRetryingPayment(false);
    }
  };
  
  const canCancelOrder = (order: Order): boolean => {
    return order.status === 'PENDING' || order.status === 'CONFIRMED';
  };
  
  const canRetryPayment = (order: Order): boolean => {
    return (
      order.paymentMethod === 'BKASH' &&
      order.paymentStatus === 'PENDING' &&
      (order.status === 'PENDING' || order.status === 'CONFIRMED')
    );
  };
  
  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger" className="mb-4">
          <FaExclamationTriangle className="me-2" />
          {error}
        </Alert>
        <Button variant="outline-primary" onClick={() => navigate('/orders')}>
          <FaArrowLeft className="me-2" />
          Back to Orders
        </Button>
      </Container>
    );
  }
  
  if (!order) {
    return (
      <Container className="py-4">
        <Alert variant="warning" className="mb-4">
          <FaExclamationTriangle className="me-2" />
          Order not found
        </Alert>
        <Button variant="outline-primary" onClick={() => navigate('/orders')}>
          <FaArrowLeft className="me-2" />
          Back to Orders
        </Button>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      {newOrder && (
        <Alert variant="success" className="mb-4">
          <FaCheckCircle className="me-2" />
          Your order has been placed successfully!
        </Alert>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Order Details</h1>
        <Badge bg={getStatusBadgeVariant(order.status)} className="order-status-badge">
          {getStatusText(order.status)}
        </Badge>
      </div>
      
      <Row>
        <Col lg={8} className="mb-4">
          <Card className="shadow-sm mb-4">
            <Card.Header>
              <h4 className="mb-0">Order #{order.id.substring(0, 8)}</h4>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <small className="text-muted">Placed on {formatDate(order.createdAt)}</small>
              </div>
              
              <h5 className="mb-3">Items</h5>
              <ListGroup variant="flush" className="mb-4">
                {order.orderItems.map((item) => (
                  <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center px-0">
                    <div>
                      <span className="fw-bold">{item.menuItem?.name || 'Unknown Item'}</span>
                      <span className="text-muted ms-2">x{item.quantity}</span>
                    </div>
                    <span>৳{item.priceAtOrderTime * item.quantity}</span>
                  </ListGroup.Item>
                ))}
                <ListGroup.Item className="d-flex justify-content-between align-items-center px-0">
                  <strong>Total</strong>
                  <strong>৳{order.totalAmount}</strong>
                </ListGroup.Item>
              </ListGroup>
              
              <h5 className="mb-3">Delivery Information</h5>
              <p>
                <strong>Location:</strong> {order.deliveryLocation}
              </p>
              
              <h5 className="mb-3">Payment Information</h5>
              <p>
                <strong>Method:</strong> {order.paymentMethod}
                <Badge
                  bg={getPaymentStatusBadgeVariant(order.paymentStatus)}
                  className="ms-2"
                >
                  {order.paymentStatus}
                </Badge>
              </p>
              
              {order.paymentMethod === 'BKASH' && order.bkashTransactionId && (
                <p>
                  <strong>bKash Transaction ID:</strong> {order.bkashTransactionId}
                </p>
              )}
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm">
            <Card.Header>
              <h4 className="mb-0">Order Status Timeline</h4>
            </Card.Header>
            <Card.Body>
              <div className="order-timeline">
                <div className={`timeline-item ${order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'PREPARING' || order.status === 'READY_FOR_PICKUP' || order.status === 'COMPLETED' ? 'completed' : ''}`}>
                  <h5>Order Placed</h5>
                  <p className="text-muted">{formatDate(order.createdAt)}</p>
                </div>
                
                {order.status === 'CANCELLED' ? (
                  <div className="timeline-item cancelled">
                    <h5>Order Cancelled</h5>
                    <p className="text-muted">{formatDate(order.updatedAt)}</p>
                  </div>
                ) : (
                  <>
                    <div className={`timeline-item ${order.status === 'CONFIRMED' || order.status === 'PREPARING' || order.status === 'READY_FOR_PICKUP' || order.status === 'COMPLETED' ? 'completed' : order.status === 'PENDING' ? 'pending' : ''}`}>
                      <h5>Order Confirmed</h5>
                      {order.status === 'CONFIRMED' || order.status === 'PREPARING' || order.status === 'READY_FOR_PICKUP' || order.status === 'COMPLETED' ? (
                        <p className="text-muted">Your order has been confirmed</p>
                      ) : (
                        <p className="text-muted">Waiting for confirmation</p>
                      )}
                    </div>
                    
                    <div className={`timeline-item ${order.status === 'PREPARING' || order.status === 'READY_FOR_PICKUP' || order.status === 'COMPLETED' ? 'completed' : order.status === 'CONFIRMED' ? 'pending' : ''}`}>
                      <h5>Preparing</h5>
                      {order.status === 'PREPARING' || order.status === 'READY_FOR_PICKUP' || order.status === 'COMPLETED' ? (
                        <p className="text-muted">Your order is being prepared</p>
                      ) : order.status === 'CONFIRMED' ? (
                        <p className="text-muted">Waiting to start preparation</p>
                      ) : null}
                    </div>
                    
                    <div className={`timeline-item ${order.status === 'READY_FOR_PICKUP' || order.status === 'COMPLETED' ? 'completed' : order.status === 'PREPARING' ? 'pending' : ''}`}>
                      <h5>Ready for Pickup/Delivery</h5>
                      {order.status === 'READY_FOR_PICKUP' || order.status === 'COMPLETED' ? (
                        <p className="text-muted">Your order is ready</p>
                      ) : order.status === 'PREPARING' ? (
                        <p className="text-muted">Your order will be ready soon</p>
                      ) : null}
                    </div>
                    
                    <div className={`timeline-item ${order.status === 'COMPLETED' ? 'completed' : order.status === 'READY_FOR_PICKUP' ? 'pending' : ''}`}>
                      <h5>Completed</h5>
                      {order.status === 'COMPLETED' ? (
                        <p className="text-muted">Your order has been delivered/picked up</p>
                      ) : order.status === 'READY_FOR_PICKUP' ? (
                        <p className="text-muted">Waiting for pickup/delivery</p>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="shadow-sm mb-4">
            <Card.Header>
              <h4 className="mb-0">Actions</h4>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-3">
                <Button
                  variant="outline-primary"
                  onClick={() => navigate('/orders')}
                >
                  <FaArrowLeft className="me-2" />
                  Back to Orders
                </Button>
                
                {canCancelOrder(order) && (
                  <Button
                    variant="outline-danger"
                    onClick={handleCancelOrder}
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <FaTimesCircle className="me-2" />
                        Cancel Order
                      </>
                    )}
                  </Button>
                )}
                
                {canRetryPayment(order) && (
                  <Button
                    variant="outline-success"
                    onClick={handleRetryPayment}
                    disabled={isRetryingPayment}
                  >
                    {isRetryingPayment ? (
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
                        Retry bKash Payment
                      </>
                    )}
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm">
            <Card.Header>
              <h4 className="mb-0">Need Help?</h4>
            </Card.Header>
            <Card.Body>
              <p>
                If you have any questions or issues with your order, please contact the canteen staff:
              </p>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <strong>Phone:</strong> +880 1234-567890
                </li>
                <li>
                  <strong>Email:</strong> canteen@university.edu
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderDetailsPage;
