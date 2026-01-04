// controllers/billdetailController.js
// PostgreSQL-only implementation for BillDetail
const { pgEnabled } = require('../config/pgdb');
const pg = require('../models/pg');
const PgBillDetail = pg.BillDetail;
const Op = require('sequelize').Op;

// Helper: generate next PK_BillDetailId (e.g., BLD0001)
async function generateNextBillDetailId() {
  if (!pgEnabled) throw new Error('Postgres is not configured. Set DATABASE_URL and USE_PG=true');

  const rows = await PgBillDetail.findAll({ where: { PK_BillDetailId: { [Op.iLike]: 'BLD%'} }, attributes: ['PK_BillDetailId'] });
  let max = 0;
  rows.forEach(r => {
    const n = parseInt((r.PK_BillDetailId || '').replace(/^BLD/, ''), 10) || 0;
    if (n > max) max = n;
  });
  const newNumber = (max + 1).toString().padStart(4, '0');
  return `BLD${newNumber}`;

}

// Create new bill detail (PG only)
exports.createBillDetail = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });

    const data = req.body;
    if (!data.PK_BillDetailId) data.PK_BillDetailId = await generateNextBillDetailId();

    const existing = await PgBillDetail.findOne({ where: { PK_BillDetailId: data.PK_BillDetailId } });
    if (existing) return res.status(409).json({ message: 'PK_BillDetailId already exists' });

    const saved = await PgBillDetail.create(data);
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating bill detail (PG):', err);
    return res.status(500).json({ message: 'Server error while creating bill detail', error: err.message });
  }
};

// Get all bill details with optional search (PG only)
exports.getBillDetails = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });

    const { page = 1, limit = 25, q } = req.query;
    const where = {};
    if (q) {
      where[Op.or] = [
        { PK_BillDetailId: { [Op.iLike]: `%${q}%` } },
        { FK_BillId: { [Op.iLike]: `%${q}%` } },
        { FK_ServiceId: { [Op.iLike]: `%${q}%` } }
      ];
    }
    const records = await PgBillDetail.findAll({ where, limit: Number(limit), offset: (page - 1) * limit, order: [['createdAt', 'DESC']] });
    const total = await PgBillDetail.count({ where });
    return res.json({ data: records, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching bill details (PG):', err);
    return res.status(500).json({ message: 'Error fetching bill details', error: err.message });
  }
};

// Get bill details by FK_BillId (PG only)
exports.getByBillId = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const { billId } = req.params;
    const { page = 1, limit = 25 } = req.query;

    const where = { FK_BillId: billId };
    const records = await PgBillDetail.findAll({ where, limit: Number(limit), offset: (page - 1) * limit, order: [['createdAt', 'DESC']] });
    const total = await PgBillDetail.count({ where });
    return res.json({ data: records, total, page: Number(page), limit: Number(limit), FK_BillId: billId });
  } catch (err) {
    console.error('Error fetching bill details by bill ID (PG):', err);
    return res.status(500).json({ message: 'Error fetching bill details', error: err.message });
  }
};

// Get next PK_BillDetailId (PG only)
exports.getNextBillDetailId = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const nextId = await generateNextBillDetailId();
    return res.json({ PK_BillDetailId: nextId });
  } catch (err) {
    console.error('Error getting next bill detail id (PG):', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get bill detail by id (PG only)
exports.getBillDetailById = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const id = req.params.id;
    let record = await PgBillDetail.findOne({ where: { PK_BillDetailId: id } });
    if (!record && !isNaN(parseInt(id))) record = await PgBillDetail.findByPk(id);
    if (!record) return res.status(404).json({ message: 'Bill detail not found' });
    return res.json(record);
  } catch (err) {
    console.error('Error fetching bill detail (PG):', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update bill detail (PG only)
exports.updateBillDetail = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const { id } = req.params;
    const data = req.body;
    let record = await PgBillDetail.findOne({ where: { PK_BillDetailId: id } });
    if (!record && !isNaN(parseInt(id))) record = await PgBillDetail.findByPk(id);
    if (!record) return res.status(404).json({ message: 'Bill detail not found' });
    await record.update(data);
    return res.json(record);
  } catch (err) {
    console.error('Error updating bill detail (PG):', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete bill detail (PG only)
exports.deleteBillDetail = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const { id } = req.params;
    const deleted = await PgBillDetail.destroy({ where: { PK_BillDetailId: id } });
    if (!deleted) {
      if (!isNaN(parseInt(id))) {
        const del2 = await PgBillDetail.destroy({ where: { id } });
        if (!del2) return res.status(404).json({ message: 'Bill detail not found' });
        return res.json({ message: 'Deleted', id });
      }
      return res.status(404).json({ message: 'Bill detail not found' });
    }
    return res.json({ message: 'Deleted', id });
  } catch (err) {
    console.error('Error deleting bill detail (PG):', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
