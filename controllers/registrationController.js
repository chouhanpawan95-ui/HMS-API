const Registration = require('../models/Registration');

// Create a new registration
const createRegistration = async (req, res) => {
	try {
		// Build registration data from req.body and include uploaded file metadata if present
		const registrationData = { ...req.body };
		if (req.files) {
			if (req.files.imageupload && req.files.imageupload[0]) {
				const f = req.files.imageupload[0];
				registrationData.imageupload = {
					filename: f.filename,
					path: f.path,
					mimetype: f.mimetype,
				};
			}
			if (req.files.documentupload && req.files.documentupload[0]) {
				const f = req.files.documentupload[0];
				registrationData.documentupload = {
					filename: f.filename,
					path: f.path,
					mimetype: f.mimetype,
				};
			}
		}
		const reg = new Registration(registrationData);
		const saved = await reg.save();
		res.status(201).json({ message: 'Project data inserted successfully', data: saved });
	} catch (err) {
		// If it's a Mongoose validation error, return 400 with details
		if (err.name === 'ValidationError') {
			const details = Object.keys(err.errors).reduce((acc, key) => {
				acc[key] = err.errors[key].message;
				return acc;
			}, {});
			return res.status(400).json({ message: 'Validation failed', errors: details });
		}
		res.status(500).json({ message: err.message || 'Failed to create registration' });
	}
};

// Get all registrations
const getAllRegistrations = async (req, res) => {
	try {
		const regs = await Registration.find().sort({ registrationDate: -1 });
		res.json(regs);
	} catch (err) {
		res.status(500).json({ message: err.message || 'Failed to fetch registrations' });
	}
};

module.exports = {
	createRegistration,
	getAllRegistrations,
};
