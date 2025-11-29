const RateListMaster = require('../models/ratelistmaster');

// Helper: generate next rateListId
async function generateNextRateListId() {
  const lastRecord = await RateListMaster.findOne({ rateListId: { $regex: '^RL\\d+$' } }).sort({ rateListId: -1 }).lean();
  let nextId = 'RL0001';
  if (lastRecord && lastRecord.rateListId) {
    const lastNumber = parseInt(lastRecord.rateListId.replace(/^RL/, ''), 10) || 0;
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    nextId = `RL${newNumber}`;
  } else {
    const all = await RateListMaster.find({ rateListId: { $regex: '^RL\\d+$' } }).select('rateListId').lean();
    if (all.length) {
      let max = 0;
      all.forEach(r => {
        const n = parseInt((r.rateListId || '').replace(/^RL/, ''), 10) || 0;
        if (n > max) max = n;
      });
      const newNumber = (max + 1).toString().padStart(4, '0');
      nextId = `RL${newNumber}`;
    }
  }
  return nextId;
}

// Create new rate list master
exports.createRateListMaster = async (req, res) => {
  try {
    const data = req.body;
    if (!data.rateListId) data.rateListId = await generateNextRateListId();

    const existing = await RateListMaster.findOne({ rateListId: data.rateListId });
    if (existing) return res.status(409).json({ message: 'rateListId already exists' });

    const record = new RateListMaster(data);
    const validationError = record.validateSync();
    if (validationError) return res.status(400).json({ message: 'Validation error', errors: Object.values(validationError.errors).map(err => err.message) });

    const savedRecord = await record.save();
    return res.status(201).json(savedRecord);
  } catch (err) {
    console.error('Error creating rate list master:', err);
    if (err.name === 'ValidationError') return res.status(400).json({ message: 'Validation error', errors: Object.values(err.errors).map(e => e.message) });
    if (err.code === 11000) return res.status(409).json({ message: 'Duplicate key error', error: err.message });
    return res.status(500).json({ message: 'Server error while creating rate list master', error: err.message });
  }
};

// Get all rate list masters with optional search
exports.getRateListMasters = async (req, res) => {
  try {
    const { page = 1, limit = 25, q } = req.query;
    const filter = {};
    if (q) filter.$or = [ { rateListId: new RegExp(q, 'i') }, { RateListName: new RegExp(q, 'i') }, { FK_BranchId: new RegExp(q, 'i') } ];

    const records = await RateListMaster.find(filter).skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await RateListMaster.countDocuments(filter);
    return res.json({ data: records, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching rate list masters:', err);
    return res.status(500).json({ message: 'Error fetching rate list masters', error: err.message });
  }
};

// Get next rateListId
exports.getNextRateListId = async (req, res) => {
  try {
    const nextId = await generateNextRateListId();
    return res.json({ rateListId: nextId });
  } catch (err) {
    console.error('Error getting next rateListId:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get rate list master by id
exports.getRateListMasterById = async (req, res) => {
  try {
    const query = /^[0-9a-fA-F]{24}$/.test(req.params.id) ? { _id: req.params.id } : { rateListId: req.params.id };
    const record = await RateListMaster.findOne(query);
    if (!record) return res.status(404).json({ message: 'Rate list master not found' });
    return res.json(record);
  } catch (error) {
    console.error('Error fetching rate list master:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update rate list master
exports.updateRateListMaster = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const record = (await RateListMaster.findById(id)) || (await RateListMaster.findOne({ rateListId: id }));
    if (!record) return res.status(404).json({ message: 'Rate list master not found' });
    Object.assign(record, data);
    await record.save();
    return res.json(record);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete rate list master
exports.deleteRateListMaster = async (req, res) => {
  try {
    const { id } = req.params;
    const record = (await RateListMaster.findByIdAndDelete(id)) || (await RateListMaster.findOneAndDelete({ rateListId: id }));
    if (!record) return res.status(404).json({ message: 'Rate list master not found' });
    return res.json({ message: 'Deleted', id: record._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
