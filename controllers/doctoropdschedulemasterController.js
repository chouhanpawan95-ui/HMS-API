// controllers/doctoropdschedulemasterController.js
const DoctorOpdScheduleMaster = require('../models/doctoropdschedulemaster');

// Helper: generate next scheduleId (SCH0001)
async function generateNextScheduleId() {
  const lastRecord = await DoctorOpdScheduleMaster.findOne({ scheduleId: { $regex: '^SCH\\d+$' } }).sort({ scheduleId: -1 }).lean();
  let nextId = 'SCH0001';
  if (lastRecord && lastRecord.scheduleId) {
    const lastNumber = parseInt(lastRecord.scheduleId.replace(/^SCH/, ''), 10) || 0;
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    nextId = `SCH${newNumber}`;
  } else {
    const all = await DoctorOpdScheduleMaster.find({ scheduleId: { $regex: '^SCH\\d+$' } }).select('scheduleId').lean();
    if (all.length) {
      let max = 0;
      all.forEach(r => {
        const n = parseInt((r.scheduleId || '').replace(/^SCH/, ''), 10) || 0;
        if (n > max) max = n;
      });
      const newNumber = (max + 1).toString().padStart(4, '0');
      nextId = `SCH${newNumber}`;
    }
  }
  return nextId;
}

// Create new schedule
exports.createDoctorOpdSchedule = async (req, res) => {
  try {
    const data = req.body || {};
    if (!data.scheduleId) data.scheduleId = await generateNextScheduleId();

    const existing = await DoctorOpdScheduleMaster.findOne({ scheduleId: data.scheduleId });
    if (existing) return res.status(409).json({ message: 'scheduleId already exists' });

    const rec = new DoctorOpdScheduleMaster(data);
    const validationError = rec.validateSync();
    if (validationError) return res.status(400).json({ message: 'Validation error', errors: Object.values(validationError.errors).map(err => err.message) });

    const saved = await rec.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating doctor OPD schedule:', err);
    if (err.name === 'ValidationError') return res.status(400).json({ message: 'Validation error', errors: Object.values(err.errors).map(e => e.message) });
    if (err.code === 11000) return res.status(409).json({ message: 'Duplicate key error', error: err.message });
    return res.status(500).json({ message: 'Server error while creating schedule', error: err.message });
  }
};

// Get all schedules with optional search
exports.getDoctorOpdSchedules = async (req, res) => {
  try {
    const { page = 1, limit = 25, q, scheduleDate, startDate, endDate } = req.query;
    const filter = {};
    if (q) filter.$or = [ { scheduleId: new RegExp(q, 'i') }, { fkDoctorId: new RegExp(q, 'i') }, { fkBranchId: new RegExp(q, 'i') } ];

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

    const records = await DoctorOpdScheduleMaster.find(filter).skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await DoctorOpdScheduleMaster.countDocuments(filter);
    return res.json({ data: records, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching doctor OPD schedules:', err);
    return res.status(500).json({ message: 'Error fetching schedules', error: err.message });
  }
};

// Get next scheduleId
exports.getNextScheduleId = async (req, res) => {
  try {
    const nextId = await generateNextScheduleId();
    return res.json({ scheduleId: nextId });
  } catch (err) {
    console.error('Error getting next scheduleId:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get schedule by id
exports.getDoctorOpdScheduleById = async (req, res) => {
  try {
    const query = /^[0-9a-fA-F]{24}$/.test(req.params.id) ? { _id: req.params.id } : { scheduleId: req.params.id };
    const rec = await DoctorOpdScheduleMaster.findOne(query);
    if (!rec) return res.status(404).json({ message: 'Schedule not found' });
    return res.json(rec);
  } catch (err) {
    console.error('Error fetching schedule:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update schedule
exports.updateDoctorOpdSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const rec = (await DoctorOpdScheduleMaster.findById(id)) || (await DoctorOpdScheduleMaster.findOne({ scheduleId: id }));
    if (!rec) return res.status(404).json({ message: 'Schedule not found' });
    Object.assign(rec, data);
    await rec.save();
    return res.json(rec);
  } catch (err) {
    console.error('Error updating schedule:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete schedule
exports.deleteDoctorOpdSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const rec = (await DoctorOpdScheduleMaster.findByIdAndDelete(id)) || (await DoctorOpdScheduleMaster.findOneAndDelete({ scheduleId: id }));
    if (!rec) return res.status(404).json({ message: 'Schedule not found' });
    return res.json({ message: 'Deleted', id: rec._id });
  } catch (err) {
    console.error('Error deleting schedule:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};