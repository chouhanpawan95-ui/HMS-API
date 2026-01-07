// controllers/billmasterController.js
// PostgreSQL-only implementation for BillMaster
const { pgEnabled } = require('../config/pgdb');
const pg = require('../models/pg');
const PgBillMaster = pg.BillMaster;
const Op = require('sequelize').Op;
console.log('Loaded controllers/billmasterController.js (PG)');

// Helper: generate next billId (e.g., B0001) - Postgres only
async function generateNextBillId() {
  if (!pgEnabled) throw new Error('Postgres is not configured. Set DATABASE_URL and USE_PG=true');

  const rows = await PgBillMaster.findAll({ where: { billId: { [Op.iLike]: 'B%' } }, attributes: ['billId'] });
  let max = 0;
  rows.forEach(r => {
    const n = parseInt((r.billId || '').replace(/^B/, ''), 10) || 0;
    if (n > max) max = n;
  });
  const newNumber = (max + 1).toString().padStart(4, '0');
  return `B${newNumber}`;
}

// Helper: sanitize numeric/nullable fields so empty strings don't get inserted into integer columns
function sanitizeNumericFields(obj, fields) {
  fields.forEach(f => {
    if (!(f in obj)) return;
    // Convert explicit empty string to null (so Postgres sees NULL, not '')
    if (obj[f] === '') {
      obj[f] = null;
      return;
    }
    // If it's a numeric string, convert to Number
    if (typeof obj[f] === 'string' && obj[f].trim() !== '' && !isNaN(obj[f])) {
      obj[f] = Number(obj[f]);
    }
  });
}

// Create new bill master (PG only)
exports.createBill = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });

    const data = req.body || {};

    // Common integer fields in BillMaster model — treat empty strings as null
    // Build integer field list dynamically from model attributes to avoid missing any integer columns
    const modelIntFields = Object.entries(PgBillMaster.rawAttributes || {})
      .filter(([k, attr]) => String(attr.type).toLowerCase().includes('integer'))
      .map(([k]) => k);
    // Fallback to hardcoded list for compatibility
    const fallbackIntFields = [
      'FK_BillingCompanyId','FK_FinYearId','FK_BranchId','FK_BillTypeId','FK_CategoryId','FK_BillSerieseId',
      'FK_DoctorId','FK_DrDeptID','FK_ReferredById','AgeYear','AgeMonth','AgeDays','FK_CreatedById','FK_CancelledById',
      'PrintCount','PK_SynchId','OLDBillID','OLDRegID','FK_OrganizerId','FK_PaytypeID','BillRefID'
    ];
    const intFields = Array.from(new Set([...(modelIntFields || []), ...fallbackIntFields]));

    sanitizeNumericFields(data, intFields);

    console.log('Sanitized bill create payload:', data);

    if (!data.billId) data.billId = await generateNextBillId();

    const existing = await PgBillMaster.findOne({ where: { billId: data.billId } });
    if (existing) return res.status(409).json({ message: 'billId already exists' });

    const saved = await PgBillMaster.create(data);
    console.log('PG saved:', saved && (typeof saved.toJSON === 'function' ? saved.toJSON() : saved));
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating bill master (PG):', err);
    if (err && err.original) console.error('Original error detail:', err.original);
    if (err && err.parent) console.error('Parent:', err.parent);
    return res.status(500).json({ message: 'Server error while creating bill master', error: err.message });
  }
};

// Get all bills with optional search (PG only)
exports.getBills = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });

    const { page = 1, limit = 25, q } = req.query;
    const where = {};
    if (q) {
      where[Op.or] = [
        { billId: { [Op.iLike]: `%${q}%` } },
        { BillNo: { [Op.iLike]: `%${q}%` } },
        { Diagnosis: { [Op.iLike]: `%${q}%` } }
      ];
    }
    const records = await PgBillMaster.findAll({ where, limit: Number(limit), offset: (page - 1) * limit, order: [['createdAt', 'DESC']] });
    const total = await PgBillMaster.count({ where });
    return res.json({ data: records, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching bills (PG):', err);
    return res.status(500).json({ message: 'Error fetching bills', error: err.message });
  }
};

// Get next billId (PG only)
exports.getNextBillId = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const nextId = await generateNextBillId();
    return res.json({ billId: nextId });
  } catch (err) {
    console.error('Error getting next billId (PG):', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get bill by id (PG only)
exports.getBillById = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const id = req.params.id;
    let record = await PgBillMaster.findOne({ where: { billId: id } });
    if (!record && !isNaN(parseInt(id))) record = await PgBillMaster.findByPk(id);
    if (!record) return res.status(404).json({ message: 'Bill not found' });
    return res.json(record);
  } catch (error) {
    console.error('Error fetching bill (PG):', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Get bill by RegId (PG only)
exports.getBillByRegId = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const regid = req.params.regid || req.params.id;
    if (!regid) return res.status(400).json({ message: 'reg id parameter is required' });
     const records = await PgBillMaster.findAll({ where: { FK_RegId:regid } , order: [['createdAt', 'DESC']] });
     if (!records || !records.length) return res.status(404).json({ message: 'bill not found' });
    return res.json({ data: records });
  } catch (err) {
    console.error('Error fetching bill by reg id (PG):', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update bill (PG only)
exports.updateBill = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const { id } = req.params;
    const data = req.body || {};

    const intFields = [
      'FK_BillingCompanyId','FK_FinYearId','FK_BranchId','FK_BillTypeId','FK_CategoryId','FK_BillSerieseId',
      'FK_DoctorId','FK_DrDeptID','FK_ReferredById','AgeYear','AgeMonth','AgeDays','FK_CreatedById','FK_CancelledById',
      'PrintCount','PK_SynchId','OLDBillID','OLDRegID','FK_OrganizerId','FK_PaytypeID','BillRefID'
    ];
    sanitizeNumericFields(data, intFields);

    let record = await PgBillMaster.findOne({ where: { billId: id } });
    if (!record && !isNaN(parseInt(id))) record = await PgBillMaster.findByPk(id);
    if (!record) return res.status(404).json({ message: 'Bill not found' });
    await record.update(data);
    return res.json(record);
  } catch (err) {
    console.error('Error updating bill (PG):', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete bill (PG only)
exports.deleteBill = async (req, res) => {
  try {
    if (!pgEnabled) return res.status(500).json({ message: 'Postgres not configured. Set DATABASE_URL and USE_PG=true' });
    const { id } = req.params;
    const deleted = await PgBillMaster.destroy({ where: { billId: id } });
    if (!deleted) {
      if (!isNaN(parseInt(id))) {
        const del2 = await PgBillMaster.destroy({ where: { id } });
        if (!del2) return res.status(404).json({ message: 'Bill not found' });
        return res.json({ message: 'Deleted', id });
      }
      return res.status(404).json({ message: 'Bill not found' });
    }
    return res.json({ message: 'Deleted', id });
  } catch (err) {
    console.error('Error deleting bill (PG):', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};















