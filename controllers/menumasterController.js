// controllers/menumasterController.js
const MenuMaster = require('../models/menumaster');

// Helper: generate next menuId (MENU0001)
async function generateNextMenuId() {
  try {
    // Get all menu records with MENU IDs
    const allRecords = await MenuMaster
      .find({ PK_MenuId: { $regex: '^MENU\\d+$' } })
      .select('PK_MenuId')
      .lean();

    let maxNumber = 0;

    // Find the maximum numeric value
    if (allRecords.length > 0) {
      allRecords.forEach(record => {
        const numStr = (record.PK_MenuId || '').replace(/^MENU/, '');
        const num = parseInt(numStr, 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      });
    }

    const nextNumber = (maxNumber + 1).toString().padStart(4, '0');
    return `MENU${nextNumber}`;
  } catch (err) {
    console.error('Error generating next menuId:', err);
    return 'MENU0001';
  }
}

/**
 * Create new menu
 */
exports.createMenu = async (req, res) => {
  try {
    const data = req.body;

    // Auto-generate PK_MenuId if not provided
    if (!data.PK_MenuId) {
      data.PK_MenuId = await generateNextMenuId();
    }

    // Check if PK_MenuId already exists
    const existingMenu = await MenuMaster.findOne({ PK_MenuId: data.PK_MenuId });
    if (existingMenu) {
      return res.status(409).json({ message: 'PK_MenuId already exists' });
    }

    // Create new menu
    const menu = new MenuMaster(data);

    // Validate the document against the schema
    const validationError = menu.validateSync();
    if (validationError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(validationError.errors).map(err => err.message)
      });
    }

    // Save the menu
    const savedMenu = await menu.save();
    return res.status(201).json(savedMenu);

  } catch (err) {
    // Handle mongoose validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(err.errors).map(error => error.message)
      });
    }

    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({
        message: `${field} already exists`
      });
    }

    // Handle other errors
    return res.status(500).json({
      message: 'Server error while creating menu',
      error: err.message
    });
  }
};

/**
 * Get all menus with optional query (pagination, search)
 */
exports.getMenus = async (req, res) => {
  try {
    const { page = 1, limit = 25, q } = req.query;
    const filter = {};

    if (q) {
      // Text search across multiple fields
      filter.$or = [
        { PK_MenuId: { $regex: q, $options: 'i' } },
        { MenuName: { $regex: q, $options: 'i' } },
        { MenuGroup: { $regex: q, $options: 'i' } },
        { MenuLink: { $regex: q, $options: 'i' } },
        { MenuDetailName: { $regex: q, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const menus = await MenuMaster
      .find(filter)
      .sort({ MenuIndex: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await MenuMaster.countDocuments(filter);

    return res.status(200).json({
      data: menus,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Server error while fetching menus',
      error: err.message
    });
  }
};

/**
 * Get menu by ID (MongoDB _id or PK_MenuId)
 */
exports.getMenuById = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find by PK_MenuId first, then by MongoDB _id
    let menu = await MenuMaster.findOne({ PK_MenuId: id });

    if (!menu) {
      // Only try to find by MongoDB _id if `id` looks like a valid ObjectId
      if (require('mongoose').Types.ObjectId.isValid(id)) {
        menu = await MenuMaster.findById(id);
      }
    }

    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    return res.status(200).json(menu);

  } catch (err) {
    return res.status(500).json({
      message: 'Server error while fetching menu',
      error: err.message
    });
  }
};

/**
 * Update menu by ID (MongoDB _id or PK_MenuId)
 */
exports.updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that should not be updated
    delete updateData._id;
    delete updateData.__v;

    // Check if trying to update PK_MenuId to a value that already exists
    if (updateData.PK_MenuId) {
      const existingMenu = await MenuMaster.findOne({
        PK_MenuId: updateData.PK_MenuId,
        PK_MenuId: { $ne: id }
      });
      if (existingMenu) {
        return res.status(409).json({ message: 'PK_MenuId already exists' });
      }
    }

    // Try to find and update by PK_MenuId first, then by MongoDB _id
    let menu = await MenuMaster.findOneAndUpdate(
      { PK_MenuId: id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!menu) {
      // Only try to update by MongoDB _id if `id` is a valid ObjectId
      if (require('mongoose').Types.ObjectId.isValid(id)) {
        menu = await MenuMaster.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        );
      }
    }

    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    return res.status(200).json({
      message: 'Menu updated successfully',
      data: menu
    });

  } catch (err) {
    // Handle mongoose validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(err.errors).map(error => error.message)
      });
    }

    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({
        message: `${field} already exists`
      });
    }

    return res.status(500).json({
      message: 'Server error while updating menu',
      error: err.message
    });
  }
};

/**
 * Delete menu by ID (MongoDB _id or PK_MenuId)
 */
exports.deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find and delete by PK_MenuId first, then by MongoDB _id
    let menu = await MenuMaster.findOneAndDelete({ PK_MenuId: id });

    if (!menu) {
      // Only try to delete by MongoDB _id if `id` looks like a valid ObjectId
      if (require('mongoose').Types.ObjectId.isValid(id)) {
        menu = await MenuMaster.findByIdAndDelete(id);
      }
    }

    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    return res.status(200).json({
      message: 'Menu deleted successfully',
      data: menu
    });

  } catch (err) {
    return res.status(500).json({
      message: 'Server error while deleting menu',
      error: err.message
    });
  }
};

/**
 * Get active menus
 */
exports.getActiveMenus = async (req, res) => {
  try {
    const { page = 1, limit = 25 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const menus = await MenuMaster
      .find({ IsActive: true })
      .sort({ MenuIndex: 1, MenuName: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await MenuMaster.countDocuments({ IsActive: true });

    return res.status(200).json({
      data: menus,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (err) {
    return res.status(500).json({
      message: 'Server error while fetching active menus',
      error: err.message
    });
  }
};

/**
 * Get next menuId
 */
exports.getNextMenuId = async (req, res) => {
  try {
    const nextId = await generateNextMenuId();
    return res.status(200).json({ PK_MenuId: nextId });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};