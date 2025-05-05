import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHome, FaUtensils, FaShoppingCart } from 'react-icons/fa';

const NotFoundPage = () => {
  return (
    <Container className="py-5 text-center">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="mb-4">
            <span style={{ fontSize: '8rem', color: '#dc3545' }}>404</span>
          </div>
          <h1 className="mb-4">Page Not Found</h1>
          <p className="lead mb-5">
            Oops! The page you are looking for doesn't exist or has been moved.
          </p>
          <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
            <Link to="/">
              <Button variant="primary" size="lg" className="mb-2 mb-md-0">
                <FaHome className="me-2" />
                Go to Home
              </Button>
            </Link>
            <Link to="/menu">
              <Button variant="outline-primary" size="lg" className="mb-2 mb-md-0">
                <FaUtensils className="me-2" />
                Browse Menu
              </Button>
            </Link>
            <Link to="/cart">
              <Button variant="outline-primary" size="lg">
                <FaShoppingCart className="me-2" />
                Go to Cart
              </Button>
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFoundPage;
