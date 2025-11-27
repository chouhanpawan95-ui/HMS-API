// controllers/countryController.js

const { Country } =  require('../models/country');

// Get all countries
exports.getCountries = async (req, res) => {
  try {
    const data = await Country.findAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching countries", error });
  }
};

// Get by ID
exports.getCountryById = async (req, res) => {
  try {
    const data = await Country.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Country not found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error", error });
  }
};

// Create new country
exports.createCountry = async (req, res) => {
  try {
    const data = await Country.create(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error creating", error });
  }
};

// Update country
exports.updateCountry = async (req, res) => {
  try {
    const data = await Country.update(req.body, {
      where: { PK_CountryId: req.params.id },
    });
    res.json({ message: "Updated", data });
  } catch (error) {
    res.status(500).json({ message: "Error updating", error });
  }
};

// Delete
exports.deleteCountry = async (req, res) => {
  try {
    const data = await Country.destroy({
      where: { PK_CountryId: req.params.id },
    });
    res.json({ message: "Deleted", data });
  } catch (error) {
    res.status(500).json({ message: "Error deleting", error });
  }
};
