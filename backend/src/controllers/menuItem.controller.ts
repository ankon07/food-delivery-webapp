import { Request, Response } from 'express';
import { prisma } from '../server';

/**
 * Get all menu items
 * @route GET /api/menu-items
 */
export const getAllMenuItems = async (req: Request, res: Response) => {
  try {
    const menuItems = await prisma.menuItem.findMany({
      include: {
        category: true,
      },
    });

    res.status(200).json({ menuItems });
  } catch (error) {
    console.error('Get all menu items error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get menu items by category
 * @route GET /api/menu-items/category/:categoryId
 */
export const getMenuItemsByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;

    const menuItems = await prisma.menuItem.findMany({
      where: {
        categoryId,
      },
      include: {
        category: true,
      },
    });

    res.status(200).json({ menuItems });
  } catch (error) {
    console.error('Get menu items by category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get a single menu item by ID
 * @route GET /api/menu-items/:id
 */
export const getMenuItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(200).json({ menuItem });
  } catch (error) {
    console.error('Get menu item by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Create a new menu item
 * @route POST /api/menu-items
 */
export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const { name, description, price, imageUrl, categoryId, isAvailable = true } = req.body;

    // Validate input
    if (!name || !description || !price || !imageUrl || !categoryId) {
      return res.status(400).json({
        message: 'Please provide name, description, price, imageUrl, and categoryId',
      });
    }

    // Check if category exists
    const category = await prisma.menuCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Create menu item
    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        categoryId,
        isAvailable,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json({
      message: 'Menu item created successfully',
      menuItem,
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update a menu item
 * @route PUT /api/menu-items/:id
 */
export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, imageUrl, categoryId, isAvailable } = req.body;

    // Check if menu item exists
    const existingMenuItem = await prisma.menuItem.findUnique({
      where: { id },
    });

    if (!existingMenuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Check if category exists if provided
    if (categoryId) {
      const category = await prisma.menuCategory.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
    }

    // Update menu item
    const updatedMenuItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        categoryId: categoryId !== undefined ? categoryId : undefined,
        isAvailable: isAvailable !== undefined ? isAvailable : undefined,
      },
      include: {
        category: true,
      },
    });

    res.status(200).json({
      message: 'Menu item updated successfully',
      menuItem: updatedMenuItem,
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Delete a menu item
 * @route DELETE /api/menu-items/:id
 */
export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if menu item exists
    const existingMenuItem = await prisma.menuItem.findUnique({
      where: { id },
    });

    if (!existingMenuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Check if menu item is used in any orders
    const orderItems = await prisma.orderItem.findMany({
      where: { menuItemId: id },
    });

    if (orderItems.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete menu item that is used in orders',
      });
    }

    // Delete menu item
    await prisma.menuItem.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Toggle menu item availability
 * @route PATCH /api/menu-items/:id/toggle-availability
 */
export const toggleMenuItemAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if menu item exists
    const existingMenuItem = await prisma.menuItem.findUnique({
      where: { id },
    });

    if (!existingMenuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Toggle availability
    const updatedMenuItem = await prisma.menuItem.update({
      where: { id },
      data: {
        isAvailable: !existingMenuItem.isAvailable,
      },
      include: {
        category: true,
      },
    });

    res.status(200).json({
      message: `Menu item ${updatedMenuItem.isAvailable ? 'available' : 'unavailable'}`,
      menuItem: updatedMenuItem,
    });
  } catch (error) {
    console.error('Toggle menu item availability error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
