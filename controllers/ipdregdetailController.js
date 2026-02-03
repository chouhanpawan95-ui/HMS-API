// controllers/ipdregdetailController.js
const IpdRegDetail = require('../models/ipdregdetail');

// Helper: generate next PK_TranID (e.g. TRN0001)
async function generateNextTranId() {
  const last = await IpdRegDetail.findOne({ PK_TranID: { $regex: '^TRN\\d+$' } }).sort({ PK_TranID: -1 }).lean();
  let nextId = 'TRN0001';
  if (last && last.PK_TranID) {
    const n = parseInt(last.PK_TranID.replace(/^TRN/, ''), 10) || 0;
    const newNum = (n + 1).toString().padStart(4, '0');
    nextId = `TRN${newNum}`;
  } else {
    const all = await IpdRegDetail.find({ PK_TranID: { $regex: '^TRN\\d+$' } }).select('PK_TranID').lean();
    if (all.length) {
      let max = 0;
      all.forEach(r => {
        const v = parseInt((r.PK_TranID || '').replace(/^TRN/, ''), 10) || 0;
        if (v > max) max = v;
      });
      const newNum = (max + 1).toString().padStart(4, '0');
      nextId = `TRN${newNum}`;
    }
  }
  return nextId;
}

/** Create new tran detail */
exports.createTran = async (req, res) => {
  try {
    const data = req.body;
    if (!data.PK_TranID) data.PK_TranID = await generateNextTranId();

    const existing = await IpdRegDetail.findOne({ PK_TranID: data.PK_TranID });
    if (existing) return res.status(409).json({ message: 'PK_TranID already exists' });

    const doc = new IpdRegDetail(data);
    const validationError = doc.validateSync();
    if (validationError) return res.status(400).json({ message: 'Validation error', errors: Object.values(validationError.errors).map(e => e.message) });

    const saved = await doc.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating tran:', err);
    return res.status(500).json({ message: 'Server error while creating tran', error: err.message });
  }
};

/** List tran details with optional filters */
exports.getTrans = async (req, res) => {
  try {
    const { page = 1, limit = 25, q, ipdId } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { PK_TranID: { $regex: q, $options: 'i' } },
        { FK_BedID: { $regex: q, $options: 'i' } }
      ];
    }
    if (ipdId) filter.FK_IPDID = ipdId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const data = await IpdRegDetail.find(filter).sort({ EntryDateTime: -1 }).skip(skip).limit(parseInt(limit)).lean();
    const total = await IpdRegDetail.countDocuments(filter);
    return res.json({ data, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    console.error('Error fetching trans:', err);
    return res.status(500).json({ message: 'Server error while fetching trans', error: err.message });
  }
};

/** Get next tran id */
exports.getNextTranId = async (req, res) => {
  try {
    const nextId = await generateNextTranId();
    return res.json({ PK_TranID: nextId });
  } catch (err) {
    console.error('Error getting next tran id:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/** Get single tran by PK_TranID or _id */
exports.getTranById = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId ? { _id: id } : { PK_TranID: id };
    const doc = await IpdRegDetail.findOne(query);
    if (!doc) return res.status(404).json({ message: 'Tran not found' });
    return res.json(doc);
  } catch (err) {
    console.error('Error fetching tran:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/** Update tran */
exports.updateTran = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    let doc = await IpdRegDetail.findOneAndUpdate({ PK_TranID: id }, update, { new: true, runValidators: true });
    if (!doc && /^[0-9a-fA-F]{24}$/.test(id)) {
      doc = await IpdRegDetail.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    }
    if (!doc) return res.status(404).json({ message: 'Tran not found' });
    return res.json({ message: 'Tran updated', data: doc });
  } catch (err) {
    console.error('Error updating tran:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/** Delete tran */
exports.deleteTran = async (req, res) => {
  try {
    const { id } = req.params;
    let doc = await IpdRegDetail.findOneAndDelete({ PK_TranID: id });
    if (!doc && /^[0-9a-fA-F]{24}$/.test(id)) {
      doc = await IpdRegDetail.findByIdAndDelete(id);
    }
    if (!doc) return res.status(404).json({ message: 'Tran not found' });
    return res.json({ message: 'Deleted', id: doc._id });
  } catch (err) {
    console.error('Error deleting tran:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
