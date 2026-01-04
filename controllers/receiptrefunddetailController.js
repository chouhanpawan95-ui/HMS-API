// controllers/receiptrefunddetailController.js
// PostgreSQL-only implementation for ReceiptRefundDetail
const { pgEnabled } = require('../config/pgdb');
const pg = require('../models/pg');
const PgReceiptRefund = pg.ReceiptRefundDetail;
const Op = require('sequelize').Op;
console.log('Loaded controllers/receiptrefunddetailController.js (PG)');

// Helper: generate next refundId (RFD0001)
async function generateNextRefundId() {
  if (!pgEnabled) throw new Error('Postgres is not configured. Set DATABASE_URL and USE_PG=true');
  const rows = await PgReceiptRefund.findAll({ where: { refundId: { [Op.iLike]: 'RFD%' } }, attributes: ['refundId'] });
  let max = 0;
  rows.forEach(r => {
    const n = parseInt((r.refundId || '').replace(/^RFD/, ''), 10) || 0;
    if (n > max) max = n;
  });
  const newNumber = (max + 1).toString().padStart(4, '0');
  return `RFD${newNumber}`;
}

// Create refund detail
exports.createRefund = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const data = req.body || {};
    if (!data.refundId) data.refundId = await generateNextRefundId();

    const existing = await PgReceiptRefund.findOne({ where: { refundId: data.refundId } });
    if (existing) return res.status(409).json({ message: 'refundId already exists' });

    const saved = await PgReceiptRefund.create(data);
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating receipt refund detail (PG):', err);
    return res.status(500).json({ message: 'Server error while creating receipt refund detail', error: err.message });
  }
};

// List refunds with optional filters
exports.getRefunds = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const { q, page = 1, limit = 25, refundDate, startDate, endDate, fkReceiptId } = req.query;
    const where = {};
    if (q) where[Op.or] = [ { refundId: { [Op.iLike]: `%${q}%` } }, { fkReceiptId: { [Op.iLike]: `%${q}%` } }, { refundReason: { [Op.iLike]: `%${q}%` } } ];
    if (fkReceiptId) where.fkReceiptId = fkReceiptId;

    if (refundDate) {
      const d = new Date(refundDate); if (isNaN(d)) return res.status(400).json({ message: 'Invalid refundDate' });
      const s = new Date(d); s.setHours(0,0,0,0); const e = new Date(d); e.setHours(23,59,59,999);
      where.refundDate = { [Op.between]: [s, e] };
    } else if (startDate || endDate) {
      const range = {};
      if (startDate) { const s = new Date(startDate); if (isNaN(s)) return res.status(400).json({ message: 'Invalid startDate' }); s.setHours(0,0,0,0); range[Op.gte] = s; }
      if (endDate) { const e = new Date(endDate); if (isNaN(e)) return res.status(400).json({ message: 'Invalid endDate' }); e.setHours(23,59,59,999); range[Op.lte] = e; }
      if (Object.keys(range).length) where.refundDate = range;
    }

    const records = await PgReceiptRefund.findAll({ where, limit: Number(limit), offset: (page - 1) * limit, order: [['createdAt', 'DESC']] });
    const total = await PgReceiptRefund.count({ where });
    return res.json({ data: records, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching receipt refunds (PG):', err);
    return res.status(500).json({ message: 'Error fetching receipt refunds', error: err.message });
  }
};

// Get refunds by receipt id
exports.getByReceiptId = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const { receiptId } = req.params;
    const { page = 1, limit = 25 } = req.query;

    const where = { fkReceiptId: receiptId };
    const records = await PgReceiptRefund.findAll({ where, limit: Number(limit), offset: (page - 1) * limit, order: [['createdAt', 'DESC']] });
    const total = await PgReceiptRefund.count({ where });
    return res.json({ data: records, total, page: Number(page), limit: Number(limit), fkReceiptId: receiptId });
  } catch (err) {
    console.error('Error fetching refunds by receiptId (PG):', err);
    return res.status(500).json({ message: 'Error fetching refunds', error: err.message });
  }
};

// Get next refund id
exports.getNextRefundId = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const nextId = await generateNextRefundId();
    return res.json({ refundId: nextId });
  } catch (err) {
    console.error('Error getting next refundId (PG):', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get refund by id
exports.getRefundById = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const id = req.params.id;
    let record = await PgReceiptRefund.findOne({ where: { refundId: id } });
    if (!record && !isNaN(parseInt(id))) record = await PgReceiptRefund.findByPk(id);
    if (!record) return res.status(404).json({ message: 'Refund not found' });
    return res.json(record);
  } catch (err) {
    console.error('Error fetching refund (PG):', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update refund
exports.updateRefund = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const { id } = req.params;
    const data = req.body;
    let record = await PgReceiptRefund.findOne({ where: { refundId: id } });
    if (!record && !isNaN(parseInt(id))) record = await PgReceiptRefund.findByPk(id);
    if (!record) return res.status(404).json({ message: 'Refund not found' });
    await record.update(data);
    return res.json(record);
  } catch (err) {
    console.error('Error updating refund (PG):', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete refund
exports.deleteRefund = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const { id } = req.params;
    const deleted = await PgReceiptRefund.destroy({ where: { refundId: id } });
    if (!deleted) {
      if (!isNaN(parseInt(id))) {
        const del2 = await PgReceiptRefund.destroy({ where: { id } });
        if (!del2) return res.status(404).json({ message: 'Refund not found' });
        return res.json({ message: 'Deleted', id });
      }
      return res.status(404).json({ message: 'Refund not found' });
    }
    return res.json({ message: 'Deleted', id });
  } catch (err) {
    console.error('Error deleting refund (PG):', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};