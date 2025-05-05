import { Request, Response } from 'express';
import { prisma } from '../server';

/**
 * Get all menu categories
 * @route GET /api/categories
 */
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.menuCategory.findMany({
      include: {
        items: true,
      },
    });

    res.status(200).json({ categories });
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get a single menu category by ID
 * @route GET /api/categories/:id
 */
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await prisma.menuCategory.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ category });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Create a new menu category
 * @route POST /api/categories
 */
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({ message: 'Please provide a name' });
    }

    // Create category
    const category = await prisma.menuCategory.create({
      data: { name },
    });

    res.status(201).json({
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update a menu category
 * @route PUT /api/categories/:id
 */
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({ message: 'Please provide a name' });
    }

    // Check if category exists
    const existingCategory = await prisma.menuCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Update category
    const updatedCategory = await prisma.menuCategory.update({
      where: { id },
      data: { name },
    });

    res.status(200).json({
      message: 'Category updated successfully',
      category: updatedCategory,
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Delete a menu category
 * @route DELETE /api/categories/:id
 */
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existingCategory = await prisma.menuCategory.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has items
    if (existingCategory.items.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete category with items. Remove items first.',
      });
    }

    // Delete category
    await prisma.menuCategory.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
