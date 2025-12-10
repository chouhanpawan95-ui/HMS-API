const BillDetail = require('../models/billdetail');

// Helper: generate next PK_BillDetailId (e.g., BLD0001)
async function generateNextBillDetailId() {
  const last = await BillDetail.findOne({ PK_BillDetailId: { $regex: '^BLD\\d+$' } }).sort({ PK_BillDetailId: -1 }).lean();
  let nextId = 'BLD0001';
  if (last && last.PK_BillDetailId) {
    const lastNumber = parseInt(last.PK_BillDetailId.replace(/^BLD/, ''), 10) || 0;
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    nextId = `BLD${newNumber}`;
  } else {
    const all = await BillDetail.find({ PK_BillDetailId: { $regex: '^BLD\\d+$' } }).select('PK_BillDetailId').lean();
    if (all.length) {
      let max = 0;
      all.forEach(r => {
        const n = parseInt((r.PK_BillDetailId || '').replace(/^BLD/, ''), 10) || 0;
        if (n > max) max = n;
      });
      const newNumber = (max + 1).toString().padStart(4, '0');
      nextId = `BLD${newNumber}`;
    }
  }
  return nextId;
}

// Create new bill detail
exports.createBillDetail = async (req, res) => {
  try {
    const data = req.body;
    if (!data.PK_BillDetailId) data.PK_BillDetailId = await generateNextBillDetailId();

    const existing = await BillDetail.findOne({ PK_BillDetailId: data.PK_BillDetailId });
    if (existing) return res.status(409).json({ message: 'PK_BillDetailId already exists' });

    const record = new BillDetail(data);
    const validationError = record.validateSync();
    if (validationError) return res.status(400).json({ message: 'Validation error', errors: Object.values(validationError.errors).map(err => err.message) });

    const saved = await record.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating bill detail:', err);
    if (err.name === 'ValidationError') return res.status(400).json({ message: 'Validation error', errors: Object.values(err.errors).map(e => e.message) });
    if (err.code === 11000) return res.status(409).json({ message: 'Duplicate key error', error: err.message });
    return res.status(500).json({ message: 'Server error while creating bill detail', error: err.message });
  }
};

// Get all bill details with optional search
exports.getBillDetails = async (req, res) => {
  try {
    const { page = 1, limit = 25, q } = req.query;
    const filter = {};
    if (q) filter.$or = [
      { PK_BillDetailId: new RegExp(q, 'i') },
      { FK_BillId: new RegExp(q, 'i') },
      { FK_ServiceId: new RegExp(q, 'i') }
    ];

    const records = await BillDetail.find(filter).skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await BillDetail.countDocuments(filter);
    return res.json({ data: records, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching bill details:', err);
    return res.status(500).json({ message: 'Error fetching bill details', error: err.message });
  }
};

// Get bill details by FK_BillId
exports.getByBillId = async (req, res) => {
  try {
    const { billId } = req.params;
    const { page = 1, limit = 25 } = req.query;

    const records = await BillDetail.find({ FK_BillId: billId }).skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await BillDetail.countDocuments({ FK_BillId: billId });
    return res.json({ data: records, total, page: Number(page), limit: Number(limit), FK_BillId: billId });
  } catch (err) {
    console.error('Error fetching bill details by bill ID:', err);
    return res.status(500).json({ message: 'Error fetching bill details', error: err.message });
  }
};

// Get next PK_BillDetailId
exports.getNextBillDetailId = async (req, res) => {
  try {
    const nextId = await generateNextBillDetailId();
    return res.json({ PK_BillDetailId: nextId });
  } catch (err) {
    console.error('Error getting next bill detail id:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get bill detail by id (mongo _id or PK_BillDetailId)
exports.getBillDetailById = async (req, res) => {
  try {
    const query = /^[0-9a-fA-F]{24}$/.test(req.params.id) ? { _id: req.params.id } : { PK_BillDetailId: req.params.id };
    const record = await BillDetail.findOne(query);
    if (!record) return res.status(404).json({ message: 'Bill detail not found' });
    return res.json(record);
  } catch (err) {
    console.error('Error fetching bill detail:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update bill detail
exports.updateBillDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const record = (await BillDetail.findById(id)) || (await BillDetail.findOne({ PK_BillDetailId: id }));
    if (!record) return res.status(404).json({ message: 'Bill detail not found' });
    Object.assign(record, data);
    await record.save();
    return res.json(record);
  } catch (err) {
    console.error('Error updating bill detail:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete bill detail
exports.deleteBillDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const record = (await BillDetail.findByIdAndDelete(id)) || (await BillDetail.findOneAndDelete({ PK_BillDetailId: id }));
    if (!record) return res.status(404).json({ message: 'Bill detail not found' });
    return res.json({ message: 'Deleted', id: record._id });
  } catch (err) {
    console.error('Error deleting bill detail:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
