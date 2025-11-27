// controllers/districtController.js
const { District } = require("../models/district");

// Get all districts
exports.getDistricts = async (req, res) => {
  try {
    const data = await District.findAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching districts", error });
  }
};

// Get district by ID
exports.getDistrictById = async (req, res) => {
  try {
    const data = await District.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "District not found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error", error });
  }
};

// Create district
exports.createDistrict = async (req, res) => {
  try {
    const data = await District.create(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error creating district", error });
  }
};

// Update district
exports.updateDistrict = async (req, res) => {
  try {
    await District.update(req.body, {
      where: { PK_DistrictId: req.params.id }
    });
    res.json({ message: "District updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating district", error });
  }
};

// Delete district
exports.deleteDistrict = async (req, res) => {
  try {
    await District.destroy({
      where: { PK_DistrictId: req.params.id }
    });
    res.json({ message: "District deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting district", error });
  }
};
