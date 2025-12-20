// controllers/receiptrefunddetailController.js
const ReceiptRefundDetail = require('../models/receiptrefunddetail');

// Helper: generate next refundId (RFD0001)
async function generateNextRefundId() {
  const lastRecord = await ReceiptRefundDetail.findOne({ refundId: { $regex: '^RFD\\d+$' } }).sort({ refundId: -1 }).lean();
  let nextId = 'RFD0001';
  if (lastRecord && lastRecord.refundId) {
    const lastNumber = parseInt(lastRecord.refundId.replace(/^RFD/, ''), 10) || 0;
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    nextId = `RFD${newNumber}`;
  } else {
    const all = await ReceiptRefundDetail.find({ refundId: { $regex: '^RFD\\d+$' } }).select('refundId').lean();
    if (all.length) {
      let max = 0;
      all.forEach(r => {
        const n = parseInt((r.refundId || '').replace(/^RFD/, ''), 10) || 0;
        if (n > max) max = n;
      });
      const newNumber = (max + 1).toString().padStart(4, '0');
      nextId = `RFD${newNumber}`;
    }
  }
  return nextId;
}

// Create refund detail
exports.createRefund = async (req, res) => {
  try {
    const data = req.body || {};
    if (!data.refundId) data.refundId = await generateNextRefundId();

    const existing = await ReceiptRefundDetail.findOne({ refundId: data.refundId });
    if (existing) return res.status(409).json({ message: 'refundId already exists' });

    const rec = new ReceiptRefundDetail(data);
    const validationError = rec.validateSync();
    if (validationError) return res.status(400).json({ message: 'Validation error', errors: Object.values(validationError.errors).map(e => e.message) });

    const saved = await rec.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating receipt refund detail:', err);
    if (err.name === 'ValidationError') return res.status(400).json({ message: 'Validation error', errors: Object.values(err.errors).map(e => e.message) });
    if (err.code === 11000) return res.status(409).json({ message: 'Duplicate key error', error: err.message });
    return res.status(500).json({ message: 'Server error while creating receipt refund detail', error: err.message });
  }
};

// List refunds with optional filters
exports.getRefunds = async (req, res) => {
  try {
    const { q, page = 1, limit = 25, refundDate, startDate, endDate, fkReceiptId } = req.query;
    const filter = {};
    if (q) filter.$or = [ { refundId: new RegExp(q, 'i') }, { fkReceiptId: new RegExp(q, 'i') }, { refundReason: new RegExp(q, 'i') } ];
    if (fkReceiptId) filter.fkReceiptId = fkReceiptId;

    if (refundDate) {
      const d = new Date(refundDate); if (isNaN(d)) return res.status(400).json({ message: 'Invalid refundDate' });
      const s = new Date(d); s.setHours(0,0,0,0); const e = new Date(d); e.setHours(23,59,59,999);
      filter.refundDate = { $gte: s, $lte: e };
    } else if (startDate || endDate) {
      const range = {};
      if (startDate) { const s = new Date(startDate); if (isNaN(s)) return res.status(400).json({ message: 'Invalid startDate' }); s.setHours(0,0,0,0); range.$gte = s; }
      if (endDate) { const e = new Date(endDate); if (isNaN(e)) return res.status(400).json({ message: 'Invalid endDate' }); e.setHours(23,59,59,999); range.$lte = e; }
      if (Object.keys(range).length) filter.refundDate = range;
    }

    const records = await ReceiptRefundDetail.find(filter).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await ReceiptRefundDetail.countDocuments(filter);
    return res.json({ data: records, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching receipt refunds:', err);
    return res.status(500).json({ message: 'Error fetching receipt refunds', error: err.message });
  }
};

// Get refunds by receipt id
exports.getByReceiptId = async (req, res) => {
  try {
    const { receiptId } = req.params;
    const { page = 1, limit = 25 } = req.query;

    const records = await ReceiptRefundDetail.find({ fkReceiptId: receiptId })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await ReceiptRefundDetail.countDocuments({ fkReceiptId: receiptId });
    return res.json({ data: records, total, page: Number(page), limit: Number(limit), fkReceiptId: receiptId });
  } catch (err) {
    console.error('Error fetching refunds by receiptId:', err);
    return res.status(500).json({ message: 'Error fetching refunds', error: err.message });
  }
};

// Get next refund id
exports.getNextRefundId = async (req, res) => {
  try {
    const nextId = await generateNextRefundId();
    return res.json({ refundId: nextId });
  } catch (err) {
    console.error('Error getting next refundId:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get refund by id (mongo _id or refundId)
exports.getRefundById = async (req, res) => {
  try {
    const query = /^[0-9a-fA-F]{24}$/.test(req.params.id) ? { _id: req.params.id } : { refundId: req.params.id };
    const record = await ReceiptRefundDetail.findOne(query);
    if (!record) return res.status(404).json({ message: 'Refund not found' });
    return res.json(record);
  } catch (err) {
    console.error('Error fetching refund:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update refund
exports.updateRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const rec = (await ReceiptRefundDetail.findById(id)) || (await ReceiptRefundDetail.findOne({ refundId: id }));
    if (!rec) return res.status(404).json({ message: 'Refund not found' });
    Object.assign(rec, data);
    await rec.save();
    return res.json(rec);
  } catch (err) {
    console.error('Error updating refund:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete refund
exports.deleteRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const rec = (await ReceiptRefundDetail.findByIdAndDelete(id)) || (await ReceiptRefundDetail.findOneAndDelete({ refundId: id }));
    if (!rec) return res.status(404).json({ message: 'Refund not found' });
    return res.json({ message: 'Deleted', id: rec._id });
  } catch (err) {
    console.error('Error deleting refund:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};