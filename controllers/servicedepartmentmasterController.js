const ServiceDepartmentMaster = require('../models/servicedepartmentmaster');

// Helper: generate next departmentId
async function generateNextDepartmentId() {
  const last = await ServiceDepartmentMaster.findOne({ departmentId: { $regex: '^SD\\d+$' } }).sort({ departmentId: -1 }).lean();
  let nextId = 'SD0001';
  if (last && last.departmentId) {
    const lastNumber = parseInt(last.departmentId.replace(/^SD/, ''), 10) || 0;
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    nextId = `SD${newNumber}`;
  } else {
    const all = await ServiceDepartmentMaster.find({ departmentId: { $regex: '^SD\\d+$' } }).select('departmentId').lean();
    if (all.length) {
      let max = 0;
      all.forEach(r => {
        const n = parseInt((r.departmentId || '').replace(/^SD/, ''), 10) || 0;
        if (n > max) max = n;
      });
      const newNumber = (max + 1).toString().padStart(4, '0');
      nextId = `SD${newNumber}`;
    }
  }
  return nextId;
}

// Create
exports.createServiceDepartmentMaster = async (req, res) => {
  try {
    const data = req.body;
    if (!data.departmentId) data.departmentId = await generateNextDepartmentId();

    const existing = await ServiceDepartmentMaster.findOne({ departmentId: data.departmentId });
    if (existing) return res.status(409).json({ message: 'departmentId already exists' });

    const record = new ServiceDepartmentMaster(data);
    const validationError = record.validateSync();
    if (validationError) return res.status(400).json({ message: 'Validation error', errors: Object.values(validationError.errors).map(e => e.message) });

    const saved = await record.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating service department master:', err);
    if (err.name === 'ValidationError') return res.status(400).json({ message: 'Validation error', errors: Object.values(err.errors).map(e => e.message) });
    if (err.code === 11000) return res.status(409).json({ message: 'Duplicate key error', error: err.message });
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// List / Search
exports.getServiceDepartmentMasters = async (req, res) => {
  try {
    const { page = 1, limit = 25, q } = req.query;
    const filter = {};
    if (q) filter.$or = [ { departmentId: new RegExp(q, 'i') }, { DeptName: new RegExp(q, 'i') }, { DeptType: new RegExp(q, 'i') } ];

    const records = await ServiceDepartmentMaster.find(filter).skip((page - 1) * limit).limit(Number(limit)).sort({ SeqNo: 1, createdAt: -1 });
    const total = await ServiceDepartmentMaster.countDocuments(filter);
    return res.json({ data: records, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching service department masters:', err);
    return res.status(500).json({ message: 'Error fetching service department masters', error: err.message });
  }
};

// Next ID
exports.getNextDepartmentId = async (req, res) => {
  try {
    const nextId = await generateNextDepartmentId();
    return res.json({ departmentId: nextId });
  } catch (err) {
    console.error('Error getting next departmentId:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get by id
exports.getServiceDepartmentMasterById = async (req, res) => {
  try {
    const query = /^[0-9a-fA-F]{24}$/.test(req.params.id) ? { _id: req.params.id } : { departmentId: req.params.id };
    const record = await ServiceDepartmentMaster.findOne(query);
    if (!record) return res.status(404).json({ message: 'Service department not found' });
    return res.json(record);
  } catch (err) {
    console.error('Error fetching service department master:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update
exports.updateServiceDepartmentMaster = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const record = (await ServiceDepartmentMaster.findById(id)) || (await ServiceDepartmentMaster.findOne({ departmentId: id }));
    if (!record) return res.status(404).json({ message: 'Service department not found' });
    Object.assign(record, data);
    await record.save();
    return res.json(record);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete
exports.deleteServiceDepartmentMaster = async (req, res) => {
  try {
    const { id } = req.params;
    const record = (await ServiceDepartmentMaster.findByIdAndDelete(id)) || (await ServiceDepartmentMaster.findOneAndDelete({ departmentId: id }));
    if (!record) return res.status(404).json({ message: 'Service department not found' });
    return res.json({ message: 'Deleted', id: record._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
