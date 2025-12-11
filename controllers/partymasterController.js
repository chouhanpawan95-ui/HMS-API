const PartyMaster = require('../models/partymaster');

// Helper: generate next partyId (e.g., PTY0001)
async function generateNextPartyId() {
  const last = await PartyMaster.findOne({ partyId: { $regex: '^PTY\\d+$' } }).sort({ partyId: -1 }).lean();
  let nextId = 'PTY0001';
  if (last && last.partyId) {
    const lastNumber = parseInt(last.partyId.replace(/^PTY/, ''), 10) || 0;
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    nextId = `PTY${newNumber}`;
  } else {
    const all = await PartyMaster.find({ partyId: { $regex: '^PTY\\d+$' } }).select('partyId').lean();
    if (all.length) {
      let max = 0;
      all.forEach(r => {
        const n = parseInt((r.partyId || '').replace(/^PTY/, ''), 10) || 0;
        if (n > max) max = n;
      });
      const newNumber = (max + 1).toString().padStart(4, '0');
      nextId = `PTY${newNumber}`;
    }
  }
  return nextId;
}

// Create new party
exports.createParty = async (req, res) => {
  try {
    const data = req.body;
    if (!data.partyId) {
      try {
        data.partyId = await generateNextPartyId();
      } catch (genErr) {
        console.error('Error generating partyId:', genErr);
        return res.status(500).json({ message: 'Error generating partyId', error: genErr.message });
      }
    }

    const existing = await PartyMaster.findOne({ partyId: data.partyId });
    if (existing) return res.status(409).json({ message: 'partyId already exists' });

    const party = new PartyMaster(data);
    const validationError = party.validateSync();
    if (validationError) return res.status(400).json({ message: 'Validation error', errors: Object.values(validationError.errors).map(err => err.message) });

    const saved = await party.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating party:', err);
    if (err.name === 'ValidationError') return res.status(400).json({ message: 'Validation error', errors: Object.values(err.errors).map(e => e.message) });
    if (err.code === 11000) return res.status(409).json({ message: 'Duplicate key error', error: err.message });
    return res.status(500).json({ message: 'Server error while creating party', error: err.message });
  }
};

// Get all parties with optional search
exports.getParties = async (req, res) => {
  try {
    const { page = 1, limit = 25, q } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { partyId: new RegExp(q, 'i') },
        { PartyName: new RegExp(q, 'i') },
        { ShortName: new RegExp(q, 'i') }
      ];
    }

    const records = await PartyMaster.find(filter).skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await PartyMaster.countDocuments(filter);
    return res.json({ data: records, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching parties:', err);
    return res.status(500).json({ message: 'Error fetching parties', error: err.message });
  }
};

// Get next partyId
exports.getNextPartyId = async (req, res) => {
  try {
    const nextId = await generateNextPartyId();
    return res.json({ partyId: nextId });
  } catch (err) {
    console.error('Error getting next partyId:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get party by id
exports.getPartyById = async (req, res) => {
  try {
    const query = /^[0-9a-fA-F]{24}$/.test(req.params.id) ? { _id: req.params.id } : { partyId: req.params.id };
    const record = await PartyMaster.findOne(query);
    if (!record) return res.status(404).json({ message: 'Party not found' });
    return res.json(record);
  } catch (err) {
    console.error('Error fetching party:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update party
exports.updateParty = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const record = (await PartyMaster.findById(id)) || (await PartyMaster.findOne({ partyId: id }));
    if (!record) return res.status(404).json({ message: 'Party not found' });
    Object.assign(record, data);
    await record.save();
    return res.json(record);
  } catch (err) {
    console.error('Error updating party:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete party
exports.deleteParty = async (req, res) => {
  try {
    const { id } = req.params;
    const record = (await PartyMaster.findByIdAndDelete(id)) || (await PartyMaster.findOneAndDelete({ partyId: id }));
    if (!record) return res.status(404).json({ message: 'Party not found' });
    return res.json({ message: 'Deleted', id: record._id });
  } catch (err) {
    console.error('Error deleting party:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
