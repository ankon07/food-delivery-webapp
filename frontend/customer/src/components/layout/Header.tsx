import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Navbar, Container, Nav, Badge, Button, Offcanvas } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaHistory, FaHome, FaUtensils } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

interface HeaderProps {
  isCanteenOpen: boolean;
}

const Header = ({ isCanteenOpen }: HeaderProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowOffcanvas(false);
  };

  const handleCloseOffcanvas = () => setShowOffcanvas(false);
  const handleShowOffcanvas = () => setShowOffcanvas(true);

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="mb-3">
      <Container>
        <Navbar.Brand as={Link} to="/">
          University Canteen
          {!isCanteenOpen && (
            <Badge bg="warning" className="ms-2">
              Closed
            </Badge>
          )}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={handleShowOffcanvas} />
        <Navbar.Offcanvas
          id="basic-navbar-offcanvas"
          aria-labelledby="basic-navbar-offcanvas-label"
          placement="end"
          show={showOffcanvas}
          onHide={handleCloseOffcanvas}
          className="bg-dark text-white"
        >
          <Offcanvas.Header closeButton closeVariant="white">
            <Offcanvas.Title id="basic-navbar-offcanvas-label">Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/" onClick={handleCloseOffcanvas}>
                <FaHome className="me-2" />
                Home
              </Nav.Link>
              <Nav.Link as={NavLink} to="/menu" onClick={handleCloseOffcanvas}>
                <FaUtensils className="me-2" />
                Menu
              </Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link as={NavLink} to="/cart" onClick={handleCloseOffcanvas}>
                <FaShoppingCart className="me-2" />
                Cart
                {totalItems > 0 && (
                  <Badge pill bg="primary" className="ms-1">
                    {totalItems}
                  </Badge>
                )}
              </Nav.Link>
              {isAuthenticated ? (
                <>
                  <Nav.Link as={NavLink} to="/orders" onClick={handleCloseOffcanvas}>
                    <FaHistory className="me-2" />
                    Orders
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/profile" onClick={handleCloseOffcanvas}>
                    <FaUser className="me-2" />
                    {user?.name}
                  </Nav.Link>
                  <Nav.Link onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" />
                    Logout
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={NavLink} to="/login" onClick={handleCloseOffcanvas}>
                    Login
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/register" onClick={handleCloseOffcanvas}>
                    Register
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>

        {/* Desktop Navigation */}
        <div className="d-none d-lg-flex">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/">
              <FaHome className="me-1" />
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/menu">
              <FaUtensils className="me-1" />
              Menu
            </Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link as={NavLink} to="/cart">
              <FaShoppingCart className="me-1" />
              Cart
              {totalItems > 0 && (
                <Badge pill bg="primary" className="ms-1">
                  {totalItems}
                </Badge>
              )}
            </Nav.Link>
            {isAuthenticated ? (
              <>
                <Nav.Link as={NavLink} to="/orders">
                  <FaHistory className="me-1" />
                  Orders
                </Nav.Link>
                <Nav.Link as={NavLink} to="/profile">
                  <FaUser className="me-1" />
                  {user?.name}
                </Nav.Link>
                <Button variant="outline-light" size="sm" onClick={handleLogout} className="ms-2">
                  <FaSignOutAlt className="me-1" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={NavLink} to="/register">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;
