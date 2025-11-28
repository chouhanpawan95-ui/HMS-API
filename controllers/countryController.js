// controllers/countryController.js
const Country = require('../models/country');

// Helper: generate next countryId
async function generateNextCountryId() {
  const lastCountry = await Country.findOne({ countryId: { $regex: '^C\\d+$' } }).sort({ countryId: -1 }).lean();
  let nextId = 'C0001';
  if (lastCountry && lastCountry.countryId) {
    const lastNumber = parseInt(lastCountry.countryId.replace(/^C/, ''), 10) || 0;
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    nextId = `C${newNumber}`;
  } else {
    const all = await Country.find({ countryId: { $regex: '^C\\d+$' } }).select('countryId').lean();
    if (all.length) {
      let max = 0;
      all.forEach(c => {
        const n = parseInt((c.countryId || '').replace(/^C/, ''), 10) || 0;
        if (n > max) max = n;
      });
      const newNumber = (max + 1).toString().padStart(4, '0');
      nextId = `C${newNumber}`;
    }
  }
  return nextId;
}

// Create new country
exports.createCountry = async (req, res) => {
  try {
    const data = req.body;
    console.log('Creating country with data:', data);
    
    if (!data.countryId) {
      try {
        data.countryId = await generateNextCountryId();
        console.log('Generated countryId:', data.countryId);
      } catch (genErr) {
        console.error('Error generating countryId:', genErr);
        return res.status(500).json({ message: 'Error generating countryId', error: genErr.message });
      }
    }
    
    const existing = await Country.findOne({ countryId: data.countryId });
    if (existing) {
      return res.status(409).json({ message: 'countryId already exists' });
    }
    
    const country = new Country(data);
    const validationError = country.validateSync();
    if (validationError) {
      console.log('Validation error:', validationError);
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(validationError.errors).map(err => err.message)
      });
    }
    
    const savedCountry = await country.save();
    console.log('Country saved:', savedCountry);
    return res.status(201).json(savedCountry);
  } catch (err) {
    console.error('Error creating country:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(err.errors).map(error => error.message)
      });
    }
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Duplicate key error', error: err.message });
    }
    return res.status(500).json({ message: 'Server error while creating country', error: err.message });
  }
};

// Get all countries with optional search
exports.getCountries = async (req, res) => {
  try {
    const { page = 1, limit = 25, q } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { countryId: new RegExp(q, 'i') },
        { CountryName: new RegExp(q, 'i') },
        { CountryCode: new RegExp(q, 'i') }
      ];
    }
    console.log('Fetching countries with filter:', filter);
    
    const countries = await Country.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    
    const total = await Country.countDocuments(filter);
    console.log(`Found ${countries.length} countries out of ${total} total`);
    
    return res.json({ data: countries, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching countries:', err);
    return res.status(500).json({ message: 'Error fetching countries', error: err.message });
  }
};

// Get next countryId
exports.getNextCountryId = async (req, res) => {
  try {
    const nextId = await generateNextCountryId();
    return res.json({ countryId: nextId });
  } catch (err) {
    console.error('Error getting next countryId:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get country by id
exports.getCountryById = async (req, res) => {
  try {
    const query = /^[0-9a-fA-F]{24}$/.test(req.params.id)
      ? { _id: req.params.id }
      : { countryId: req.params.id };
    const country = await Country.findOne(query);
    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }
    return res.json(country);
  } catch (error) {
    console.error('Error fetching country:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update country
exports.updateCountry = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const country = (await Country.findById(id)) || (await Country.findOne({ countryId: id }));
    if (!country) return res.status(404).json({ message: 'Country not found' });
    Object.assign(country, data);
    await country.save();
    return res.json(country);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete country
exports.deleteCountry = async (req, res) => {
  try {
    const { id } = req.params;
    const country = (await Country.findByIdAndDelete(id)) || (await Country.findOneAndDelete({ countryId: id }));
    if (!country) return res.status(404).json({ message: 'Country not found' });
    return res.json({ message: 'Deleted', id: country._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
