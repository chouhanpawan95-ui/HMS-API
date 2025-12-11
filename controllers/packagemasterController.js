const PackageMaster = require('../models/packagemaster');

// Helper: generate next packageId (e.g., PKG0001)
async function generateNextPackageId() {
  const last = await PackageMaster.findOne({ packageId: { $regex: '^PKG\\d+$' } }).sort({ packageId: -1 }).lean();
  let nextId = 'PKG0001';
  if (last && last.packageId) {
    const lastNumber = parseInt(last.packageId.replace(/^PKG/, ''), 10) || 0;
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    nextId = `PKG${newNumber}`;
  } else {
    const all = await PackageMaster.find({ packageId: { $regex: '^PKG\\d+$' } }).select('packageId').lean();
    if (all.length) {
      let max = 0;
      all.forEach(r => {
        const n = parseInt((r.packageId || '').replace(/^PKG/, ''), 10) || 0;
        if (n > max) max = n;
      });
      const newNumber = (max + 1).toString().padStart(4, '0');
      nextId = `PKG${newNumber}`;
    }
  }
  return nextId;
}

// Create new package master
exports.createPackageMaster = async (req, res) => {
  try {
    const data = req.body;
    if (!data.packageId) data.packageId = await generateNextPackageId();

    const existing = await PackageMaster.findOne({ packageId: data.packageId });
    if (existing) return res.status(409).json({ message: 'packageId already exists' });

    const record = new PackageMaster(data);
    const validationError = record.validateSync();
    if (validationError) return res.status(400).json({ message: 'Validation error', errors: Object.values(validationError.errors).map(err => err.message) });

    const saved = await record.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating package master:', err);
    if (err.name === 'ValidationError') return res.status(400).json({ message: 'Validation error', errors: Object.values(err.errors).map(e => e.message) });
    if (err.code === 11000) return res.status(409).json({ message: 'Duplicate key error', error: err.message });
    return res.status(500).json({ message: 'Server error while creating package master', error: err.message });
  }
};

// Get all package masters with optional search
exports.getPackageMasters = async (req, res) => {
  try {
    const { page = 1, limit = 25, q } = req.query;
    const filter = {};
    if (q) filter.$or = [ { packageId: new RegExp(q, 'i') }, { PackageName: new RegExp(q, 'i') }, { PackageCodeNo: new RegExp(q, 'i') } ];

    const records = await PackageMaster.find(filter).skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await PackageMaster.countDocuments(filter);
    return res.json({ data: records, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching package masters:', err);
    return res.status(500).json({ message: 'Error fetching package masters', error: err.message });
  }
};

// Get next packageId
exports.getNextPackageId = async (req, res) => {
  try {
    const nextId = await generateNextPackageId();
    return res.json({ packageId: nextId });
  } catch (err) {
    console.error('Error getting next packageId:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get package master by id
exports.getPackageMasterById = async (req, res) => {
  try {
    const query = /^[0-9a-fA-F]{24}$/.test(req.params.id) ? { _id: req.params.id } : { packageId: req.params.id };
    const record = await PackageMaster.findOne(query);
    if (!record) return res.status(404).json({ message: 'Package master not found' });
    return res.json(record);
  } catch (error) {
    console.error('Error fetching package master:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update package master
exports.updatePackageMaster = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const record = (await PackageMaster.findById(id)) || (await PackageMaster.findOne({ packageId: id }));
    if (!record) return res.status(404).json({ message: 'Package master not found' });
    Object.assign(record, data);
    await record.save();
    return res.json(record);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete package master
exports.deletePackageMaster = async (req, res) => {
  try {
    const { id } = req.params;
    const record = (await PackageMaster.findByIdAndDelete(id)) || (await PackageMaster.findOneAndDelete({ packageId: id }));
    if (!record) return res.status(404).json({ message: 'Package master not found' });
    return res.json({ message: 'Deleted', id: record._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
