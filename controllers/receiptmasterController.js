// controllers/receiptmasterController.js
const ReceiptMaster = require('../models/receiptmaster');

// Helper: generate next receiptId (R0001)
async function generateNextReceiptId() {
  const lastRecord = await ReceiptMaster.findOne({ receiptId: { $regex: '^R\\d+$' } }).sort({ receiptId: -1 }).lean();
  let nextId = 'R0001';
  if (lastRecord && lastRecord.receiptId) {
    const lastNumber = parseInt(lastRecord.receiptId.replace(/^R/, ''), 10) || 0;
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    nextId = `R${newNumber}`;
  } else {
    const all = await ReceiptMaster.find({ receiptId: { $regex: '^R\\d+$' } }).select('receiptId').lean();
    if (all.length) {
      let max = 0;
      all.forEach(r => {
        const n = parseInt((r.receiptId || '').replace(/^R/, ''), 10) || 0;
        if (n > max) max = n;
      });
      const newNumber = (max + 1).toString().padStart(4, '0');
      nextId = `R${newNumber}`;
    }
  }
  return nextId;
}

// Create new receipt
exports.createReceipt = async (req, res) => {
  try {
    const data = req.body || {};
    if (!data.receiptId) data.receiptId = await generateNextReceiptId();

    const existing = await ReceiptMaster.findOne({ receiptId: data.receiptId });
    if (existing) return res.status(409).json({ message: 'receiptId already exists' });

    const rec = new ReceiptMaster(data);
    const validationError = rec.validateSync();
    if (validationError) return res.status(400).json({ message: 'Validation error', errors: Object.values(validationError.errors).map(e => e.message) });

    const saved = await rec.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating receipt master:', err);
    if (err.name === 'ValidationError') return res.status(400).json({ message: 'Validation error', errors: Object.values(err.errors).map(e => e.message) });
    if (err.code === 11000) return res.status(409).json({ message: 'Duplicate key error', error: err.message });
    return res.status(500).json({ message: 'Server error while creating receipt master', error: err.message });
  }
};

// List receipts
exports.getReceipts = async (req, res) => {
  try {
    const { page = 1, limit = 25, q, paymentDate, startDate, endDate } = req.query;
    const filter = {};
    if (q) filter.$or = [ { receiptId: new RegExp(q, 'i') }, { receiptNo: new RegExp(q, 'i') }, { userRemarks: new RegExp(q, 'i') } ];

    if (paymentDate) {
      const d = new Date(paymentDate); if (isNaN(d)) return res.status(400).json({ message: 'Invalid paymentDate' });
      const s = new Date(d); s.setHours(0,0,0,0); const e = new Date(d); e.setHours(23,59,59,999);
      filter.paymentDate = { $gte: s, $lte: e };
    } else if (startDate || endDate) {
      const range = {};
      if (startDate) { const s = new Date(startDate); if (isNaN(s)) return res.status(400).json({ message: 'Invalid startDate' }); s.setHours(0,0,0,0); range.$gte = s; }
      if (endDate) { const e = new Date(endDate); if (isNaN(e)) return res.status(400).json({ message: 'Invalid endDate' }); e.setHours(23,59,59,999); range.$lte = e; }
      if (Object.keys(range).length) filter.paymentDate = range;
    }

    const records = await ReceiptMaster.find(filter).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await ReceiptMaster.countDocuments(filter);
    return res.json({ data: records, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching receipts:', err);
    return res.status(500).json({ message: 'Error fetching receipts', error: err.message });
  }
};

// Get next receiptId
exports.getNextReceiptId = async (req, res) => {
  try {
    const nextId = await generateNextReceiptId();
    return res.json({ receiptId: nextId });
  } catch (err) {
    console.error('Error getting next receiptId:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get receipt by id
exports.getReceiptById = async (req, res) => {
  try {
    const query = /^[0-9a-fA-F]{24}$/.test(req.params.id) ? { _id: req.params.id } : { receiptId: req.params.id };
    const record = await ReceiptMaster.findOne(query);
    if (!record) return res.status(404).json({ message: 'Receipt not found' });
    return res.json(record);
  } catch (err) {
    console.error('Error fetching receipt:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update receipt
exports.updateReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const rec = (await ReceiptMaster.findById(id)) || (await ReceiptMaster.findOne({ receiptId: id }));
    if (!rec) return res.status(404).json({ message: 'Receipt not found' });
    Object.assign(rec, data);
    await rec.save();
    return res.json(rec);
  } catch (err) {
    console.error('Error updating receipt:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete receipt
exports.deleteReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const rec = (await ReceiptMaster.findByIdAndDelete(id)) || (await ReceiptMaster.findOneAndDelete({ receiptId: id }));
    if (!rec) return res.status(404).json({ message: 'Receipt not found' });
    return res.json({ message: 'Deleted', id: rec._id });
  } catch (err) {
    console.error('Error deleting receipt:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};