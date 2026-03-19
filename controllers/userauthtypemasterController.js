// controllers/userauthtypemasterController.js
const UserAuthTypeMaster = require('../models/userauthtypemaster');

// Helper: generate next authTypeId (AUTHTYPE0001)
async function generateNextAuthTypeId() {
  try {
    // Get all records with AUTHTYPE IDs
    const allRecords = await UserAuthTypeMaster
      .find({ PK_AuthTypeId: { $regex: '^AUTHTYPE\\d+$' } })
      .select('PK_AuthTypeId')
      .lean();

    let maxNumber = 0;

    // Find the maximum numeric value
    if (allRecords.length > 0) {
      allRecords.forEach(record => {
        const numStr = (record.PK_AuthTypeId || '').replace(/^AUTHTYPE/, '');
        const num = parseInt(numStr, 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      });
    }

    const nextNumber = (maxNumber + 1).toString().padStart(4, '0');
    return `AUTHTYPE${nextNumber}`;
  } catch (err) {
    console.error('Error generating next authTypeId:', err);
    return 'AUTHTYPE0001';
  }
}

/**
 * Create new auth type
 */
exports.createAuthType = async (req, res) => {
  try {
    const data = req.body;

    // Auto-generate PK_AuthTypeId if not provided
    if (!data.PK_AuthTypeId) {
      data.PK_AuthTypeId = await generateNextAuthTypeId();
    }

    // Check if PK_AuthTypeId already exists
    const existing = await UserAuthTypeMaster.findOne({ PK_AuthTypeId: data.PK_AuthTypeId });
    if (existing) {
      return res.status(409).json({ message: 'PK_AuthTypeId already exists' });
    }

    // Create new auth type
    const authType = new UserAuthTypeMaster(data);

    // Validate the document against the schema
    const validationError = authType.validateSync();
    if (validationError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(validationError.errors).map(err => err.message)
      });
    }

    // Save the auth type
    const saved = await authType.save();
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
      message: 'Server error while creating auth type',
      error: err.message
    });
  }
};

/**
 * Get all auth types with optional query (pagination, search)
 */
exports.getAuthTypes = async (req, res) => {
  try {
    const { page = 1, limit = 25, q } = req.query;
    const filter = {};

    if (q) {
      // Text search across multiple fields
      filter.$or = [
        { PK_AuthTypeId: { $regex: q, $options: 'i' } },
        { AuthType: { $regex: q, $options: 'i' } },
        { PK_SynchId: { $regex: q, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const authTypes = await UserAuthTypeMaster
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await UserAuthTypeMaster.countDocuments(filter);

    return res.status(200).json({
      data: authTypes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Server error while fetching auth types',
      error: err.message
    });
  }
};

/**
 * Get auth type by ID (MongoDB _id or PK_AuthTypeId)
 */
exports.getAuthTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find by PK_AuthTypeId first, then by MongoDB _id
    let authType = await UserAuthTypeMaster.findOne({ PK_AuthTypeId: id });

    if (!authType) {
      // Only try to find by MongoDB _id if `id` looks like a valid ObjectId
      if (require('mongoose').Types.ObjectId.isValid(id)) {
        authType = await UserAuthTypeMaster.findById(id);
      }
    }

    if (!authType) {
      return res.status(404).json({ message: 'Auth type not found' });
    }

    return res.status(200).json(authType);

  } catch (err) {
    return res.status(500).json({
      message: 'Server error while fetching auth type',
      error: err.message
    });
  }
};

/**
 * Update auth type by ID (MongoDB _id or PK_AuthTypeId)
 */
exports.updateAuthType = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that should not be updated
    delete updateData._id;
    delete updateData.__v;

    // Check if trying to update PK_AuthTypeId to a value that already exists
    if (updateData.PK_AuthTypeId) {
      const existing = await UserAuthTypeMaster.findOne({
        PK_AuthTypeId: updateData.PK_AuthTypeId,
        PK_AuthTypeId: { $ne: id }
      });
      if (existing) {
        return res.status(409).json({ message: 'PK_AuthTypeId already exists' });
      }
    }

    // Try to find and update by PK_AuthTypeId first, then by MongoDB _id
    let authType = await UserAuthTypeMaster.findOneAndUpdate(
      { PK_AuthTypeId: id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!authType) {
      // Only try to update by MongoDB _id if `id` is a valid ObjectId
      if (require('mongoose').Types.ObjectId.isValid(id)) {
        authType = await UserAuthTypeMaster.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        );
      }
    }

    if (!authType) {
      return res.status(404).json({ message: 'Auth type not found' });
    }

    return res.status(200).json({
      message: 'Auth type updated successfully',
      data: authType
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
      message: 'Server error while updating auth type',
      error: err.message
    });
  }
};

/**
 * Delete auth type by ID (MongoDB _id or PK_AuthTypeId)
 */
exports.deleteAuthType = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find and delete by PK_AuthTypeId first, then by MongoDB _id
    let authType = await UserAuthTypeMaster.findOneAndDelete({ PK_AuthTypeId: id });

    if (!authType) {
      // Only try to delete by MongoDB _id if `id` looks like a valid ObjectId
      if (require('mongoose').Types.ObjectId.isValid(id)) {
        authType = await UserAuthTypeMaster.findByIdAndDelete(id);
      }
    }

    if (!authType) {
      return res.status(404).json({ message: 'Auth type not found' });
    }

    return res.status(200).json({
      message: 'Auth type deleted successfully',
      data: authType
    });

  } catch (err) {
    return res.status(500).json({
      message: 'Server error while deleting auth type',
      error: err.message
    });
  }
};

/**
 * Get active auth types
 */
exports.getActiveAuthTypes = async (req, res) => {
  try {
    const { page = 1, limit = 25 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const authTypes = await UserAuthTypeMaster
      .find({ IsActive: true })
      .sort({ AuthType: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await UserAuthTypeMaster.countDocuments({ IsActive: true });

    return res.status(200).json({
      data: authTypes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (err) {
    return res.status(500).json({
      message: 'Server error while fetching active auth types',
      error: err.message
    });
  }
};

/**
 * Get next authTypeId
 */
exports.getNextAuthTypeId = async (req, res) => {
  try {
    const nextId = await generateNextAuthTypeId();
    return res.status(200).json({ PK_AuthTypeId: nextId });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};