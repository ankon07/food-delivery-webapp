import { Request, Response } from 'express';
import { prisma } from '../server';
import { emitCanteenStatusUpdate } from '../utils/socket.utils';

/**
 * Get canteen settings
 * @route GET /api/settings
 */
export const getSettings = async (req: Request, res: Response) => {
  try {
    // Get the first settings record or create one if it doesn't exist
    let settings = await prisma.canteenSettings.findFirst();

    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.canteenSettings.create({
        data: {
          openingTime: '08:00',
          closingTime: '20:00',
          isOpen: true,
        },
      });
    }

    res.status(200).json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update canteen settings
 * @route PUT /api/settings
 */
export const updateSettings = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Only staff can update settings
    if (req.user.role !== 'STAFF') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { openingTime, closingTime, isOpen } = req.body;

    // Validate input
    if (openingTime === undefined && closingTime === undefined && isOpen === undefined) {
      return res.status(400).json({
        message: 'Please provide at least one setting to update',
      });
    }

    // Get the first settings record or create one if it doesn't exist
    let settings = await prisma.canteenSettings.findFirst();

    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.canteenSettings.create({
        data: {
          openingTime: openingTime || '08:00',
          closingTime: closingTime || '20:00',
          isOpen: isOpen !== undefined ? isOpen : true,
        },
      });
    } else {
    // Update existing settings
    settings = await prisma.canteenSettings.update({
      where: { id: settings.id },
      data: {
        openingTime: openingTime !== undefined ? openingTime : settings.openingTime,
        closingTime: closingTime !== undefined ? closingTime : settings.closingTime,
        isOpen: isOpen !== undefined ? isOpen : settings.isOpen,
      },
    });

    // Emit canteen status update if isOpen was changed
    if (isOpen !== undefined) {
      emitCanteenStatusUpdate(isOpen);
    }
    }

    res.status(200).json({
      message: 'Settings updated successfully',
      settings,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Toggle canteen open/closed status
 * @route PATCH /api/settings/toggle
 */
export const toggleCanteenStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Only staff can toggle canteen status
    if (req.user.role !== 'STAFF') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get the first settings record or create one if it doesn't exist
    let settings = await prisma.canteenSettings.findFirst();

    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.canteenSettings.create({
        data: {
          openingTime: '08:00',
          closingTime: '20:00',
          isOpen: true,
        },
      });
    } else {
    // Toggle isOpen status
    settings = await prisma.canteenSettings.update({
      where: { id: settings.id },
      data: {
        isOpen: !settings.isOpen,
      },
    });

    // Emit canteen status update
    emitCanteenStatusUpdate(settings.isOpen);
    }

    res.status(200).json({
      message: `Canteen is now ${settings.isOpen ? 'open' : 'closed'}`,
      settings,
    });
  } catch (error) {
    console.error('Toggle canteen status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
