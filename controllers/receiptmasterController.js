// controllers/receiptmasterController.js
// PostgreSQL-only implementation for ReceiptMaster
const { pgEnabled } = require('../config/pgdb');
const pg = require('../models/pg');
const PgReceiptMaster = pg.ReceiptMaster;
const Op = require('sequelize').Op;

// Helper: generate next receiptId (R0001)
async function generateNextReceiptId() {
  if (!pgEnabled) throw new Error('Postgres is not configured. Set DATABASE_URL and USE_PG=true');
  const rows = await PgReceiptMaster.findAll({ where: { receiptId: { [Op.iLike]: 'R%' } }, attributes: ['receiptId'] });
  let max = 0;
  rows.forEach(r => {
    const n = parseInt((r.receiptId || '').replace(/^R/, ''), 10) || 0;
    if (n > max) max = n;
  });
  const newNumber = (max + 1).toString().padStart(4, '0');
  return `R${newNumber}`;
}

// Create new receipt
exports.createReceipt = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });

    const data = req.body || {};
    if (!data.receiptId) data.receiptId = await generateNextReceiptId();

    const existing = await PgReceiptMaster.findOne({ where: { receiptId: data.receiptId } });
    if (existing) return res.status(409).json({ message: 'receiptId already exists' });

    const saved = await PgReceiptMaster.create(data);
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating receipt master (PG):', err);
    return res.status(500).json({ message: 'Server error while creating receipt master', error: err.message });
  }
};

// List receipts
exports.getReceipts = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });

    const { page = 1, limit = 25, q, paymentDate, startDate, endDate } = req.query;
    const where = {};
    if (q) {
      where[Op.or] = [
        { receiptId: { [Op.iLike]: `%${q}%` } },
        { receiptNo: { [Op.iLike]: `%${q}%` } },
        { userRemarks: { [Op.iLike]: `%${q}%` } }
      ];
    }
    if (paymentDate) {
      const d = new Date(paymentDate); if (isNaN(d)) return res.status(400).json({ message: 'Invalid paymentDate' });
      const s = new Date(d); s.setHours(0,0,0,0); const e = new Date(d); e.setHours(23,59,59,999);
      where.paymentDate = { [Op.between]: [s, e] };
    } else if (startDate || endDate) {
      const range = {};
      if (startDate) { const s = new Date(startDate); if (isNaN(s)) return res.status(400).json({ message: 'Invalid startDate' }); s.setHours(0,0,0,0); range[Op.gte] = s; }
      if (endDate) { const e = new Date(endDate); if (isNaN(e)) return res.status(400).json({ message: 'Invalid endDate' }); e.setHours(23,59,59,999); range[Op.lte] = e; }
      if (Object.keys(range).length) where.paymentDate = range;
    }

    const records = await PgReceiptMaster.findAll({ where, limit: Number(limit), offset: (page - 1) * limit, order: [['createdAt', 'DESC']] });
    const total = await PgReceiptMaster.count({ where });
    return res.json({ data: records, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching receipts (PG):', err);
    return res.status(500).json({ message: 'Error fetching receipts', error: err.message });
  }
};

// Get next receiptId
exports.getNextReceiptId = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const nextId = await generateNextReceiptId();
    return res.json({ receiptId: nextId });
  } catch (err) {
    console.error('Error getting next receiptId (PG):', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get receipt by id
exports.getReceiptById = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const id = req.params.id;
    let record = await PgReceiptMaster.findOne({ where: { receiptId: id } });
    if (!record && !isNaN(parseInt(id))) record = await PgReceiptMaster.findByPk(id);
    if (!record) return res.status(404).json({ message: 'Receipt not found' });
    return res.json(record);
  } catch (err) {
    console.error('Error fetching receipt (PG):', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update receipt
exports.updateReceipt = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const { id } = req.params;
    const data = req.body;
    let record = await PgReceiptMaster.findOne({ where: { receiptId: id } });
    if (!record && !isNaN(parseInt(id))) record = await PgReceiptMaster.findByPk(id);
    if (!record) return res.status(404).json({ message: 'Receipt not found' });
    await record.update(data);
    return res.json(record);
  } catch (err) {
    console.error('Error updating receipt (PG):', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete receipt
exports.deleteReceipt = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const { id } = req.params;
    const deleted = await PgReceiptMaster.destroy({ where: { receiptId: id } });
    if (!deleted) {
      if (!isNaN(parseInt(id))) {
        const del2 = await PgReceiptMaster.destroy({ where: { id } });
        if (!del2) return res.status(404).json({ message: 'Receipt not found' });
        return res.json({ message: 'Deleted', id });
      }
      return res.status(404).json({ message: 'Receipt not found' });
    }
    return res.json({ message: 'Deleted', id });
  } catch (err) {
    console.error('Error deleting receipt (PG):', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};