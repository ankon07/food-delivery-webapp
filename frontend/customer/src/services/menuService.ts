import { get } from './apiService';
import { MenuCategory, MenuItem } from '../types/models';

/**
 * Get all menu categories
 * @returns List of menu categories
 */
export const getCategories = async (): Promise<MenuCategory[]> => {
  const response = await get<{ categories: MenuCategory[] }>('/categories');
  return response.categories;
};

/**
 * Get a menu category by ID
 * @param id - Category ID
 * @returns Menu category
 */
export const getCategoryById = async (id: string): Promise<MenuCategory> => {
  const response = await get<{ category: MenuCategory }>(`/categories/${id}`);
  return response.category;
};

/**
 * Get all menu items
 * @returns List of menu items
 */
export const getMenuItems = async (): Promise<MenuItem[]> => {
  const response = await get<{ menuItems: MenuItem[] }>('/menu-items');
  return response.menuItems;
};

/**
 * Get menu items by category
 * @param categoryId - Category ID
 * @returns List of menu items in the category
 */
export const getMenuItemsByCategory = async (categoryId: string): Promise<MenuItem[]> => {
  const response = await get<{ menuItems: MenuItem[] }>(`/menu-items/category/${categoryId}`);
  return response.menuItems;
};

/**
 * Get a menu item by ID
 * @param id - Menu item ID
 * @returns Menu item
 */
export const getMenuItemById = async (id: string): Promise<MenuItem> => {
  const response = await get<{ menuItem: MenuItem }>(`/menu-items/${id}`);
  return response.menuItem;
};
