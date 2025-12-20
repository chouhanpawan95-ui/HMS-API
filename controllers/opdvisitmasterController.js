// controllers/opdvisitmasterController.js
const OpdVisitMaster = require('../models/opdvisitmaster');

// Create new OPD visit
exports.createOpdVisit = async (req, res) => {
  try {
    const data = req.body || {};
    if (!data.pkVisitId) return res.status(400).json({ message: 'pkVisitId is required' });

    const existing = await OpdVisitMaster.findOne({ pkVisitId: data.pkVisitId });
    if (existing) return res.status(409).json({ message: 'pkVisitId already exists' });

    const opd = new OpdVisitMaster(data);
    const validationError = opd.validateSync();
    if (validationError) return res.status(400).json({ message: 'Validation failed', error: validationError });

    const saved = await opd.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating OPD visit:', err);
    return res.status(500).json({ message: 'Server error while creating OPD visit' });
  }
};

// Get list of OPD visits with optional q, page, limit, and visitDate filters
exports.getOpdVisits = async (req, res) => {
  try {
    const { q = '', page = 1, limit = 25, visitDate, startDate, endDate } = req.query;
    const filter = {};

    // Text search
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [ { pkVisitId: regex }, { fkRegId: regex }, { remarks: regex } ];
    }

    // Date filters: visitDate (single day) or startDate/endDate range
    if (visitDate) {
      const d = new Date(visitDate);
      if (isNaN(d)) return res.status(400).json({ message: 'Invalid visitDate' });
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);
      filter.visitDate = { $gte: start, $lte: end };
    } else if (startDate || endDate) {
      const range = {};
      if (startDate) {
        const s = new Date(startDate);
        if (isNaN(s)) return res.status(400).json({ message: 'Invalid startDate' });
        s.setHours(0, 0, 0, 0);
        range.$gte = s;
      }
      if (endDate) {
        const e = new Date(endDate);
        if (isNaN(e)) return res.status(400).json({ message: 'Invalid endDate' });
        e.setHours(23, 59, 59, 999);
        range.$lte = e;
      }
      if (Object.keys(range).length) filter.visitDate = range;
    }

    const visits = await OpdVisitMaster.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await OpdVisitMaster.countDocuments(filter);
    return res.json({ data: visits, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching OPD visits:', err);
    return res.status(500).json({ message: 'Server error while fetching OPD visits' });
  }
};

// Get single OPD visit by mongo _id or pkVisitId
exports.getOpdVisitById = async (req, res) => {
  try {
    const id = req.params.id;
    const visit = (await OpdVisitMaster.findById(id)) || (await OpdVisitMaster.findOne({ pkVisitId: id }));
    if (!visit) return res.status(404).json({ message: 'OPD visit not found' });
    return res.json(visit);
  } catch (err) {
    console.error('Error fetching OPD visit:', err);
    return res.status(500).json({ message: 'Server error while fetching OPD visit' });
  }
};

// Update OPD visit
exports.updateOpdVisit = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body || {};
    const visit = (await OpdVisitMaster.findById(id)) || (await OpdVisitMaster.findOne({ pkVisitId: id }));
    if (!visit) return res.status(404).json({ message: 'OPD visit not found' });

    Object.assign(visit, data);
    await visit.save();
    return res.json(visit);
  } catch (err) {
    console.error('Error updating OPD visit:', err);
    return res.status(500).json({ message: 'Server error while updating OPD visit' });
  }
};

// Delete OPD visit
exports.deleteOpdVisit = async (req, res) => {
  try {
    const id = req.params.id;
    const visit = (await OpdVisitMaster.findByIdAndDelete(id)) || (await OpdVisitMaster.findOneAndDelete({ pkVisitId: id }));
    if (!visit) return res.status(404).json({ message: 'OPD visit not found' });
    return res.json({ message: 'Deleted', id: visit._id });
  } catch (err) {
    console.error('Error deleting OPD visit:', err);
    return res.status(500).json({ message: 'Server error while deleting OPD visit' });
  }
};
