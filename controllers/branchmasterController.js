// controllers/branchmasterController.js
const BranchMaster = require('../models/branchmaster');

// Helper: generate next branchId (BRANCH0001)
async function generateNextBranchId() {
  try {
    // Get all records with BRANCH IDs
    const allRecords = await BranchMaster
      .find({ PK_BranchId: { $regex: '^BRANCH\\d+$' } })
      .select('PK_BranchId')
      .lean();

    let maxNumber = 0;

    // Find the maximum numeric value
    if (allRecords.length > 0) {
      allRecords.forEach(record => {
        const numStr = (record.PK_BranchId || '').replace(/^BRANCH/, '');
        const num = parseInt(numStr, 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      });
    }

    const nextNumber = (maxNumber + 1).toString().padStart(4, '0');
    return `BRANCH${nextNumber}`;
  } catch (err) {
    console.error('Error generating next branchId:', err);
    return 'BRANCH0001';
  }
}

/**
 * Create new branch
 */
exports.createBranch = async (req, res) => {
  try {
    const data = req.body;

    // Auto-generate PK_BranchId if not provided
    if (!data.PK_BranchId) {
      data.PK_BranchId = await generateNextBranchId();
    }

    // Check if PK_BranchId already exists
    const existing = await BranchMaster.findOne({ PK_BranchId: data.PK_BranchId });
    if (existing) {
      return res.status(409).json({ message: 'PK_BranchId already exists' });
    }

    // Create new branch
    const branch = new BranchMaster(data);

    // Validate the document against the schema
    const validationError = branch.validateSync();
    if (validationError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(validationError.errors).map(err => err.message)
      });
    }

    // Save the branch
    const saved = await branch.save();
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
      message: 'Server error while creating branch',
      error: err.message
    });
  }
};

/**
 * Get all branches with optional query (pagination, search)
 */
exports.getBranches = async (req, res) => {
  try {
    const { page = 1, limit = 25, q } = req.query;
    const filter = {};

    if (q) {
      // Text search across multiple fields
      filter.$or = [
        { PK_BranchId: { $regex: q, $options: 'i' } },
        { BranchName: { $regex: q, $options: 'i' } },
        { BranchCode: { $regex: q, $options: 'i' } },
        { Address: { $regex: q, $options: 'i' } },
        { ContactPerson: { $regex: q, $options: 'i' } },
        { ContactNo: { $regex: q, $options: 'i' } },
        { EmailAddress: { $regex: q, $options: 'i' } },
        { GSTNo: { $regex: q, $options: 'i' } },
        { PANNo: { $regex: q, $options: 'i' } },
        { PK_SynchId: { $regex: q, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const branches = await BranchMaster
      .find(filter)
      .sort({ BranchName: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await BranchMaster.countDocuments(filter);

    return res.status(200).json({
      data: branches,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Server error while fetching branches',
      error: err.message
    });
  }
};

/**
 * Get branch by ID (MongoDB _id or PK_BranchId)
 */
exports.getBranchById = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find by PK_BranchId first, then by MongoDB _id
    let branch = await BranchMaster.findOne({ PK_BranchId: id });

    if (!branch) {
      // Only try to find by MongoDB _id if `id` looks like a valid ObjectId
      if (require('mongoose').Types.ObjectId.isValid(id)) {
        branch = await BranchMaster.findById(id);
      }
    }

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    return res.status(200).json(branch);

  } catch (err) {
    return res.status(500).json({
      message: 'Server error while fetching branch',
      error: err.message
    });
  }
};

/**
 * Update branch by ID (MongoDB _id or PK_BranchId)
 */
exports.updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that should not be updated
    delete updateData._id;
    delete updateData.__v;

    // Check if trying to update PK_BranchId to a value that already exists
    if (updateData.PK_BranchId) {
      const existing = await BranchMaster.findOne({
        PK_BranchId: updateData.PK_BranchId,
        PK_BranchId: { $ne: id }
      });
      if (existing) {
        return res.status(409).json({ message: 'PK_BranchId already exists' });
      }
    }

    // Try to find and update by PK_BranchId first, then by MongoDB _id
    let branch = await BranchMaster.findOneAndUpdate(
      { PK_BranchId: id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!branch) {
      // Only try to update by MongoDB _id if `id` is a valid ObjectId
      if (require('mongoose').Types.ObjectId.isValid(id)) {
        branch = await BranchMaster.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        );
      }
    }

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    return res.status(200).json({
      message: 'Branch updated successfully',
      data: branch
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
      message: 'Server error while updating branch',
      error: err.message
    });
  }
};

/**
 * Delete branch by ID (MongoDB _id or PK_BranchId)
 */
exports.deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find and delete by PK_BranchId first, then by MongoDB _id
    let branch = await BranchMaster.findOneAndDelete({ PK_BranchId: id });

    if (!branch) {
      // Only try to delete by MongoDB _id if `id` looks like a valid ObjectId
      if (require('mongoose').Types.ObjectId.isValid(id)) {
        branch = await BranchMaster.findByIdAndDelete(id);
      }
    }

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    return res.status(200).json({
      message: 'Branch deleted successfully',
      data: branch
    });

  } catch (err) {
    return res.status(500).json({
      message: 'Server error while deleting branch',
      error: err.message
    });
  }
};

/**
 * Get active branches
 */
exports.getActiveBranches = async (req, res) => {
  try {
    const { page = 1, limit = 25 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const branches = await BranchMaster
      .find({ IsActive: true })
      .sort({ BranchName: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await BranchMaster.countDocuments({ IsActive: true });

    return res.status(200).json({
      data: branches,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (err) {
    return res.status(500).json({
      message: 'Server error while fetching active branches',
      error: err.message
    });
  }
};

/**
 * Get next branchId
 */
exports.getNextBranchId = async (req, res) => {
  try {
    const nextId = await generateNextBranchId();
    return res.status(200).json({ PK_BranchId: nextId });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};