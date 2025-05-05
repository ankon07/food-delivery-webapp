import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEye, FaHistory, FaExclamationTriangle } from 'react-icons/fa';
import { getUserOrders } from '../services/orderService';
import { Order, OrderStatus } from '../types/models';
import { useSocket } from '../contexts/SocketContext';

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

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { orderUpdates, clearOrderUpdates } = useSocket();
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const ordersData = await getUserOrders();
        
        // Sort orders by creation date (newest first)
        const sortedOrders = [...ordersData].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setOrders(sortedOrders);
      } catch (err) {
        setError('Failed to fetch orders. Please try again later.');
        console.error('Error fetching orders:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
    
    // Clear order updates when component unmounts
    return () => {
      clearOrderUpdates();
    };
  }, [clearOrderUpdates]);
  
  // Update orders when receiving real-time updates
  useEffect(() => {
    if (orderUpdates.length > 0) {
      setOrders((prevOrders) => {
        const updatedOrders = [...prevOrders];
        
        orderUpdates.forEach((updatedOrder) => {
          const index = updatedOrders.findIndex((order) => order.id === updatedOrder.id);
          
          if (index !== -1) {
            updatedOrders[index] = updatedOrder;
          } else {
            updatedOrders.unshift(updatedOrder);
          }
        });
        
        // Sort orders by creation date (newest first)
        return updatedOrders.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
      
      // Clear order updates after processing
      clearOrderUpdates();
    }
  }, [orderUpdates, clearOrderUpdates]);
  
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
  
  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <h1 className="mb-4">My Orders</h1>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          <FaExclamationTriangle className="me-2" />
          {error}
        </Alert>
      )}
      
      {orders.length === 0 ? (
        <Card className="text-center p-5 shadow-sm">
          <Card.Body>
            <FaHistory size={50} className="text-muted mb-3" />
            <h3>No Orders Yet</h3>
            <p className="text-muted mb-4">You haven't placed any orders yet.</p>
            <Link to="/menu">
              <Button variant="primary" size="lg">
                Browse Menu
              </Button>
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {orders.map((order) => (
            <Col key={order.id} lg={6} className="mb-4">
              <Card className="shadow-sm order-card">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Order #{order.id.substring(0, 8)}</h5>
                  <Badge bg={getStatusBadgeVariant(order.status)} className="order-status-badge">
                    {getStatusText(order.status)}
                  </Badge>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <small className="text-muted">Placed on {formatDate(order.createdAt)}</small>
                  </div>
                  
                  <div className="mb-3">
                    <strong>Items:</strong>
                    <ul className="list-unstyled mt-1">
                      {order.orderItems.map((item) => (
                        <li key={item.id} className="d-flex justify-content-between">
                          <span>
                            {item.menuItem?.name || 'Unknown Item'} x{item.quantity}
                          </span>
                          <span>৳{item.priceAtOrderTime * item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-2">
                    <strong>Total:</strong>
                    <strong>৳{order.totalAmount}</strong>
                  </div>
                  
                  <div className="mb-3">
                    <strong>Delivery Location:</strong>
                    <span className="ms-2">{order.deliveryLocation}</span>
                  </div>
                  
                  <div className="mb-3">
                    <strong>Payment Method:</strong>
                    <span className="ms-2">{order.paymentMethod}</span>
                    <Badge
                      bg={getPaymentStatusBadgeVariant(order.paymentStatus)}
                      className="ms-2"
                    >
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </Card.Body>
                <Card.Footer className="text-end">
                  <Link to={`/orders/${order.id}`}>
                    <Button variant="outline-primary" size="sm">
                      <FaEye className="me-1" />
                      View Details
                    </Button>
                  </Link>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default OrdersPage;
