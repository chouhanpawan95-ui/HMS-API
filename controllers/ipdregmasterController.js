// controllers/ipdregmasterController.js
const IpdRegMaster = require('../models/ipdregmaster');

// Helper: generate next PK_IPDId (e.g. IPD0001)
async function generateNextIpdId() {
  const last = await IpdRegMaster.findOne({ PK_IPDId: { $regex: '^IPD\\d+$' } }).sort({ PK_IPDId: -1 }).lean();
  let nextId = 'IPD0001';
  if (last && last.PK_IPDId) {
    const n = parseInt(last.PK_IPDId.replace(/^IPD/, ''), 10) || 0;
    const newNum = (n + 1).toString().padStart(4, '0');
    nextId = `IPD${newNum}`;
  } else {
    const all = await IpdRegMaster.find({ PK_IPDId: { $regex: '^IPD\\d+$' } }).select('PK_IPDId').lean();
    if (all.length) {
      let max = 0;
      all.forEach(r => {
        const val = parseInt((r.PK_IPDId || '').replace(/^IPD/, ''), 10) || 0;
        if (val > max) max = val;
      });
      const newNum = (max + 1).toString().padStart(4, '0');
      nextId = `IPD${newNum}`;
    }
  }
  return nextId;
}

/** Create new IPD registration */
exports.createIpd = async (req, res) => {
  try {
    const data = req.body;
    if (!data.PK_IPDId) {
      data.PK_IPDId = await generateNextIpdId();
    }

    const existing = await IpdRegMaster.findOne({ PK_IPDId: data.PK_IPDId });
    if (existing) return res.status(409).json({ message: 'PK_IPDId already exists' });

    const ipd = new IpdRegMaster(data);
    const validationError = ipd.validateSync();
    if (validationError) {
      return res.status(400).json({ message: 'Validation error', errors: Object.values(validationError.errors).map(e => e.message) });
    }

    const saved = await ipd.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating ipd:', err);
    return res.status(500).json({ message: 'Server error while creating ipd', error: err.message });
  }
};

/** List IPD records with optional q/page/limit */
exports.getIpds = async (req, res) => {
  try {
    const { page = 1, limit = 25, q } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { PK_IPDId: { $regex: q, $options: 'i' } },
        { IPDNO: { $regex: q, $options: 'i' } },
        { ManualIPNO: { $regex: q, $options: 'i' } }
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const data = await IpdRegMaster.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean();
    const total = await IpdRegMaster.countDocuments(filter);
    return res.json({ data, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    console.error('Error fetching ipds:', err);
    return res.status(500).json({ message: 'Server error while fetching ipds', error: err.message });
  }
};

/** Get next IPD id */
exports.getNextIpdId = async (req, res) => {
  try {
    const nextId = await generateNextIpdId();
    return res.json({ PK_IPDId: nextId });
  } catch (err) {
    console.error('Error getting next ipd id:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/** Get single ipd by PK_IPDId or mongo _id */
exports.getIpdById = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId ? { _id: id } : { PK_IPDId: id };
    const ipd = await IpdRegMaster.findOne(query);
    if (!ipd) return res.status(404).json({ message: 'IPD record not found' });
    return res.json(ipd);
  } catch (err) {
    console.error('Error fetching ipd:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/** Update ipd */
exports.updateIpd = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    // try PK_IPDId first then mongo id
    let ipd = await IpdRegMaster.findOneAndUpdate({ PK_IPDId: id }, updateData, { new: true, runValidators: true });
    if (!ipd) {
      if (/^[0-9a-fA-F]{24}$/.test(id)) {
        ipd = await IpdRegMaster.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      }
    }
    if (!ipd) return res.status(404).json({ message: 'IPD record not found' });
    return res.json({ message: 'IPD updated', data: ipd });
  } catch (err) {
    console.error('Error updating ipd:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/** Delete ipd */
exports.deleteIpd = async (req, res) => {
  try {
    const { id } = req.params;
    let ipd = await IpdRegMaster.findOneAndDelete({ PK_IPDId: id });
    if (!ipd && /^[0-9a-fA-F]{24}$/.test(id)) {
      ipd = await IpdRegMaster.findByIdAndDelete(id);
    }
    if (!ipd) return res.status(404).json({ message: 'IPD record not found' });
    return res.json({ message: 'Deleted', id: ipd._id });
  } catch (err) {
    console.error('Error deleting ipd:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
