import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer mt-auto py-4 bg-dark text-white">
      <Container>
        <Row className="mb-4">
          <Col md={4} className="mb-4 mb-md-0">
            <h5>University Canteen</h5>
            <p className="text-muted">
              Providing delicious meals to university students and staff. Order online and enjoy your food at the canteen or get it delivered to your location on campus.
            </p>
          </Col>
          <Col md={4} className="mb-4 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-decoration-none text-light">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/menu" className="text-decoration-none text-light">Menu</Link>
              </li>
              <li className="mb-2">
                <Link to="/cart" className="text-decoration-none text-light">Cart</Link>
              </li>
              <li className="mb-2">
                <Link to="/orders" className="text-decoration-none text-light">Orders</Link>
              </li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Contact Us</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <FaMapMarkerAlt className="me-2" />
                University Campus, Building 3, Floor 1
              </li>
              <li className="mb-2">
                <FaPhone className="me-2" />
                +880 1234-567890
              </li>
              <li className="mb-2">
                <FaEnvelope className="me-2" />
                canteen@university.edu
              </li>
              <li className="mt-3">
                <a href="https://facebook.com" className="text-light me-3" aria-label="Facebook">
                  <FaFacebook size={24} />
                </a>
                <a href="https://twitter.com" className="text-light me-3" aria-label="Twitter">
                  <FaTwitter size={24} />
                </a>
                <a href="https://instagram.com" className="text-light" aria-label="Instagram">
                  <FaInstagram size={24} />
                </a>
              </li>
            </ul>
          </Col>
        </Row>
        <hr className="my-3 bg-secondary" />
        <Row>
          <Col className="text-center">
            <p className="mb-0">
              &copy; {currentYear} University Canteen. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
