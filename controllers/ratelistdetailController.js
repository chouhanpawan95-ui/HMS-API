const RateListDetail = require('../models/ratelistdetail');

// Helper: generate next rlDetailId
async function generateNextRLDetailId() {
  const lastRecord = await RateListDetail.findOne({ rlDetailId: { $regex: '^RLD\\d+$' } }).sort({ rlDetailId: -1 }).lean();
  let nextId = 'RLD0001';
  if (lastRecord && lastRecord.rlDetailId) {
    const lastNumber = parseInt(lastRecord.rlDetailId.replace(/^RLD/, ''), 10) || 0;
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    nextId = `RLD${newNumber}`;
  } else {
    const all = await RateListDetail.find({ rlDetailId: { $regex: '^RLD\\d+$' } }).select('rlDetailId').lean();
    if (all.length) {
      let max = 0;
      all.forEach(r => {
        const n = parseInt((r.rlDetailId || '').replace(/^RLD/, ''), 10) || 0;
        if (n > max) max = n;
      });
      const newNumber = (max + 1).toString().padStart(4, '0');
      nextId = `RLD${newNumber}`;
    }
  }
  return nextId;
}

// Create new rate list detail
exports.createRateListDetail = async (req, res) => {
  try {
    const data = req.body;
    if (!data.rlDetailId) data.rlDetailId = await generateNextRLDetailId();

    const existing = await RateListDetail.findOne({ rlDetailId: data.rlDetailId });
    if (existing) return res.status(409).json({ message: 'rlDetailId already exists' });

    const record = new RateListDetail(data);
    const validationError = record.validateSync();
    if (validationError) return res.status(400).json({ message: 'Validation error', errors: Object.values(validationError.errors).map(err => err.message) });

    const savedRecord = await record.save();
    return res.status(201).json(savedRecord);
  } catch (err) {
    console.error('Error creating rate list detail:', err);
    if (err.name === 'ValidationError') return res.status(400).json({ message: 'Validation error', errors: Object.values(err.errors).map(e => e.message) });
    if (err.code === 11000) return res.status(409).json({ message: 'Duplicate key error', error: err.message });
    return res.status(500).json({ message: 'Server error while creating rate list detail', error: err.message });
  }
};

// Get all rate list details with optional search
exports.getRateListDetails = async (req, res) => {
  try {
    const { page = 1, limit = 25, q } = req.query;
    const filter = {};
    if (q) filter.$or = [ { rlDetailId: new RegExp(q, 'i') }, { FK_RateListId: new RegExp(q, 'i') }, { FK_ServiceId: new RegExp(q, 'i') } ];

    const records = await RateListDetail.find(filter).skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await RateListDetail.countDocuments(filter);
    return res.json({ data: records, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching rate list details:', err);
    return res.status(500).json({ message: 'Error fetching rate list details', error: err.message });
  }
};

// Get rate list details by FK_RateListId
exports.getByRateListId = async (req, res) => {
  try {
    const { rateListId } = req.params;
    const { page = 1, limit = 25 } = req.query;
    
    const records = await RateListDetail.find({ FK_RateListId: rateListId })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    
    const total = await RateListDetail.countDocuments({ FK_RateListId: rateListId });
    return res.json({ data: records, total, page: Number(page), limit: Number(limit), FK_RateListId: rateListId });
  } catch (err) {
    console.error('Error fetching rate list details by rate list ID:', err);
    return res.status(500).json({ message: 'Error fetching rate list details', error: err.message });
  }
};

// Get next rlDetailId
exports.getNextRLDetailId = async (req, res) => {
  try {
    const nextId = await generateNextRLDetailId();
    return res.json({ rlDetailId: nextId });
  } catch (err) {
    console.error('Error getting next rlDetailId:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get rate list detail by id
exports.getRateListDetailById = async (req, res) => {
  try {
    const query = /^[0-9a-fA-F]{24}$/.test(req.params.id) ? { _id: req.params.id } : { rlDetailId: req.params.id };
    const record = await RateListDetail.findOne(query);
    if (!record) return res.status(404).json({ message: 'Rate list detail not found' });
    return res.json(record);
  } catch (error) {
    console.error('Error fetching rate list detail:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update rate list detail
exports.updateRateListDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const record = (await RateListDetail.findById(id)) || (await RateListDetail.findOne({ rlDetailId: id }));
    if (!record) return res.status(404).json({ message: 'Rate list detail not found' });
    Object.assign(record, data);
    await record.save();
    return res.json(record);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete rate list detail
exports.deleteRateListDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const record = (await RateListDetail.findByIdAndDelete(id)) || (await RateListDetail.findOneAndDelete({ rlDetailId: id }));
    if (!record) return res.status(404).json({ message: 'Rate list detail not found' });
    return res.json({ message: 'Deleted', id: record._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
