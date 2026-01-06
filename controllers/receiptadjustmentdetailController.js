// controllers/receiptadjustmentdetailController.js
// PostgreSQL-only implementation for ReceiptAdjustmentDetail
const { pgEnabled } = require('../config/pgdb');
const pg = require('../models/pg');
const PgReceiptAdjustment = pg.ReceiptAdjustmentDetail;
const Op = require('sequelize').Op;

// Helper: generate next tranId (RAD0001)
async function generateNextTranId() {
  if (!pgEnabled) throw new Error('Postgres is not configured. Set DATABASE_URL and USE_PG=true');
  const rows = await PgReceiptAdjustment.findAll({ where: { tranId: { [Op.iLike]: 'RAD%' } }, attributes: ['tranId'] });
  let max = 0;
  rows.forEach(r => {
    const n = parseInt((r.tranId || '').replace(/^RAD/, ''), 10) || 0;
    if (n > max) max = n;
  });
  const newNumber = (max + 1).toString().padStart(4, '0');
  return `RAD${newNumber}`;
}

// Create new adjustment
exports.createAdjustment = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const data = req.body || {};
    if (!data.fkReceiptId) return res.status(400).json({ message: 'fkReceiptId is required' });
    if (!data.tranId) data.tranId = await generateNextTranId();

    const existing = await PgReceiptAdjustment.findOne({ where: { tranId: data.tranId } });
    if (existing) return res.status(409).json({ message: 'tranId already exists' });

    const saved = await PgReceiptAdjustment.create(data);
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating receipt adjustment detail (PG):', err);
    return res.status(500).json({ message: 'Server error while creating receipt adjustment detail', error: err.message });
  }
};

// List adjustments with optional q, page, limit and date filters
exports.getAdjustments = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const { q, page = 1, limit = 25, adjustedDatetime, startDate, endDate, fkReceiptId } = req.query;
    const where = {};
    if (q) where[Op.or] = [ { tranId: { [Op.iLike]: `%${q}%` } }, { fkReceiptId: { [Op.iLike]: `%${q}%` } }, { fkAdjustedBillId: { [Op.iLike]: `%${q}%` } } ];
    if (fkReceiptId) where.fkReceiptId = fkReceiptId;

    if (adjustedDatetime) {
      const d = new Date(adjustedDatetime); if (isNaN(d)) return res.status(400).json({ message: 'Invalid adjustedDatetime' });
      const s = new Date(d); s.setHours(0,0,0,0); const e = new Date(d); e.setHours(23,59,59,999);
      where.adjustedDatetime = { [Op.between]: [s, e] };
    } else if (startDate || endDate) {
      const range = {};
      if (startDate) { const s = new Date(startDate); if (isNaN(s)) return res.status(400).json({ message: 'Invalid startDate' }); s.setHours(0,0,0,0); range[Op.gte] = s; }
      if (endDate) { const e = new Date(endDate); if (isNaN(e)) return res.status(400).json({ message: 'Invalid endDate' }); e.setHours(23,59,59,999); range[Op.lte] = e; }
      if (Object.keys(range).length) where.adjustedDatetime = range;
    }

    const records = await PgReceiptAdjustment.findAll({ where, limit: Number(limit), offset: (page - 1) * limit, order: [['createdAt', 'DESC']] });
    const total = await PgReceiptAdjustment.count({ where });
    return res.json({ data: records, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching receipt adjustments (PG):', err);
    return res.status(500).json({ message: 'Error fetching receipt adjustments', error: err.message });
  }
};

// Get adjustments by FK_ReceiptId
exports.getByReceiptId = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const { receiptId } = req.params;
    const { page = 1, limit = 25 } = req.query;

    const where = { fkReceiptId: receiptId };
    const records = await PgReceiptAdjustment.findAll({ where, limit: Number(limit), offset: (page - 1) * limit, order: [['createdAt', 'DESC']] });
    const total = await PgReceiptAdjustment.count({ where });
    return res.json({ data: records, total, page: Number(page), limit: Number(limit), fkReceiptId: receiptId });
  } catch (err) {
    console.error('Error fetching adjustments by receiptId (PG):', err);
    return res.status(500).json({ message: 'Error fetching adjustments', error: err.message });
  }
};

// Get next tranId
exports.getNextTranId = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const nextId = await generateNextTranId();
    return res.json({ tranId: nextId });
  } catch (err) {
    console.error('Error getting next tranId (PG):', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get adjustment by id (tranId or numeric PK)
exports.getAdjustmentById = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const id = req.params.id;
    let record = await PgReceiptAdjustment.findOne({ where: { tranId: id } });
    if (!record && !isNaN(parseInt(id))) record = await PgReceiptAdjustment.findByPk(id);
    if (!record) return res.status(404).json({ message: 'Adjustment not found' });
    return res.json(record);
  } catch (err) {
    console.error('Error fetching adjustment (PG):', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// Get adjustment(s) by adjusted bill id (fkAdjustedBillId)
exports.getByAdjustedBillId = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    // Accept either /bill/:billid or /bill/:id for robustness
    const billid = req.params.billid || req.params.id;
    if (!billid) return res.status(400).json({ message: 'bill id parameter is required' });

    // Find all adjustments linked to this adjusted bill id
    const records = await PgReceiptAdjustment.findAll({ where: { fkAdjustedBillId: billid }, order: [['createdAt', 'DESC']] });
    if (!records || !records.length) return res.status(404).json({ message: 'Adjustment not found' });
    return res.json({ data: records });
  } catch (err) {
    console.error('Error fetching adjustment by adjusted bill id (PG):', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update adjustment
exports.updateAdjustment = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const { id } = req.params;
    const data = req.body;
    let record = await PgReceiptAdjustment.findOne({ where: { tranId: id } });
    if (!record && !isNaN(parseInt(id))) record = await PgReceiptAdjustment.findByPk(id);
    if (!record) return res.status(404).json({ message: 'Adjustment not found' });
    await record.update(data);
    return res.json(record);
  } catch (err) {
    console.error('Error updating adjustment (PG):', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete adjustment
exports.deleteAdjustment = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const { id } = req.params;
    const deleted = await PgReceiptAdjustment.destroy({ where: { tranId: id } });
    if (!deleted) {
      if (!isNaN(parseInt(id))) {
        const del2 = await PgReceiptAdjustment.destroy({ where: { id } });
        if (!del2) return res.status(404).json({ message: 'Adjustment not found' });
        return res.json({ message: 'Deleted', id });
      }
      return res.status(404).json({ message: 'Adjustment not found' });
    }
    return res.json({ message: 'Deleted', id });
  } catch (err) {
    console.error('Error deleting adjustment (PG):', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};