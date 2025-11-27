// controllers/serviceController.js
const { Service } = require("../models/service");

// Get all services
exports.getServices = async (req, res) => {
  try {
    const data = await Service.findAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching services", error });
  }
};

// Get service by ID
exports.getServiceById = async (req, res) => {
  try {
    const data = await Service.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Service not found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error", error });
  }
};

// Create service
exports.createService = async (req, res) => {
  try {
    const data = await Service.create(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error creating service", error });
  }
};

// Update service
exports.updateService = async (req, res) => {
  try {
    await Service.update(req.body, {
      where: { PK_ServiceId: req.params.id },
    });
    res.json({ message: "Service updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating service", error });
  }
};

// Delete service
exports.deleteService = async (req, res) => {
  try {
    await Service.destroy({
      where: { PK_ServiceId: req.params.id },
    });
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting service", error });
  }
};
