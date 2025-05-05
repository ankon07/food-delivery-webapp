import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Carousel, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUtensils, FaShoppingCart, FaHistory, FaUser } from 'react-icons/fa';
import { getMenuItems } from '../services/menuService';
import { getCategories } from '../services/menuService';
import { MenuItem, MenuCategory } from '../types/models';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [menuItemsData, categoriesData] = await Promise.all([
          getMenuItems(),
          getCategories(),
        ]);
        
        // Get only available items and limit to 6 for featured section
        const availableItems = menuItemsData.filter(item => item.isAvailable);
        setFeaturedItems(availableItems.slice(0, 6));
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
    <Container>
      {/* Hero Section */}
      <Carousel className="mb-5 rounded overflow-hidden shadow">
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=400&q=80"
            alt="Delicious food"
          />
          <Carousel.Caption className="bg-dark bg-opacity-50 rounded p-3">
            <h2>Welcome to University Canteen</h2>
            <p>Order delicious meals online and enjoy at the canteen or get them delivered on campus.</p>
            <Link to="/menu">
              <Button variant="primary">Browse Menu</Button>
            </Link>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=400&q=80"
            alt="Food variety"
          />
          <Carousel.Caption className="bg-dark bg-opacity-50 rounded p-3">
            <h2>Variety of Options</h2>
            <p>From breakfast to dinner, we offer a wide range of delicious meals to satisfy your hunger.</p>
            <Link to="/menu">
              <Button variant="primary">See All Options</Button>
            </Link>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>

      {/* Quick Access Section */}
      <Row className="mb-5">
        <Col xs={12}>
          <h2 className="text-center mb-4">Quick Access</h2>
        </Col>
        <Col md={3} sm={6} className="mb-4">
          <Card className="h-100 text-center shadow-sm">
            <Card.Body>
              <FaUtensils size={40} className="mb-3 text-primary" />
              <Card.Title>Menu</Card.Title>
              <Card.Text>Browse our delicious menu items</Card.Text>
              <Link to="/menu">
                <Button variant="outline-primary">View Menu</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-4">
          <Card className="h-100 text-center shadow-sm">
            <Card.Body>
              <FaShoppingCart size={40} className="mb-3 text-primary" />
              <Card.Title>Cart</Card.Title>
              <Card.Text>View your current cart items</Card.Text>
              <Link to="/cart">
                <Button variant="outline-primary">Go to Cart</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-4">
          <Card className="h-100 text-center shadow-sm">
            <Card.Body>
              <FaHistory size={40} className="mb-3 text-primary" />
              <Card.Title>Orders</Card.Title>
              <Card.Text>Track your current and past orders</Card.Text>
              <Link to={isAuthenticated ? "/orders" : "/login"}>
                <Button variant="outline-primary">View Orders</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-4">
          <Card className="h-100 text-center shadow-sm">
            <Card.Body>
              <FaUser size={40} className="mb-3 text-primary" />
              <Card.Title>Profile</Card.Title>
              <Card.Text>Manage your account settings</Card.Text>
              <Link to={isAuthenticated ? "/profile" : "/login"}>
                <Button variant="outline-primary">Go to Profile</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Featured Items Section */}
      <Row className="mb-5">
        <Col xs={12}>
          <h2 className="text-center mb-4">Featured Items</h2>
        </Col>
        {featuredItems.map((item) => (
          <Col key={item.id} lg={4} md={6} className="mb-4">
            <Card className="h-100 shadow-sm menu-item-card">
              <Card.Img
                variant="top"
                src={item.imageUrl || 'https://via.placeholder.com/300x200?text=Food+Image'}
                alt={item.name}
                className="menu-item-image"
              />
              <Card.Body>
                <Card.Title>{item.name}</Card.Title>
                <Card.Text>{item.description}</Card.Text>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="price-badge">৳{item.price}</span>
                  <Link to={`/menu?item=${item.id}`}>
                    <Button variant="primary" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
        <Col xs={12} className="text-center mt-3">
          <Link to="/menu">
            <Button variant="outline-primary">View All Menu Items</Button>
          </Link>
        </Col>
      </Row>

      {/* Categories Section */}
      <Row className="mb-5">
        <Col xs={12}>
          <h2 className="text-center mb-4">Browse by Category</h2>
        </Col>
        {categories.map((category) => (
          <Col key={category.id} md={4} sm={6} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Body className="text-center">
                <Card.Title>{category.name}</Card.Title>
                <Link to={`/menu?category=${category.id}`}>
                  <Button variant="outline-primary">Browse {category.name}</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default HomePage;
