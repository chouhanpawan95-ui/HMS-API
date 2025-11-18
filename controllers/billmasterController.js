// controllers/billmasterController.js
const BillMaster = require('../models/billmaster');

// Create a new bill
exports.createBill = async (req, res) => {
  try {
    const data = req.body;
    if (!data.PK_BillId) return res.status(400).json({ message: 'PK_BillId is required' });

    const existing = await BillMaster.findOne({ PK_BillId: data.PK_BillId });
    if (existing) return res.status(409).json({ message: 'PK_BillId already exists' });

    const bill = new BillMaster(data);
    const validationError = bill.validateSync();
    if (validationError) return res.status(400).json({ message: 'Validation error', errors: validationError.errors });

    const saved = await bill.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('createBill error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get bills with pagination and optional search
exports.getBills = async (req, res) => {
  try {
    const { page = 1, limit = 25, q } = req.query;
    const filter = {};
    if (q) {
      const re = new RegExp(q, 'i');
      filter.$or = [
        { BillNo: re },
        { Diagnosis: re },
        { Tokenno: re }
      ];
    }

    const bills = await BillMaster.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await BillMaster.countDocuments(filter);
    return res.json({ data: bills, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('getBills error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get single bill by Mongo _id or PK_BillId
exports.getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    let bill = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      bill = await BillMaster.findById(id);
    }
    if (!bill) bill = await BillMaster.findOne({ PK_BillId: Number(id) });
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    return res.json(bill);
  } catch (err) {
    console.error('getBillById error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update bill
exports.updateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    let bill = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      bill = await BillMaster.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    } else {
      bill = await BillMaster.findOneAndUpdate({ PK_BillId: Number(id) }, data, { new: true, runValidators: true });
    }
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    return res.json(bill);
  } catch (err) {
    console.error('updateBill error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete bill
exports.deleteBill = async (req, res) => {
  try {
    const { id } = req.params;
    let bill = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      bill = await BillMaster.findByIdAndDelete(id);
    } else {
      bill = await BillMaster.findOneAndDelete({ PK_BillId: Number(id) });
    }
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    return res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('deleteBill error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
