import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Badge } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { FaShoppingCart, FaFilter } from 'react-icons/fa';
import { getMenuItems, getCategories } from '../services/menuService';
import { MenuItem, MenuCategory } from '../types/models';
import { useCart } from '../contexts/CartContext';

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showUnavailable, setShowUnavailable] = useState<boolean>(false);
  const { addItem } = useCart();

  // Get category and item from URL params
  const categoryParam = searchParams.get('category');
  const itemParam = searchParams.get('item');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [menuItemsData, categoriesData] = await Promise.all([
          getMenuItems(),
          getCategories(),
        ]);
        
        setMenuItems(menuItemsData);
        setCategories(categoriesData);
        
        // Set selected category from URL param if it exists
        if (categoryParam) {
          setSelectedCategory(categoryParam);
        }
        
        // If item param exists, scroll to that item
        if (itemParam) {
          setTimeout(() => {
            const element = document.getElementById(`menu-item-${itemParam}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.classList.add('highlight');
              setTimeout(() => {
                element.classList.remove('highlight');
              }, 2000);
            }
          }, 500);
        }
      } catch (error) {
        console.error('Error fetching menu data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [categoryParam, itemParam]);

  // Filter menu items based on search term, category, and availability
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? item.categoryId === selectedCategory : true;
    const matchesAvailability = showUnavailable ? true : item.isAvailable;
    
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  // Get category name by ID
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : '';
  };

  // Handle adding item to cart
  const handleAddToCart = (item: MenuItem) => {
    addItem(item, 1);
  };

  // Handle category filter change
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      searchParams.set('category', categoryId);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
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
    <Container>
      <h1 className="mb-4">Menu</h1>
      
      {/* Filters */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={6} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label><FaFilter className="me-2" />Search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search for items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mt-md-4">
                <Form.Check
                  type="switch"
                  id="show-unavailable"
                  label="Show Unavailable"
                  checked={showUnavailable}
                  onChange={(e) => setShowUnavailable(e.target.checked)}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Menu Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-5">
          <h3>No menu items found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <Row>
          {filteredItems.map((item) => (
            <Col key={item.id} lg={4} md={6} className="mb-4">
              <Card
                id={`menu-item-${item.id}`}
                className={`h-100 shadow-sm menu-item-card ${!item.isAvailable ? 'opacity-75' : ''}`}
              >
                <div className="position-relative">
                  <Card.Img
                    variant="top"
                    src={item.imageUrl || 'https://via.placeholder.com/300x200?text=Food+Image'}
                    alt={item.name}
                    className="menu-item-image"
                  />
                  <Badge
                    bg="info"
                    className="category-badge"
                  >
                    {getCategoryName(item.categoryId)}
                  </Badge>
                  {!item.isAvailable && (
                    <div
                      className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    >
                      <Badge bg="danger" className="p-2">
                        Currently Unavailable
                      </Badge>
                    </div>
                  )}
                </div>
                <Card.Body>
                  <Card.Title>{item.name}</Card.Title>
                  <Card.Text>{item.description}</Card.Text>
                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <span className="price-badge">৳{item.price}</span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.isAvailable}
                    >
                      <FaShoppingCart className="me-1" />
                      Add to Cart
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default MenuPage;
