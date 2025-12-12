// controllers/billmasterController.js
const BillMaster = require('../models/billmaster');

// Helper: generate next billId (e.g., B0001)
async function generateNextBillId() {
  const lastRecord = await BillMaster.findOne({ billId: { $regex: '^B\\d+$' } }).sort({ billId: -1 }).lean();
  let nextId = 'B0001';
  if (lastRecord && lastRecord.billId) {
    const lastNumber = parseInt(lastRecord.billId.replace(/^B/, ''), 10) || 0;
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    nextId = `B${newNumber}`;
  } else {
    const all = await BillMaster.find({ billId: { $regex: '^B\\d+$' } }).select('billId').lean();
    if (all.length) {
      let max = 0;
      all.forEach(r => {
        const n = parseInt((r.billId || '').replace(/^B/, ''), 10) || 0;
        if (n > max) max = n;
      });
      const newNumber = (max + 1).toString().padStart(4, '0');
      nextId = `B${newNumber}`;
    }
  }
  return nextId;
}

// Create new bill master
exports.createBill = async (req, res) => {
  try {
    const data = req.body;
    if (!data.billId) data.billId = await generateNextBillId();

    const existing = await BillMaster.findOne({ billId: data.billId });
    if (existing) return res.status(409).json({ message: 'billId already exists' });

    const bill = new BillMaster(data);
    const validationError = bill.validateSync();
    if (validationError) return res.status(400).json({ message: 'Validation error', errors: Object.values(validationError.errors).map(err => err.message) });

    const saved = await bill.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating bill master:', err);
    if (err.name === 'ValidationError') return res.status(400).json({ message: 'Validation error', errors: Object.values(err.errors).map(e => e.message) });
    if (err.code === 11000) return res.status(409).json({ message: 'Duplicate key error', error: err.message });
    return res.status(500).json({ message: 'Server error while creating bill master', error: err.message });
  }
};

// Get all bills with optional search
exports.getBills = async (req, res) => {
  try {
    const { page = 1, limit = 25, q } = req.query;
    const filter = {};
    if (q) filter.$or = [ { billId: new RegExp(q, 'i') }, { BillNo: new RegExp(q, 'i') }, { Diagnosis: new RegExp(q, 'i') } ];

    const records = await BillMaster.find(filter).skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await BillMaster.countDocuments(filter);
    return res.json({ data: records, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching bills:', err);
    return res.status(500).json({ message: 'Error fetching bills', error: err.message });
  }
};

// Get next billId
exports.getNextBillId = async (req, res) => {
  try {
    const nextId = await generateNextBillId();
    return res.json({ billId: nextId });
  } catch (err) {
    console.error('Error getting next billId:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get bill by id
exports.getBillById = async (req, res) => {
  try {
    const query = /^[0-9a-fA-F]{24}$/.test(req.params.id) ? { _id: req.params.id } : { billId: req.params.id };
    const record = await BillMaster.findOne(query);
    if (!record) return res.status(404).json({ message: 'Bill not found' });
    return res.json(record);
  } catch (error) {
    console.error('Error fetching bill:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update bill
exports.updateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const record = (await BillMaster.findById(id)) || (await BillMaster.findOne({ billId: id }));
    if (!record) return res.status(404).json({ message: 'Bill not found' });
    Object.assign(record, data);
    await record.save();
    return res.json(record);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete bill
exports.deleteBill = async (req, res) => {
  try {
    const { id } = req.params;
    const record = (await BillMaster.findByIdAndDelete(id)) || (await BillMaster.findOneAndDelete({ billId: id }));
    if (!record) return res.status(404).json({ message: 'Bill not found' });
    return res.json({ message: 'Deleted', id: record._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
