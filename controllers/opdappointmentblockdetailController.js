// controllers/opdappointmentblockdetailController.js
const OpdAppointmentBlockDetail = require('../models/opdappointmentblockdetail');

// Helper: generate next tranId (OBK0001)
async function generateNextTranId() {
  const last = await OpdAppointmentBlockDetail.findOne({ tranId: { $regex: '^OBK\\d+$' } }).sort({ tranId: -1 }).lean();
  let next = 'OBK0001';
  if (last && last.tranId) {
    const n = parseInt(last.tranId.replace(/^OBK/, ''), 10) || 0;
    next = `OBK${(n + 1).toString().padStart(4, '0')}`;
  } else {
    const all = await OpdAppointmentBlockDetail.find({ tranId: { $regex: '^OBK\\d+$' } }).select('tranId').lean();
    if (all.length) {
      let max = 0; all.forEach(r => { const m = parseInt((r.tranId || '').replace(/^OBK/, ''), 10) || 0; if (m > max) max = m; });
      next = `OBK${(max + 1).toString().padStart(4, '0')}`;
    }
  }
  return next;
}

// Create block detail
exports.createBlockDetail = async (req, res) => {
  try {
    const data = req.body || {};
    if (!data.tranId) data.tranId = await generateNextTranId();

    const existing = await OpdAppointmentBlockDetail.findOne({ tranId: data.tranId });
    if (existing) return res.status(409).json({ message: 'tranId already exists' });

    const rec = new OpdAppointmentBlockDetail(data);
    const validationError = rec.validateSync();
    if (validationError) return res.status(400).json({ message: 'Validation error', errors: Object.values(validationError.errors).map(e => e.message) });

    const saved = await rec.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating block detail:', err);
    if (err.name === 'ValidationError') return res.status(400).json({ message: 'Validation error', errors: Object.values(err.errors).map(e => e.message) });
    if (err.code === 11000) return res.status(409).json({ message: 'Duplicate key error', error: err.message });
    return res.status(500).json({ message: 'Server error while creating block detail', error: err.message });
  }
};

// List with optional q, page, limit and date filters
exports.getBlockDetails = async (req, res) => {
  try {
    const { q, page = 1, limit = 25, apptDate, startDate, endDate } = req.query;
    const filter = {};
    if (q) filter.$or = [ { tranId: new RegExp(q, 'i') }, { fkDoctorId: new RegExp(q, 'i') }, { blockReason: new RegExp(q, 'i') } ];

    if (apptDate) {
      const d = new Date(apptDate); if (isNaN(d)) return res.status(400).json({ message: 'Invalid apptDate' });
      const s = new Date(d); s.setHours(0,0,0,0); const e = new Date(d); e.setHours(23,59,59,999);
      filter.apptDate = { $gte: s, $lte: e };
    } else if (startDate || endDate) {
      const range = {};
      if (startDate) { const s = new Date(startDate); if (isNaN(s)) return res.status(400).json({ message: 'Invalid startDate' }); s.setHours(0,0,0,0); range.$gte = s; }
      if (endDate) { const e = new Date(endDate); if (isNaN(e)) return res.status(400).json({ message: 'Invalid endDate' }); e.setHours(23,59,59,999); range.$lte = e; }
      if (Object.keys(range).length) filter.apptDate = range;
    }

    const records = await OpdAppointmentBlockDetail.find(filter).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await OpdAppointmentBlockDetail.countDocuments(filter);
    return res.json({ data: records, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching block details:', err);
    return res.status(500).json({ message: 'Error fetching block details', error: err.message });
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

// Get by id (mongo _id or tranId)
exports.getBlockDetailById = async (req, res) => {
  try {
    const id = req.params.id;
    const rec = (await OpdAppointmentBlockDetail.findById(id)) || (await OpdAppointmentBlockDetail.findOne({ tranId: id }));
    if (!rec) return res.status(404).json({ message: 'Block detail not found' });
    return res.json(rec);
  } catch (err) {
    console.error('Error fetching block detail:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update
exports.updateBlockDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const rec = (await OpdAppointmentBlockDetail.findById(id)) || (await OpdAppointmentBlockDetail.findOne({ tranId: id }));
    if (!rec) return res.status(404).json({ message: 'Block detail not found' });
    Object.assign(rec, data);
    await rec.save();
    return res.json(rec);
  } catch (err) {
    console.error('Error updating block detail:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete
exports.deleteBlockDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const rec = (await OpdAppointmentBlockDetail.findByIdAndDelete(id)) || (await OpdAppointmentBlockDetail.findOneAndDelete({ tranId: id }));
    if (!rec) return res.status(404).json({ message: 'Block detail not found' });
    return res.json({ message: 'Deleted', id: rec._id });
  } catch (err) {
    console.error('Error deleting block detail:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};