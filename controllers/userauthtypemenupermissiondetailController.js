// controllers/userauthtypemenupermissiondetailController.js
const UserAuthTypeMenuPermissionDetail = require('../models/userauthtypemenupermissiondetail');

// Helper: generate next upMenuDetailId (UPMD0001)
async function generateNextUPMenuDetailId() {
  try {
    // Get all records with UPMD IDs
    const allRecords = await UserAuthTypeMenuPermissionDetail
      .find({ PK_UPMenuDetailId: { $regex: '^UPMD\\d+$' } })
      .select('PK_UPMenuDetailId')
      .lean();

    let maxNumber = 0;

    // Find the maximum numeric value
    if (allRecords.length > 0) {
      allRecords.forEach(record => {
        const numStr = (record.PK_UPMenuDetailId || '').replace(/^UPMD/, '');
        const num = parseInt(numStr, 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      });
    }

    const nextNumber = (maxNumber + 1).toString().padStart(4, '0');
    return `UPMD${nextNumber}`;
  } catch (err) {
    console.error('Error generating next upMenuDetailId:', err);
    return 'UPMD0001';
  }
}

/**
 * Create new menu permission detail
 */
exports.createMenuPermissionDetail = async (req, res) => {
  try {
    const data = req.body;

    // Auto-generate PK_UPMenuDetailId if not provided
    if (!data.PK_UPMenuDetailId) {
      data.PK_UPMenuDetailId = await generateNextUPMenuDetailId();
    }

    // Check if PK_UPMenuDetailId already exists
    const existing = await UserAuthTypeMenuPermissionDetail.findOne({ PK_UPMenuDetailId: data.PK_UPMenuDetailId });
    if (existing) {
      return res.status(409).json({ message: 'PK_UPMenuDetailId already exists' });
    }

    // Create new menu permission detail
    const permissionDetail = new UserAuthTypeMenuPermissionDetail(data);

    // Validate the document against the schema
    const validationError = permissionDetail.validateSync();
    if (validationError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(validationError.errors).map(err => err.message)
      });
    }

    // Save the permission detail
    const saved = await permissionDetail.save();
    return res.status(201).json(saved);

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
      message: 'Server error while creating menu permission detail',
      error: err.message
    });
  }
};

/**
 * Get all menu permission details with optional query (pagination, search)
 */
exports.getMenuPermissionDetails = async (req, res) => {
  try {
    const { page = 1, limit = 25, q } = req.query;
    const filter = {};

    if (q) {
      // Text search across multiple fields
      filter.$or = [
        { PK_UPMenuDetailId: { $regex: q, $options: 'i' } },
        { FK_MenuId: { $regex: q, $options: 'i' } },
        { FK_AuthTypeId: { $regex: q, $options: 'i' } },
        { PK_SynchId: { $regex: q, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const permissionDetails = await UserAuthTypeMenuPermissionDetail
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await UserAuthTypeMenuPermissionDetail.countDocuments(filter);

    return res.status(200).json({
      data: permissionDetails,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Server error while fetching menu permission details',
      error: err.message
    });
  }
};

/**
 * Get menu permission detail by ID (MongoDB _id or PK_UPMenuDetailId)
 */
exports.getMenuPermissionDetailById = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find by PK_UPMenuDetailId first, then by MongoDB _id
    let permissionDetail = await UserAuthTypeMenuPermissionDetail.findOne({ PK_UPMenuDetailId: id });

    if (!permissionDetail) {
      // Only try to find by MongoDB _id if `id` looks like a valid ObjectId
      if (require('mongoose').Types.ObjectId.isValid(id)) {
        permissionDetail = await UserAuthTypeMenuPermissionDetail.findById(id);
      }
    }

    if (!permissionDetail) {
      return res.status(404).json({ message: 'Menu permission detail not found' });
    }

    return res.status(200).json(permissionDetail);

  } catch (err) {
    return res.status(500).json({
      message: 'Server error while fetching menu permission detail',
      error: err.message
    });
  }
};

/**
 * Update menu permission detail by ID (MongoDB _id or PK_UPMenuDetailId)
 */
exports.updateMenuPermissionDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that should not be updated
    delete updateData._id;
    delete updateData.__v;

    // Check if trying to update PK_UPMenuDetailId to a value that already exists
    if (updateData.PK_UPMenuDetailId) {
      const existing = await UserAuthTypeMenuPermissionDetail.findOne({
        PK_UPMenuDetailId: updateData.PK_UPMenuDetailId,
        PK_UPMenuDetailId: { $ne: id }
      });
      if (existing) {
        return res.status(409).json({ message: 'PK_UPMenuDetailId already exists' });
      }
    }

    // Try to find and update by PK_UPMenuDetailId first, then by MongoDB _id
    let permissionDetail = await UserAuthTypeMenuPermissionDetail.findOneAndUpdate(
      { PK_UPMenuDetailId: id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!permissionDetail) {
      // Only try to update by MongoDB _id if `id` is a valid ObjectId
      if (require('mongoose').Types.ObjectId.isValid(id)) {
        permissionDetail = await UserAuthTypeMenuPermissionDetail.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        );
      }
    }

    if (!permissionDetail) {
      return res.status(404).json({ message: 'Menu permission detail not found' });
    }

    return res.status(200).json({
      message: 'Menu permission detail updated successfully',
      data: permissionDetail
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
      message: 'Server error while updating menu permission detail',
      error: err.message
    });
  }
};

/**
 * Delete menu permission detail by ID (MongoDB _id or PK_UPMenuDetailId)
 */
exports.deleteMenuPermissionDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find and delete by PK_UPMenuDetailId first, then by MongoDB _id
    let permissionDetail = await UserAuthTypeMenuPermissionDetail.findOneAndDelete({ PK_UPMenuDetailId: id });

    if (!permissionDetail) {
      // Only try to delete by MongoDB _id if `id` looks like a valid ObjectId
      if (require('mongoose').Types.ObjectId.isValid(id)) {
        permissionDetail = await UserAuthTypeMenuPermissionDetail.findByIdAndDelete(id);
      }
    }

    if (!permissionDetail) {
      return res.status(404).json({ message: 'Menu permission detail not found' });
    }

    return res.status(200).json({
      message: 'Menu permission detail deleted successfully',
      data: permissionDetail
    });

  } catch (err) {
    return res.status(500).json({
      message: 'Server error while deleting menu permission detail',
      error: err.message
    });
  }
};

/**
 * Get next upMenuDetailId
 */
exports.getNextUPMenuDetailId = async (req, res) => {
  try {
    const nextId = await generateNextUPMenuDetailId();
    return res.status(200).json({ PK_UPMenuDetailId: nextId });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};