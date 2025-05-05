/**
 * Mock implementation of Prisma client for testing purposes
 * This allows us to test the API endpoints without a real database connection
 */

// Mock data
const users = [
  {
    id: '1',
    universityId: 'u123456',
    email: 'student@example.com',
    name: 'Student User',
    passwordHash: '$2b$10$X7o4.KK4XLYFEwmo1vX5heK.Gxs4X0DxfBFzL5JVFg3tNUUU5.5Aq', // password: password123
    role: 'CUSTOMER',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    universityId: 'u654321',
    email: 'staff@example.com',
    name: 'Staff User',
    passwordHash: '$2b$10$X7o4.KK4XLYFEwmo1vX5heK.Gxs4X0DxfBFzL5JVFg3tNUUU5.5Aq', // password: password123
    role: 'STAFF',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const menuCategories = [
  {
    id: '1',
    name: 'Breakfast',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Lunch',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Dinner',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Snacks',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    name: 'Beverages',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const menuItems = [
  {
    id: '1',
    name: 'Paratha',
    description: 'Delicious flatbread',
    price: 20,
    imageUrl: 'https://example.com/paratha.jpg',
    isAvailable: true,
    categoryId: '1', // Breakfast
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Chicken Curry',
    description: 'Spicy chicken curry',
    price: 120,
    imageUrl: 'https://example.com/chicken-curry.jpg',
    isAvailable: true,
    categoryId: '2', // Lunch
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Beef Biryani',
    description: 'Fragrant rice dish with beef',
    price: 150,
    imageUrl: 'https://example.com/beef-biryani.jpg',
    isAvailable: true,
    categoryId: '3', // Dinner
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Samosa',
    description: 'Crispy pastry with savory filling',
    price: 15,
    imageUrl: 'https://example.com/samosa.jpg',
    isAvailable: true,
    categoryId: '4', // Snacks
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    name: 'Tea',
    description: 'Hot tea',
    price: 15,
    imageUrl: 'https://example.com/tea.jpg',
    isAvailable: true,
    categoryId: '5', // Beverages
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const orders = [
  {
    id: '1',
    userId: '1',
    status: 'COMPLETED',
    totalAmount: 155,
    deliveryLocation: 'Dorm Room 101',
    paymentMethod: 'CASH',
    paymentStatus: 'COMPLETED',
    bkashTransactionId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    userId: '1',
    status: 'PENDING',
    totalAmount: 135,
    deliveryLocation: 'Dorm Room 101',
    paymentMethod: 'BKASH',
    paymentStatus: 'PENDING',
    bkashTransactionId: 'mock_payment_id',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const orderItems = [
  {
    id: '1',
    orderId: '1',
    menuItemId: '1',
    quantity: 1,
    priceAtOrderTime: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    orderId: '1',
    menuItemId: '3',
    quantity: 1,
    priceAtOrderTime: 150,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    orderId: '2',
    menuItemId: '2',
    quantity: 1,
    priceAtOrderTime: 120,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    orderId: '2',
    menuItemId: '5',
    quantity: 1,
    priceAtOrderTime: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const canteenSettings = [
  {
    id: '1',
    openingTime: '08:00',
    closingTime: '20:00',
    isOpen: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Helper functions
const findById = (collection: any[], id: string) => {
  return collection.find((item) => item.id === id);
};

const findByField = (collection: any[], field: string, value: any) => {
  return collection.find((item) => item[field] === value);
};

const findManyByField = (collection: any[], field: string, value: any) => {
  return collection.filter((item) => item[field] === value);
};

// Mock Prisma client
export const mockPrismaClient = {
  user: {
    findUnique: async (params: any) => {
      if (params.where.id) {
        return findById(users, params.where.id);
      }
      if (params.where.universityId) {
        return findByField(users, 'universityId', params.where.universityId);
      }
      if (params.where.email) {
        return findByField(users, 'email', params.where.email);
      }
      return null;
    },
    findFirst: async (params: any) => {
      if (params.where.OR) {
        for (const condition of params.where.OR) {
          const key = Object.keys(condition)[0];
          const value = condition[key];
          const user = findByField(users, key, value);
          if (user) {
            return user;
          }
        }
      }
      return null;
    },
    create: async (params: any) => {
      const newUser = {
        id: (users.length + 1).toString(),
        ...params.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.push(newUser);
      return newUser;
    },
  },
  menuCategory: {
    findMany: async () => {
      return menuCategories;
    },
    findUnique: async (params: any) => {
      return findById(menuCategories, params.where.id);
    },
    create: async (params: any) => {
      const newCategory = {
        id: (menuCategories.length + 1).toString(),
        ...params.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      menuCategories.push(newCategory);
      return newCategory;
    },
    update: async (params: any) => {
      const index = menuCategories.findIndex((c) => c.id === params.where.id);
      if (index === -1) {
        return null;
      }
      menuCategories[index] = {
        ...menuCategories[index],
        ...params.data,
        updatedAt: new Date(),
      };
      return menuCategories[index];
    },
    delete: async (params: any) => {
      const index = menuCategories.findIndex((c) => c.id === params.where.id);
      if (index === -1) {
        return null;
      }
      const deleted = menuCategories[index];
      menuCategories.splice(index, 1);
      return deleted;
    },
  },
  menuItem: {
    findMany: async (params: any) => {
      if (params?.where?.categoryId) {
        return menuItems.filter((item) => item.categoryId === params.where.categoryId);
      }
      if (params?.where?.id?.in) {
        return menuItems.filter((item) => params.where.id.in.includes(item.id));
      }
      return menuItems;
    },
    findUnique: async (params: any) => {
      return findById(menuItems, params.where.id);
    },
    create: async (params: any) => {
      const newItem = {
        id: (menuItems.length + 1).toString(),
        ...params.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      menuItems.push(newItem);
      return newItem;
    },
    update: async (params: any) => {
      const index = menuItems.findIndex((i) => i.id === params.where.id);
      if (index === -1) {
        return null;
      }
      menuItems[index] = {
        ...menuItems[index],
        ...params.data,
        updatedAt: new Date(),
      };
      return menuItems[index];
    },
    delete: async (params: any) => {
      const index = menuItems.findIndex((i) => i.id === params.where.id);
      if (index === -1) {
        return null;
      }
      const deleted = menuItems[index];
      menuItems.splice(index, 1);
      return deleted;
    },
  },
  order: {
    findMany: async (params: any) => {
      if (params?.where?.userId) {
        return orders.filter((order) => order.userId === params.where.userId);
      }
      return orders;
    },
    findUnique: async (params: any) => {
      return findById(orders, params.where.id);
    },
    findFirst: async (params: any) => {
      if (params?.where?.bkashTransactionId) {
        return findByField(orders, 'bkashTransactionId', params.where.bkashTransactionId);
      }
      return null;
    },
    create: async (params: any) => {
      const newOrder = {
        id: (orders.length + 1).toString(),
        ...params.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Handle order items creation
      if (params.data.orderItems?.create) {
        const items = Array.isArray(params.data.orderItems.create)
          ? params.data.orderItems.create
          : [params.data.orderItems.create];
          
        items.forEach((item: any) => {
          const newOrderItem = {
            id: (orderItems.length + 1).toString(),
            orderId: newOrder.id,
            ...item,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          orderItems.push(newOrderItem);
        });
        
        // Remove orderItems from newOrder to avoid duplication
        delete newOrder.orderItems;
      }
      
      orders.push(newOrder);
      return {
        ...newOrder,
        orderItems: orderItems.filter((item) => item.orderId === newOrder.id),
      };
    },
    update: async (params: any) => {
      const index = orders.findIndex((o) => o.id === params.where.id);
      if (index === -1) {
        return null;
      }
      orders[index] = {
        ...orders[index],
        ...params.data,
        updatedAt: new Date(),
      };
      return orders[index];
    },
  },
  orderItem: {
    findMany: async (params: any) => {
      if (params?.where?.menuItemId) {
        return orderItems.filter((item) => item.menuItemId === params.where.menuItemId);
      }
      if (params?.where?.orderId) {
        return orderItems.filter((item) => item.orderId === params.where.orderId);
      }
      return orderItems;
    },
  },
  canteenSettings: {
    findFirst: async () => {
      return canteenSettings[0] || null;
    },
    create: async (params: any) => {
      const newSettings = {
        id: '1',
        ...params.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      canteenSettings[0] = newSettings;
      return newSettings;
    },
    update: async (params: any) => {
      if (!canteenSettings[0]) {
        return null;
      }
      canteenSettings[0] = {
        ...canteenSettings[0],
        ...params.data,
        updatedAt: new Date(),
      };
      return canteenSettings[0];
    },
  },
};
