// controllers/doctoropdscheduletimedetailController.js
const DoctorOpdScheduleTimeDetail = require('../models/doctoropdscheduletimedetail');

// Helper: generate next tranId (DST0001)
async function generateNextTranId() {
  const lastRecord = await DoctorOpdScheduleTimeDetail.findOne({ tranId: { $regex: '^DST\\d+$' } }).sort({ tranId: -1 }).lean();
  let nextId = 'DST0001';
  if (lastRecord && lastRecord.tranId) {
    const lastNumber = parseInt(lastRecord.tranId.replace(/^DST/, ''), 10) || 0;
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    nextId = `DST${newNumber}`;
  } else {
    const all = await DoctorOpdScheduleTimeDetail.find({ tranId: { $regex: '^DST\\d+$' } }).select('tranId').lean();
    if (all.length) {
      let max = 0;
      all.forEach(r => {
        const n = parseInt((r.tranId || '').replace(/^DST/, ''), 10) || 0;
        if (n > max) max = n;
      });
      const newNumber = (max + 1).toString().padStart(4, '0');
      nextId = `DST${newNumber}`;
    }
  }
  return nextId;
}

// Create new time detail
exports.createDoctorOpdScheduleTimeDetail = async (req, res) => {
  try {
    const data = req.body || {};
    if (!data.tranId) data.tranId = await generateNextTranId();

    const existing = await DoctorOpdScheduleTimeDetail.findOne({ tranId: data.tranId });
    if (existing) return res.status(409).json({ message: 'tranId already exists' });

    const rec = new DoctorOpdScheduleTimeDetail(data);
    const validationError = rec.validateSync();
    if (validationError) return res.status(400).json({ message: 'Validation error', errors: Object.values(validationError.errors).map(err => err.message) });

    const saved = await rec.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating doctor OPD schedule time detail:', err);
    if (err.name === 'ValidationError') return res.status(400).json({ message: 'Validation error', errors: Object.values(err.errors).map(e => e.message) });
    if (err.code === 11000) return res.status(409).json({ message: 'Duplicate key error', error: err.message });
    return res.status(500).json({ message: 'Server error while creating time detail', error: err.message });
  }
};

// Get all time details with optional search & date filters
exports.getDoctorOpdScheduleTimeDetails = async (req, res) => {
  try {
    const { page = 1, limit = 25, q, scheduleDate, startDate, endDate } = req.query;
    const filter = {};
    if (q) filter.$or = [ { tranId: new RegExp(q, 'i') }, { fkScheduleId: new RegExp(q, 'i') }, { fkDoctorId: new RegExp(q, 'i') } ];

    // date filters
    if (scheduleDate) {
      const d = new Date(scheduleDate);
      if (isNaN(d)) return res.status(400).json({ message: 'Invalid scheduleDate' });
      const start = new Date(d); start.setHours(0,0,0,0);
      const end = new Date(d); end.setHours(23,59,59,999);
      filter.scheduleDate = { $gte: start, $lte: end };
    } else if (startDate || endDate) {
      const range = {};
      if (startDate) {
        const s = new Date(startDate);
        if (isNaN(s)) return res.status(400).json({ message: 'Invalid startDate' });
        s.setHours(0,0,0,0); range.$gte = s;
      }
      if (endDate) {
        const e = new Date(endDate);
        if (isNaN(e)) return res.status(400).json({ message: 'Invalid endDate' });
        e.setHours(23,59,59,999); range.$lte = e;
      }
      if (Object.keys(range).length) filter.scheduleDate = range;
    }

    const records = await DoctorOpdScheduleTimeDetail.find(filter).skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await DoctorOpdScheduleTimeDetail.countDocuments(filter);
    return res.json({ data: records, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching doctor OPD schedule time details:', err);
    return res.status(500).json({ message: 'Error fetching time details', error: err.message });
  }
};

// Get details by FK_ScheduleId
exports.getByScheduleId = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { page = 1, limit = 25 } = req.query;

    const records = await DoctorOpdScheduleTimeDetail.find({ fkScheduleId: scheduleId })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await DoctorOpdScheduleTimeDetail.countDocuments({ fkScheduleId: scheduleId });
    return res.json({ data: records, total, page: Number(page), limit: Number(limit), fkScheduleId: scheduleId });
  } catch (err) {
    console.error('Error fetching time details by scheduleId:', err);
    return res.status(500).json({ message: 'Error fetching time details', error: err.message });
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

// Get time detail by id
exports.getDoctorOpdScheduleTimeDetailById = async (req, res) => {
  try {
    const query = /^[0-9a-fA-F]{24}$/.test(req.params.id) ? { _id: req.params.id } : { tranId: req.params.id };
    const record = await DoctorOpdScheduleTimeDetail.findOne(query);
    if (!record) return res.status(404).json({ message: 'Time detail not found' });
    return res.json(record);
  } catch (err) {
    console.error('Error fetching time detail:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update time detail
exports.updateDoctorOpdScheduleTimeDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const record = (await DoctorOpdScheduleTimeDetail.findById(id)) || (await DoctorOpdScheduleTimeDetail.findOne({ tranId: id }));
    if (!record) return res.status(404).json({ message: 'Time detail not found' });
    Object.assign(record, data);
    await record.save();
    return res.json(record);
  } catch (err) {
    console.error('Error updating time detail:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete time detail
exports.deleteDoctorOpdScheduleTimeDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const record = (await DoctorOpdScheduleTimeDetail.findByIdAndDelete(id)) || (await DoctorOpdScheduleTimeDetail.findOneAndDelete({ tranId: id }));
    if (!record) return res.status(404).json({ message: 'Time detail not found' });
    return res.json({ message: 'Deleted', id: record._id });
  } catch (err) {
    console.error('Error deleting time detail:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};