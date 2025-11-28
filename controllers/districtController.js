// controllers/districtController.js
const District = require('../models/district');

// Helper: generate next districtId
async function generateNextDistrictId() {
  const lastDistrict = await District.findOne({ districtId: { $regex: '^D\\d+$' } }).sort({ districtId: -1 }).lean();
  let nextId = 'D0001';
  if (lastDistrict && lastDistrict.districtId) {
    const lastNumber = parseInt(lastDistrict.districtId.replace(/^D/, ''), 10) || 0;
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    nextId = `D${newNumber}`;
  } else {
    const all = await District.find({ districtId: { $regex: '^D\\d+$' } }).select('districtId').lean();
    if (all.length) {
      let max = 0;
      all.forEach(d => {
        const n = parseInt((d.districtId || '').replace(/^D/, ''), 10) || 0;
        if (n > max) max = n;
      });
      const newNumber = (max + 1).toString().padStart(4, '0');
      nextId = `D${newNumber}`;
    }
  }
  return nextId;
}

// Create new district
exports.createDistrict = async (req, res) => {
  try {
    const data = req.body;
    if (!data.districtId) {
      try {
        data.districtId = await generateNextDistrictId();
      } catch (genErr) {
        console.error('Error generating districtId:', genErr);
        return res.status(500).json({ message: 'Error generating districtId' });
      }
    }
    const existing = await District.findOne({ districtId: data.districtId });
    if (existing) {
      return res.status(409).json({ message: 'districtId already exists' });
    }
    const district = new District(data);
    const validationError = district.validateSync();
    if (validationError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(validationError.errors).map(err => err.message)
      });
    }
    const savedDistrict = await district.save();
    return res.status(201).json(savedDistrict);
  } catch (err) {
    console.error('Error creating district:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(err.errors).map(error => error.message)
      });
    }
    return res.status(500).json({ message: 'Server error while creating district', error: err.message });
  }
};

// Get all districts with optional search
exports.getDistricts = async (req, res) => {
  try {
    const { page = 1, limit = 25, q } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { districtId: new RegExp(q, 'i') },
        { DistrictName: new RegExp(q, 'i') },
        { FK_StateId: new RegExp(q, 'i') }
      ];
    }
    const districts = await District.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await District.countDocuments(filter);
    return res.json({ data: districts, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get next districtId
exports.getNextDistrictId = async (req, res) => {
  try {
    const nextId = await generateNextDistrictId();
    return res.json({ districtId: nextId });
  } catch (err) {
    console.error('Error getting next districtId:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get district by id
exports.getDistrictById = async (req, res) => {
  try {
    const query = /^[0-9a-fA-F]{24}$/.test(req.params.id)
      ? { _id: req.params.id }
      : { districtId: req.params.id };
    const district = await District.findOne(query);
    if (!district) {
      return res.status(404).json({ message: 'District not found' });
    }
    return res.json(district);
  } catch (error) {
    console.error('Error fetching district:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update district
exports.updateDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const district = (await District.findById(id)) || (await District.findOne({ districtId: id }));
    if (!district) return res.status(404).json({ message: 'District not found' });
    Object.assign(district, data);
    await district.save();
    return res.json(district);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete district
exports.deleteDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const district = (await District.findByIdAndDelete(id)) || (await District.findOneAndDelete({ districtId: id }));
    if (!district) return res.status(404).json({ message: 'District not found' });
    return res.json({ message: 'Deleted', id: district._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
