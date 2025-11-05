// controllers/patientController.js
const Patient = require('../models/patient');

/**
 * Create new patient
 */
exports.createPatient = async (req, res) => {
  try {
    const data = req.body;

    // Validate required fields
    if (!data.patientId) {
      return res.status(400).json({ message: 'patientId is required' });
    }

    // Check for existing patient
    const existing = await Patient.findOne({ patientId: data.patientId });
    if (existing) {
      return res.status(409).json({ message: 'patientId already exists' });
    }

    // Create new patient
    const patient = new Patient(data);
    
    // Validate the document against the schema
    const validationError = patient.validateSync();
    if (validationError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(validationError.errors).map(err => err.message)
      });
    }

    // Save the patient
    const savedPatient = await patient.save();
    return res.status(201).json(savedPatient);

  } catch (err) {
    console.error('Error creating patient:', err);
    
    // Handle mongoose validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(err.errors).map(error => error.message)
      });
    }
    
    // Handle other errors
    return res.status(500).json({
      message: 'Server error while creating patient',
      error: err.message
    });
  }
};

/**
 * Get all patients with optional query (pagination, search)
 */
exports.getPatients = async (req, res) => {
  try {
    const { page = 1, limit = 25, q } = req.query;
    const filter = {};

    if (q) {
      // simple text search across a few fields
      filter.$or = [
        { patientId: new RegExp(q, 'i') },
        { firstName: new RegExp(q, 'i') },
        { lastName: new RegExp(q, 'i') },
        { 'permanentAddress.mobileNo': new RegExp(q, 'i') },
        { 'permanentAddress.email': new RegExp(q, 'i') }
      ];
    }

    const patients = await Patient.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Patient.countDocuments(filter);

    return res.json({ data: patients, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * Get single patient by id (mongo _id or patientId)
 */
exports.getPatientById = async (req, res) => {
  try {
    console.log("Searching for patientId:", req.params.id);

    const query = /^[0-9a-fA-F]{24}$/.test(req.params.id)
      ? { _id: req.params.id }
      : { patientId: req.params.id };

    const patient = await Patient.findOne(query);
    console.log("Patient found:", patient);

    if (!patient) {
      console.log("No patient found!");
      return res.status(404).json({ message: 'Patient not found' });
    }

    console.log("Sending response...");
    return res.json(patient);

  } catch (error) {
    console.error("Error fetching patient:", error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};




/**
 * Update patient
 */
exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const patient = (await Patient.findById(id)) || (await Patient.findOne({ patientId: id }));
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    // merge data (simple approach)
    Object.assign(patient, data);
    await patient.save();
    return res.json(patient);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * Delete patient
 */
exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = (await Patient.findByIdAndDelete(id)) || (await Patient.findOneAndDelete({ patientId: id }));
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    return res.json({ message: 'Deleted', id: patient._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
