// controllers/usermasterController.js
const mongoose = require('mongoose');
const UserMaster = require('../models/user');

// Helper: generate next userId (USR0001)
async function generateNextUserId() {
  try {
    // Get all users with USR IDs
    const allRecords = await UserMaster
      .find({ PK_UserId: { $regex: '^USR\\d+$' } })
      .select('PK_UserId')
      .lean();
    
    let maxNumber = 0;
    
    // Find the maximum numeric value
    if (allRecords.length > 0) {
      allRecords.forEach(record => {
        const numStr = (record.PK_UserId || '').replace(/^USR/, '');
        const num = parseInt(numStr, 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      });
    }
    
    const nextNumber = (maxNumber + 1).toString().padStart(4, '0');
    return `USR${nextNumber}`;
  } catch (err) {
    console.error('Error generating next userId:', err);
    return 'USR0001';
  }
}

/**
 * Create new user
 */
exports.createUser = async (req, res) => {
  try {
    const data = req.body;

    // Auto-generate PK_UserId if not provided
    if (!data.PK_UserId) {
      data.PK_UserId = await generateNextUserId();
    }

    // Check if LoginName already exists
    const existingUser = await UserMaster.findOne({ LoginName: data.LoginName });
    if (existingUser) {
      return res.status(409).json({ message: 'LoginName already exists' });
    }

    // Check if PK_UserId already exists
    const userWithId = await UserMaster.findOne({ PK_UserId: data.PK_UserId });
    if (userWithId) {
      return res.status(409).json({ message: 'PK_UserId already exists' });
    }

    // Create new user
    const user = new UserMaster(data);
    
    // Validate the document against the schema
    const validationError = user.validateSync();
    if (validationError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(validationError.errors).map(err => err.message)
      });
    }

    // Save the user
    const savedUser = await user.save();
    return res.status(201).json(savedUser);

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
      message: 'Server error while creating user',
      error: err.message
    });
  }
};

/**
 * Get all users with optional query (pagination, search)
 */
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 25, q } = req.query;
    const filter = {};

    if (q) {
      // Text search across multiple fields
      filter.$or = [
        { PK_UserId: { $regex: q, $options: 'i' } },
        { LoginName: { $regex: q, $options: 'i' } },
        { UserName: { $regex: q, $options: 'i' } },
        { Email: { $regex: q, $options: 'i' } },
        { MobileNo: { $regex: q, $options: 'i' } },
        { ClinicName: { $regex: q, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await UserMaster
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await UserMaster.countDocuments(filter);

    return res.status(200).json({
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Server error while fetching users',
      error: err.message
    });
  }
};

/**
 * Get user by ID (MongoDB _id or PK_UserId)
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find by PK_UserId first, then by MongoDB _id
    let user = await UserMaster.findOne({ PK_UserId: id });
    
    if (!user) {
      // Only try to find by MongoDB _id if `id` looks like a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(id)) {
        user = await UserMaster.findById(id);
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);

  } catch (err) {
    return res.status(500).json({
      message: 'Server error while fetching user',
      error: err.message
    });
  }
};

/**
 * Update user by ID (MongoDB _id or PK_UserId)
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that should not be updated
    delete updateData._id;
    delete updateData.__v;

    // Check if trying to update LoginName to a value that already exists
    if (updateData.LoginName) {
      const existingUser = await UserMaster.findOne({
        LoginName: updateData.LoginName,
        PK_UserId: { $ne: id }
      });
      if (existingUser) {
        return res.status(409).json({ message: 'LoginName already exists' });
      }
    }

    // Try to find and update by PK_UserId first, then by MongoDB _id
    let user = await UserMaster.findOneAndUpdate(
      { PK_UserId: id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      user = await UserMaster.findOneAndUpdate(
        { PK_UserId: id },
        updateData,
        { new: true, runValidators: true }
      );
    }

    if (!user) {
      // Only try to update by MongoDB _id if `id` is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(id)) {
        user = await UserMaster.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        );
      }
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'User updated successfully',
      data: user
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
      message: 'Server error while updating user',
      error: err.message
    });
  }
};

/**
 * Delete user by ID (MongoDB _id or PK_UserId)
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find and delete by PK_UserId first, then by MongoDB _id
    let user = await UserMaster.findOneAndDelete({ PK_UserId: id });

    if (!user) {
      // Only try to delete by MongoDB _id if `id` looks like a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(id)) {
        user = await UserMaster.findByIdAndDelete(id);
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'User deleted successfully',
      data: user
    });

  } catch (err) {
    return res.status(500).json({
      message: 'Server error while deleting user',
      error: err.message
    });
  }
};

/**
 * Get user by LoginName
 */
exports.getUserByLoginName = async (req, res) => {
  try {
    const { loginName } = req.params;

    const user = await UserMaster.findOne({ LoginName: loginName });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);

  } catch (err) {
    return res.status(500).json({
      message: 'Server error while fetching user',
      error: err.message
    });
  }
};

/**
 * Get users by user type
 */
exports.getUsersByType = async (req, res) => {
  try {
    const { userType } = req.params;
    const { page = 1, limit = 25 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await UserMaster
      .find({ UserType: userType, IsActive: true })
      .sort({ UserName: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await UserMaster.countDocuments({ UserType: userType, IsActive: true });

    return res.status(200).json({
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (err) {
    return res.status(500).json({
      message: 'Server error while fetching users',
      error: err.message
    });
  }
};

/**
 * Get active users
 */
exports.getActiveUsers = async (req, res) => {
  try {
    const { page = 1, limit = 25 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await UserMaster
      .find({ IsActive: true })
      .sort({ UserName: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await UserMaster.countDocuments({ IsActive: true });

    return res.status(200).json({
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (err) {
    return res.status(500).json({
      message: 'Server error while fetching users',
      error: err.message
    });
  }
};

/**
 * Get next userId
 */
exports.getNextUserId = async (req, res) => {
  try {
    
    // Test database connection
    const testRecord = await UserMaster.findOne({}).lean();
    
    const nextId = await generateNextUserId();
    
    const response = { PK_UserId: nextId };
    
    res.setHeader('Content-Type', 'application/json');
    return res.json(response);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
