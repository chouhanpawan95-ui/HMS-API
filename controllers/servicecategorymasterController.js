const ServiceCategoryMaster = require('../models/servicecategorymaster');

// Helper: generate next categoryId
async function generateNextCategoryId() {
  const lastRecord = await ServiceCategoryMaster.findOne({ categoryId: { $regex: '^SC\\d+$' } }).sort({ categoryId: -1 }).lean();
  let nextId = 'SC0001';
  if (lastRecord && lastRecord.categoryId) {
    const lastNumber = parseInt(lastRecord.categoryId.replace(/^SC/, ''), 10) || 0;
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    nextId = `SC${newNumber}`;
  } else {
    const all = await ServiceCategoryMaster.find({ categoryId: { $regex: '^SC\\d+$' } }).select('categoryId').lean();
    if (all.length) {
      let max = 0;
      all.forEach(s => {
        const n = parseInt((s.categoryId || '').replace(/^SC/, ''), 10) || 0;
        if (n > max) max = n;
      });
      const newNumber = (max + 1).toString().padStart(4, '0');
      nextId = `SC${newNumber}`;
    }
  }
  return nextId;
}

// Create new service category master
exports.createServiceCategoryMaster = async (req, res) => {
  try {
    const data = req.body;
    if (!data.categoryId) data.categoryId = await generateNextCategoryId();

    const existing = await ServiceCategoryMaster.findOne({ categoryId: data.categoryId });
    if (existing) return res.status(409).json({ message: 'categoryId already exists' });

    const record = new ServiceCategoryMaster(data);
    const validationError = record.validateSync();
    if (validationError) return res.status(400).json({ message: 'Validation error', errors: Object.values(validationError.errors).map(err => err.message) });

    const savedRecord = await record.save();
    return res.status(201).json(savedRecord);
  } catch (err) {
    console.error('Error creating service category master:', err);
    if (err.name === 'ValidationError') return res.status(400).json({ message: 'Validation error', errors: Object.values(err.errors).map(e => e.message) });
    if (err.code === 11000) return res.status(409).json({ message: 'Duplicate key error', error: err.message });
    return res.status(500).json({ message: 'Server error while creating service category master', error: err.message });
  }
};

// Get all service category masters with optional search
exports.getServiceCategoryMasters = async (req, res) => {
  try {
    const { page = 1, limit = 25, q } = req.query;
    const filter = {};
    if (q) filter.$or = [ { categoryId: new RegExp(q, 'i') }, { CategoryName: new RegExp(q, 'i') }, { FK_DeptId: new RegExp(q, 'i') } ];

    const records = await ServiceCategoryMaster.find(filter).skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await ServiceCategoryMaster.countDocuments(filter);
    return res.json({ data: records, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching service category masters:', err);
    return res.status(500).json({ message: 'Error fetching service category masters', error: err.message });
  }
};

// Get next categoryId
exports.getNextCategoryId = async (req, res) => {
  try {
    const nextId = await generateNextCategoryId();
    return res.json({ categoryId: nextId });
  } catch (err) {
    console.error('Error getting next categoryId:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get service category master by id
exports.getServiceCategoryMasterById = async (req, res) => {
  try {
    const query = /^[0-9a-fA-F]{24}$/.test(req.params.id) ? { _id: req.params.id } : { categoryId: req.params.id };
    const record = await ServiceCategoryMaster.findOne(query);
    if (!record) return res.status(404).json({ message: 'Service category master not found' });
    return res.json(record);
  } catch (error) {
    console.error('Error fetching service category master:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update service category master
exports.updateServiceCategoryMaster = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const record = (await ServiceCategoryMaster.findById(id)) || (await ServiceCategoryMaster.findOne({ categoryId: id }));
    if (!record) return res.status(404).json({ message: 'Service category master not found' });
    Object.assign(record, data);
    await record.save();
    return res.json(record);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete service category master
exports.deleteServiceCategoryMaster = async (req, res) => {
  try {
    const { id } = req.params;
    const record = (await ServiceCategoryMaster.findByIdAndDelete(id)) || (await ServiceCategoryMaster.findOneAndDelete({ categoryId: id }));
    if (!record) return res.status(404).json({ message: 'Service category master not found' });
    return res.json({ message: 'Deleted', id: record._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
