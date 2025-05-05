import { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Table, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaArrowLeft, FaShoppingCart, FaCreditCard } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface CartPageProps {
  isCanteenOpen: boolean;
}

const CartPage = ({ isCanteenOpen }: CartPageProps) => {
  const { items, removeItem, updateQuantity, clearCart, totalAmount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showEmptyCartAlert, setShowEmptyCartAlert] = useState(false);

  const handleQuantityChange = (menuItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(menuItemId, newQuantity);
  };

  const handleRemoveItem = (menuItemId: string) => {
    removeItem(menuItemId);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      setShowEmptyCartAlert(true);
      setTimeout(() => setShowEmptyCartAlert(false), 3000);
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    navigate('/checkout');
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Your Cart</h1>

      {showEmptyCartAlert && (
        <Alert variant="warning" onClose={() => setShowEmptyCartAlert(false)} dismissible>
          Your cart is empty. Please add some items before proceeding to checkout.
        </Alert>
      )}

      {!isCanteenOpen && (
        <Alert variant="warning" className="mb-4">
          <strong>Note:</strong> The canteen is currently closed. You can still view your cart, but
          you won't be able to place an order until the canteen reopens.
        </Alert>
      )}

      {items.length === 0 ? (
        <Card className="text-center p-5 shadow-sm">
          <Card.Body>
            <FaShoppingCart size={50} className="text-muted mb-3" />
            <h3>Your cart is empty</h3>
            <p className="text-muted mb-4">Looks like you haven't added any items to your cart yet.</p>
            <Link to="/menu">
              <Button variant="primary" size="lg">
                Browse Menu
              </Button>
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          <Col lg={8} className="mb-4">
            <Card className="shadow-sm">
              <Card.Body>
                <Table responsive className="mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: '100px' }}>Image</th>
                      <th>Item</th>
                      <th style={{ width: '150px' }}>Price</th>
                      <th style={{ width: '180px' }}>Quantity</th>
                      <th style={{ width: '150px' }}>Subtotal</th>
                      <th style={{ width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.menuItem.id}>
                        <td>
                          <Image
                            src={item.menuItem.imageUrl || 'https://via.placeholder.com/80x80?text=Food'}
                            alt={item.menuItem.name}
                            width={80}
                            height={80}
                            className="rounded"
                            style={{ objectFit: 'cover' }}
                          />
                        </td>
                        <td>
                          <h5>{item.menuItem.name}</h5>
                          <p className="text-muted small mb-0">{item.menuItem.description.substring(0, 50)}...</p>
                        </td>
                        <td>৳{item.menuItem.price}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleQuantityChange(item.menuItem.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <FaMinus />
                            </Button>
                            <Form.Control
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.menuItem.id, parseInt(e.target.value) || 1)}
                              className="mx-2 text-center"
                              style={{ width: '60px' }}
                            />
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleQuantityChange(item.menuItem.id, item.quantity + 1)}
                            >
                              <FaPlus />
                            </Button>
                          </div>
                        </td>
                        <td>
                          <strong>৳{item.menuItem.price * item.quantity}</strong>
                        </td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveItem(item.menuItem.id)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
              <Card.Footer className="d-flex justify-content-between">
                <Button variant="outline-secondary" onClick={() => navigate('/menu')}>
                  <FaArrowLeft className="me-2" />
                  Continue Shopping
                </Button>
                <Button variant="outline-danger" onClick={clearCart}>
                  <FaTrash className="me-2" />
                  Clear Cart
                </Button>
              </Card.Footer>
            </Card>
          </Col>
          <Col lg={4}>
            <Card className="shadow-sm cart-summary">
              <Card.Body>
                <h4 className="mb-4">Order Summary</h4>
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
                <Button
                  variant="primary"
                  size="lg"
                  className="w-100"
                  onClick={handleCheckout}
                  disabled={!isCanteenOpen || items.length === 0}
                >
                  <FaCreditCard className="me-2" />
                  Proceed to Checkout
                </Button>
                {!isCanteenOpen && (
                  <p className="text-danger mt-2 small">
                    Checkout is disabled because the canteen is currently closed.
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default CartPage;
