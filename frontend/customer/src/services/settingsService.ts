import { get } from './apiService';
import { CanteenSettings } from '../types/models';

/**
 * Get canteen settings
 * @returns Canteen settings
 */
export const getCanteenSettings = async (): Promise<CanteenSettings> => {
  const response = await get<{ settings: CanteenSettings }>('/settings');
  return response.settings;
};
