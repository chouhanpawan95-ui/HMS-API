// controllers/receiptadjustmentdetailController.js
const ReceiptAdjustmentDetail = require('../models/receiptadjustmentdetail');

// Helper: generate next tranId (RAD0001)
async function generateNextTranId() {
  const lastRecord = await ReceiptAdjustmentDetail.findOne({ tranId: { $regex: '^RAD\\d+$' } }).sort({ tranId: -1 }).lean();
  let nextId = 'RAD0001';
  if (lastRecord && lastRecord.tranId) {
    const lastNumber = parseInt(lastRecord.tranId.replace(/^RAD/, ''), 10) || 0;
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    nextId = `RAD${newNumber}`;
  } else {
    const all = await ReceiptAdjustmentDetail.find({ tranId: { $regex: '^RAD\\d+$' } }).select('tranId').lean();
    if (all.length) {
      let max = 0;
      all.forEach(r => {
        const n = parseInt((r.tranId || '').replace(/^RAD/, ''), 10) || 0;
        if (n > max) max = n;
      });
      const newNumber = (max + 1).toString().padStart(4, '0');
      nextId = `RAD${newNumber}`;
    }
  }
  return nextId;
}

// Create new adjustment
exports.createAdjustment = async (req, res) => {
  try {
    const data = req.body || {};
    if (!data.fkReceiptId) return res.status(400).json({ message: 'fkReceiptId is required' });
    if (!data.tranId) data.tranId = await generateNextTranId();

    const existing = await ReceiptAdjustmentDetail.findOne({ tranId: data.tranId });
    if (existing) return res.status(409).json({ message: 'tranId already exists' });

    const rec = new ReceiptAdjustmentDetail(data);
    const validationError = rec.validateSync();
    if (validationError) return res.status(400).json({ message: 'Validation error', errors: Object.values(validationError.errors).map(e => e.message) });

    const saved = await rec.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating receipt adjustment detail:', err);
    if (err.name === 'ValidationError') return res.status(400).json({ message: 'Validation error', errors: Object.values(err.errors).map(e => e.message) });
    if (err.code === 11000) return res.status(409).json({ message: 'Duplicate key error', error: err.message });
    return res.status(500).json({ message: 'Server error while creating receipt adjustment detail', error: err.message });
  }
};

// List adjustments with optional q, page, limit and date filters
exports.getAdjustments = async (req, res) => {
  try {
    const { q, page = 1, limit = 25, adjustedDatetime, startDate, endDate, fkReceiptId } = req.query;
    const filter = {};
    if (q) filter.$or = [ { tranId: new RegExp(q, 'i') }, { fkReceiptId: new RegExp(q, 'i') }, { fkAdjustedBillId: new RegExp(q, 'i') } ];
    if (fkReceiptId) filter.fkReceiptId = fkReceiptId;

    if (adjustedDatetime) {
      const d = new Date(adjustedDatetime); if (isNaN(d)) return res.status(400).json({ message: 'Invalid adjustedDatetime' });
      const s = new Date(d); s.setHours(0,0,0,0); const e = new Date(d); e.setHours(23,59,59,999);
      filter.adjustedDatetime = { $gte: s, $lte: e };
    } else if (startDate || endDate) {
      const range = {};
      if (startDate) { const s = new Date(startDate); if (isNaN(s)) return res.status(400).json({ message: 'Invalid startDate' }); s.setHours(0,0,0,0); range.$gte = s; }
      if (endDate) { const e = new Date(endDate); if (isNaN(e)) return res.status(400).json({ message: 'Invalid endDate' }); e.setHours(23,59,59,999); range.$lte = e; }
      if (Object.keys(range).length) filter.adjustedDatetime = range;
    }

    const records = await ReceiptAdjustmentDetail.find(filter).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await ReceiptAdjustmentDetail.countDocuments(filter);
    return res.json({ data: records, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching receipt adjustments:', err);
    return res.status(500).json({ message: 'Error fetching receipt adjustments', error: err.message });
  }
};

// Get adjustments by FK_ReceiptId
exports.getByReceiptId = async (req, res) => {
  try {
    const { receiptId } = req.params;
    const { page = 1, limit = 25 } = req.query;

    const records = await ReceiptAdjustmentDetail.find({ fkReceiptId: receiptId })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await ReceiptAdjustmentDetail.countDocuments({ fkReceiptId: receiptId });
    return res.json({ data: records, total, page: Number(page), limit: Number(limit), fkReceiptId: receiptId });
  } catch (err) {
    console.error('Error fetching adjustments by receiptId:', err);
    return res.status(500).json({ message: 'Error fetching adjustments', error: err.message });
  }
};

// Get next tranId
exports.getNextTranId = async (req, res) => {
  try {
    const nextId = await generateNextTranId();
    return res.json({ tranId: nextId });
  } catch (err) {
    console.error('Error getting next tranId:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get adjustment by id (mongo _id or tranId)
exports.getAdjustmentById = async (req, res) => {
  try {
    const query = /^[0-9a-fA-F]{24}$/.test(req.params.id) ? { _id: req.params.id } : { tranId: req.params.id };
    const record = await ReceiptAdjustmentDetail.findOne(query);
    if (!record) return res.status(404).json({ message: 'Adjustment not found' });
    return res.json(record);
  } catch (err) {
    console.error('Error fetching adjustment:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update adjustment
exports.updateAdjustment = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const rec = (await ReceiptAdjustmentDetail.findById(id)) || (await ReceiptAdjustmentDetail.findOne({ tranId: id }));
    if (!rec) return res.status(404).json({ message: 'Adjustment not found' });
    Object.assign(rec, data);
    await rec.save();
    return res.json(rec);
  } catch (err) {
    console.error('Error updating adjustment:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete adjustment
exports.deleteAdjustment = async (req, res) => {
  try {
    const { id } = req.params;
    const rec = (await ReceiptAdjustmentDetail.findByIdAndDelete(id)) || (await ReceiptAdjustmentDetail.findOneAndDelete({ tranId: id }));
    if (!rec) return res.status(404).json({ message: 'Adjustment not found' });
    return res.json({ message: 'Deleted', id: rec._id });
  } catch (err) {
    console.error('Error deleting adjustment:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};