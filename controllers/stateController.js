// controllers/stateController.js
const State = require('../models/state');

// Helper: generate next stateId
async function generateNextStateId() {
  const lastState = await State.findOne({ stateId: { $regex: '^ST\\d+$' } }).sort({ stateId: -1 }).lean();
  let nextId = 'ST0001';
  if (lastState && lastState.stateId) {
    const lastNumber = parseInt(lastState.stateId.replace(/^ST/, ''), 10) || 0;
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    nextId = `ST${newNumber}`;
  } else {
    const all = await State.find({ stateId: { $regex: '^ST\\d+$' } }).select('stateId').lean();
    if (all.length) {
      let max = 0;
      all.forEach(s => {
        const n = parseInt((s.stateId || '').replace(/^ST/, ''), 10) || 0;
        if (n > max) max = n;
      });
      const newNumber = (max + 1).toString().padStart(4, '0');
      nextId = `ST${newNumber}`;
    }
  }
  return nextId;
}

// Create new state
exports.createState = async (req, res) => {
  try {
    const data = req.body;
    if (!data.stateId) data.stateId = await generateNextStateId();

    const existing = await State.findOne({ stateId: data.stateId });
    if (existing) return res.status(409).json({ message: 'stateId already exists' });

    const state = new State(data);
    const validationError = state.validateSync();
    if (validationError) return res.status(400).json({ message: 'Validation error', errors: Object.values(validationError.errors).map(err => err.message) });

    const savedState = await state.save();
    return res.status(201).json(savedState);
  } catch (err) {
    console.error('Error creating state:', err);
    if (err.name === 'ValidationError') return res.status(400).json({ message: 'Validation error', errors: Object.values(err.errors).map(e => e.message) });
    if (err.code === 11000) return res.status(409).json({ message: 'Duplicate key error', error: err.message });
    return res.status(500).json({ message: 'Server error while creating state', error: err.message });
  }
};

// Get all states with optional search
exports.getStates = async (req, res) => {
  try {
    const { page = 1, limit = 25, q } = req.query;
    const filter = {};
    if (q) filter.$or = [ { stateId: new RegExp(q, 'i') }, { StateName: new RegExp(q, 'i') }, { StateCode: new RegExp(q, 'i') }, { FK_CountryId: new RegExp(q, 'i') } ];

    const states = await State.find(filter).skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await State.countDocuments(filter);
    return res.json({ data: states, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching states:', err);
    return res.status(500).json({ message: 'Error fetching states', error: err.message });
  }
};

// Get next stateId
exports.getNextStateId = async (req, res) => {
  try {
    const nextId = await generateNextStateId();
    return res.json({ stateId: nextId });
  } catch (err) {
    console.error('Error getting next stateId:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get state by id
exports.getStateById = async (req, res) => {
  try {
    const query = /^[0-9a-fA-F]{24}$/.test(req.params.id) ? { _id: req.params.id } : { stateId: req.params.id };
    const state = await State.findOne(query);
    if (!state) return res.status(404).json({ message: 'State not found' });
    return res.json(state);
  } catch (error) {
    console.error('Error fetching state:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update state
exports.updateState = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const state = (await State.findById(id)) || (await State.findOne({ stateId: id }));
    if (!state) return res.status(404).json({ message: 'State not found' });
    Object.assign(state, data);
    await state.save();
    return res.json(state);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete state
exports.deleteState = async (req, res) => {
  try {
    const { id } = req.params;
    const state = (await State.findByIdAndDelete(id)) || (await State.findOneAndDelete({ stateId: id }));
    if (!state) return res.status(404).json({ message: 'State not found' });
    return res.json({ message: 'Deleted', id: state._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
