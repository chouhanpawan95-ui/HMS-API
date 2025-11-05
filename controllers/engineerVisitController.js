const EngineerVisit = require('../models/EngineerVisit');
const Registration = require('../models/Registration');

// Create a new engineer visit record
const createEngineerVisit = async (req, res) => {
    try {
        const {
            projectId,
            engineerName,
            engineerComment,
            visitStartTime,
            visitEndTime
        } = req.body;

        // Verify if project exists
        const project = await Registration.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Create visit record with photos if provided
        const visitData = {
            projectId,
            engineerName,
            engineerComment,
            visitStartTime: new Date(visitStartTime),
            visitEndTime: new Date(visitEndTime)
        };

        // Handle photo uploads if present
        if (req.files && req.files.photos) {
            visitData.photos = req.files.photos.map(file => ({
                filename: file.filename,
                path: file.path,
                mimetype: file.mimetype
            }));
        }

        const engineerVisit = new EngineerVisit(visitData);
        const savedVisit = await engineerVisit.save();

        res.status(201).json({
            message: 'Engineer visit recorded successfully',
            data: savedVisit
        });

    } catch (err) {
        if (err.name === 'ValidationError') {
            const details = Object.keys(err.errors).reduce((acc, key) => {
                acc[key] = err.errors[key].message;
                return acc;
            }, {});
            return res.status(400).json({
                message: 'Validation failed',
                errors: details
            });
        }
        res.status(500).json({ message: err.message || 'Failed to record engineer visit' });
    }
};

// Get all visits for a specific project
const getProjectVisits = async (req, res) => {
    try {
        const { projectId } = req.params;
        const visits = await EngineerVisit.find({ projectId })
            .sort({ visitDate: -1 });
        res.json(visits);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to fetch visit records' });
    }
};

// Get all engineer visits
const getAllVisits = async (req, res) => {
    try {
        const visits = await EngineerVisit.find()
            .populate('projectId', 'name owner')
            .sort({ visitDate: -1 });
        res.json(visits);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to fetch visit records' });
    }
};

module.exports = {
    createEngineerVisit,
    getProjectVisits,
    getAllVisits
};