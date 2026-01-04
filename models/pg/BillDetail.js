const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/pgdb');

const BillDetail = sequelize.define('BillDetail', {
  PK_BillDetailId: { type: DataTypes.STRING, unique: true },
  FK_BillId: { type: DataTypes.STRING, allowNull: false },
  FK_ServiceId: { type: DataTypes.STRING, allowNull: false },
  Rate: { type: DataTypes.FLOAT, defaultValue: 0 },
  Unit: { type: DataTypes.INTEGER, defaultValue: 1 },
  Amount: { type: DataTypes.FLOAT, defaultValue: 0 },
  Discount: { type: DataTypes.FLOAT, defaultValue: 0 },
  ServiceCharges: { type: DataTypes.FLOAT, defaultValue: 0 },
  NetAmt: { type: DataTypes.FLOAT, defaultValue: 0 },
  FK_PackageId: { type: DataTypes.STRING },
  IsPerformed: { type: DataTypes.BOOLEAN, defaultValue: false },
  Remarks: { type: DataTypes.TEXT },
  PK_SynchId: { type: DataTypes.INTEGER },
  Received: { type: DataTypes.BOOLEAN, defaultValue: false },
  FK_BillableServiceTranID: { type: DataTypes.STRING },
  FK_DoctorID: { type: DataTypes.STRING }
}, { tableName: 'billdetails', timestamps: true });

module.exports = BillDetail;
