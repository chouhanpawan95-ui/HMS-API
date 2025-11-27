// controllers/cityController.js
const { City } = require("../models/city");

// Get all cities
exports.getCities = async (req, res) => {
  try {
    const data = await City.findAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cities", error });
  }
};

// Get city by ID
exports.getCityById = async (req, res) => {
  try {
    const data = await City.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "City not found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error", error });
  }
};

// Create new city
exports.createCity = async (req, res) => {
  try {
    const data = await City.create(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error creating city", error });
  }
};

// Update city
exports.updateCity = async (req, res) => {
  try {
    await City.update(req.body, {
      where: { PK_CityId: req.params.id }
    });
    res.json({ message: "City updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating city", error });
  }
};

// Delete city
exports.deleteCity = async (req, res) => {
  try {
    await City.destroy({
      where: { PK_CityId: req.params.id }
    });
    res.json({ message: "City deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting city", error });
  }
};
