// controllers/opdappointmentController.js
const OpdAppointment = require('../models/opdappointment');

// Helper: generate next appointmentId APPT0001
async function generateNextAppointmentId() {
  const last = await OpdAppointment.findOne({ appointmentId: { $regex: '^APPT\\d+$' } }).sort({ appointmentId: -1 }).lean();
  let next = 'APPT0001';
  if (last && last.appointmentId) {
    const n = parseInt(last.appointmentId.replace(/^APPT/, ''), 10) || 0;
    next = `APPT${(n + 1).toString().padStart(4, '0')}`;
  } else {
    const all = await OpdAppointment.find({ appointmentId: { $regex: '^APPT\\d+$' } }).select('appointmentId').lean();
    if (all.length) {
      let max = 0; all.forEach(r => { const m = parseInt((r.appointmentId || '').replace(/^APPT/, ''), 10) || 0; if (m > max) max = m; });
      next = `APPT${(max + 1).toString().padStart(4, '0')}`;
    }
  }
  return next;
}

// Create appointment
exports.createAppointment = async (req, res) => {
  try {
    const data = req.body || {};
    if (!data.appointmentId) data.appointmentId = await generateNextAppointmentId();

    const existing = await OpdAppointment.findOne({ appointmentId: data.appointmentId });
    if (existing) return res.status(409).json({ message: 'appointmentId already exists' });

    const rec = new OpdAppointment(data);
    const validationError = rec.validateSync();
    if (validationError) return res.status(400).json({ message: 'Validation error', errors: Object.values(validationError.errors).map(e => e.message) });

    const saved = await rec.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating appointment:', err);
    if (err.name === 'ValidationError') return res.status(400).json({ message: 'Validation error', errors: Object.values(err.errors).map(e => e.message) });
    if (err.code === 11000) return res.status(409).json({ message: 'Duplicate key error', error: err.message });
    return res.status(500).json({ message: 'Server error while creating appointment', error: err.message });
  }
};

// List appointments with optional q, page, limit and date filters
exports.getAppointments = async (req, res) => {
  try {
    const { q, page = 1, limit = 25, apptDate, startDate, endDate } = req.query;
    const filter = {};
    if (q) filter.$or = [ { appointmentId: new RegExp(q, 'i') }, { fkRegId: new RegExp(q, 'i') }, { firstName: new RegExp(q, 'i') }, { lastName: new RegExp(q, 'i') } ];

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

    const records = await OpdAppointment.find(filter).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await OpdAppointment.countDocuments(filter);
    return res.json({ data: records, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching appointments:', err);
    return res.status(500).json({ message: 'Error fetching appointments', error: err.message });
  }
};

// Get next appointment id
exports.getNextAppointmentId = async (req, res) => {
  try {
    const nextId = await generateNextAppointmentId();
    return res.json({ appointmentId: nextId });
  } catch (err) {
    console.error('Error getting next appointmentId:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get appointment by id
exports.getAppointmentById = async (req, res) => {
  try {
    const id = req.params.id;
    const rec = (await OpdAppointment.findById(id)) || (await OpdAppointment.findOne({ appointmentId: id }));
    if (!rec) return res.status(404).json({ message: 'Appointment not found' });
    return res.json(rec);
  } catch (err) {
    console.error('Error fetching appointment:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const rec = (await OpdAppointment.findById(id)) || (await OpdAppointment.findOne({ appointmentId: id }));
    if (!rec) return res.status(404).json({ message: 'Appointment not found' });
    Object.assign(rec, data);
    await rec.save();
    return res.json(rec);
  } catch (err) {
    console.error('Error updating appointment:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const rec = (await OpdAppointment.findByIdAndDelete(id)) || (await OpdAppointment.findOneAndDelete({ appointmentId: id }));
    if (!rec) return res.status(404).json({ message: 'Appointment not found' });
    return res.json({ message: 'Deleted', id: rec._id });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};