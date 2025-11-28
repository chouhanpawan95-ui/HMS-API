// controllers/cityController.js
const City = require('../models/city');

// Helper: generate next cityId
async function generateNextCityId() {
  const lastCity = await City.findOne({ cityId: { $regex: '^CI\\d+$' } }).sort({ cityId: -1 }).lean();
  let nextId = 'CI0001';
  if (lastCity && lastCity.cityId) {
    const lastNumber = parseInt(lastCity.cityId.replace(/^CI/, ''), 10) || 0;
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    nextId = `CI${newNumber}`;
  } else {
    const all = await City.find({ cityId: { $regex: '^CI\\d+$' } }).select('cityId').lean();
    if (all.length) {
      let max = 0;
      all.forEach(c => {
        const n = parseInt((c.cityId || '').replace(/^CI/, ''), 10) || 0;
        if (n > max) max = n;
      });
      const newNumber = (max + 1).toString().padStart(4, '0');
      nextId = `CI${newNumber}`;
    }
  }
  return nextId;
}

// Create new city
exports.createCity = async (req, res) => {
  try {
    const data = req.body;
    if (!data.cityId) {
      try {
        data.cityId = await generateNextCityId();
      } catch (genErr) {
        console.error('Error generating cityId:', genErr);
        return res.status(500).json({ message: 'Error generating cityId' });
      }
    }
    const existing = await City.findOne({ cityId: data.cityId });
    if (existing) {
      return res.status(409).json({ message: 'cityId already exists' });
    }
    const city = new City(data);
    const validationError = city.validateSync();
    if (validationError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(validationError.errors).map(err => err.message)
      });
    }
    const savedCity = await city.save();
    return res.status(201).json(savedCity);
  } catch (err) {
    console.error('Error creating city:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(err.errors).map(error => error.message)
      });
    }
    return res.status(500).json({ message: 'Server error while creating city', error: err.message });
  }
};

// Get all cities with optional search
exports.getCities = async (req, res) => {
  try {
    const { page = 1, limit = 25, q } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { cityId: new RegExp(q, 'i') },
        { CityName: new RegExp(q, 'i') },
        { FK_DistrictId: new RegExp(q, 'i') }
      ];
    }
    const cities = await City.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await City.countDocuments(filter);
    return res.json({ data: cities, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get next cityId
exports.getNextCityId = async (req, res) => {
  try {
    const nextId = await generateNextCityId();
    return res.json({ cityId: nextId });
  } catch (err) {
    console.error('Error getting next cityId:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get city by id
exports.getCityById = async (req, res) => {
  try {
    const query = /^[0-9a-fA-F]{24}$/.test(req.params.id)
      ? { _id: req.params.id }
      : { cityId: req.params.id };
    const city = await City.findOne(query);
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }
    return res.json(city);
  } catch (error) {
    console.error('Error fetching city:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update city
exports.updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const city = (await City.findById(id)) || (await City.findOne({ cityId: id }));
    if (!city) return res.status(404).json({ message: 'City not found' });
    Object.assign(city, data);
    await city.save();
    return res.json(city);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete city
exports.deleteCity = async (req, res) => {
  try {
    const { id } = req.params;
    const city = (await City.findByIdAndDelete(id)) || (await City.findOneAndDelete({ cityId: id }));
    if (!city) return res.status(404).json({ message: 'City not found' });
    return res.json({ message: 'Deleted', id: city._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
