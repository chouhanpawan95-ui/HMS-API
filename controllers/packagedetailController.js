const PackageDetail = require('../models/packagedetail');

// Helper: generate next pkgDetailId (e.g., PKD0001)
async function generateNextPkgDetailId() {
  const lastRecord = await PackageDetail.findOne({ pkgDetailId: { $regex: '^PKD\\d+$' } }).sort({ pkgDetailId: -1 }).lean();
  let nextId = 'PKD0001';
  if (lastRecord && lastRecord.pkgDetailId) {
    const lastNumber = parseInt(lastRecord.pkgDetailId.replace(/^PKD/, ''), 10) || 0;
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    nextId = `PKD${newNumber}`;
  } else {
    const all = await PackageDetail.find({ pkgDetailId: { $regex: '^PKD\\d+$' } }).select('pkgDetailId').lean();
    if (all.length) {
      let max = 0;
      all.forEach(r => {
        const n = parseInt((r.pkgDetailId || '').replace(/^PKD/, ''), 10) || 0;
        if (n > max) max = n;
      });
      const newNumber = (max + 1).toString().padStart(4, '0');
      nextId = `PKD${newNumber}`;
    }
  }
  return nextId;
}

// Create new package detail
exports.createPackageDetail = async (req, res) => {
  try {
    const data = req.body;
    if (!data.pkgDetailId) data.pkgDetailId = await generateNextPkgDetailId();

    const existing = await PackageDetail.findOne({ pkgDetailId: data.pkgDetailId });
    if (existing) return res.status(409).json({ message: 'pkgDetailId already exists' });

    const record = new PackageDetail(data);
    const validationError = record.validateSync();
    if (validationError) return res.status(400).json({ message: 'Validation error', errors: Object.values(validationError.errors).map(err => err.message) });

    const saved = await record.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating package detail:', err);
    if (err.name === 'ValidationError') return res.status(400).json({ message: 'Validation error', errors: Object.values(err.errors).map(e => e.message) });
    if (err.code === 11000) return res.status(409).json({ message: 'Duplicate key error', error: err.message });
    return res.status(500).json({ message: 'Server error while creating package detail', error: err.message });
  }
};

// Get all package details with optional search
exports.getPackageDetails = async (req, res) => {
  try {
    const { page = 1, limit = 25, q } = req.query;
    const filter = {};
    if (q) filter.$or = [ { pkgDetailId: new RegExp(q, 'i') }, { FK_PackageId: new RegExp(q, 'i') }, { FK_ServiceId: new RegExp(q, 'i') } ];

    const records = await PackageDetail.find(filter).skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await PackageDetail.countDocuments(filter);
    return res.json({ data: records, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching package details:', err);
    return res.status(500).json({ message: 'Error fetching package details', error: err.message });
  }
};

// Get package details by FK_PackageId
exports.getByPackageId = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { page = 1, limit = 25 } = req.query;

    const records = await PackageDetail.find({ FK_PackageId: packageId }).skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await PackageDetail.countDocuments({ FK_PackageId: packageId });
    return res.json({ data: records, total, page: Number(page), limit: Number(limit), FK_PackageId: packageId });
  } catch (err) {
    console.error('Error fetching package details by package ID:', err);
    return res.status(500).json({ message: 'Error fetching package details', error: err.message });
  }
};

// Get next pkgDetailId
exports.getNextPkgDetailId = async (req, res) => {
  try {
    const nextId = await generateNextPkgDetailId();
    return res.json({ pkgDetailId: nextId });
  } catch (err) {
    console.error('Error getting next pkgDetailId:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get package detail by id (mongo _id or pkgDetailId)
exports.getPackageDetailById = async (req, res) => {
  try {
    const query = /^[0-9a-fA-F]{24}$/.test(req.params.id) ? { _id: req.params.id } : { pkgDetailId: req.params.id };
    const record = await PackageDetail.findOne(query);
    if (!record) return res.status(404).json({ message: 'Package detail not found' });
    return res.json(record);
  } catch (err) {
    console.error('Error fetching package detail:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update package detail
exports.updatePackageDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const record = (await PackageDetail.findById(id)) || (await PackageDetail.findOne({ pkgDetailId: id }));
    if (!record) return res.status(404).json({ message: 'Package detail not found' });
    Object.assign(record, data);
    await record.save();
    return res.json(record);
  } catch (err) {
    console.error('Error updating package detail:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete package detail
exports.deletePackageDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const record = (await PackageDetail.findByIdAndDelete(id)) || (await PackageDetail.findOneAndDelete({ pkgDetailId: id }));
    if (!record) return res.status(404).json({ message: 'Package detail not found' });
    return res.json({ message: 'Deleted', id: record._id });
  } catch (err) {
    console.error('Error deleting package detail:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
