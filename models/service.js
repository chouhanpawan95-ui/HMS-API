// models/Service.js
module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define(
    "Service",
    {
      PK_ServiceId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      FK_CategoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ServiceName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      FK_TestTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      IsOutSidePerform: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      IsSCApplicable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      ServiceCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      CPTCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ServiceDescription: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      InvestigationType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ServiceTime: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      InvestigationGroup: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      HSNNO: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      IsDoctorIDRequired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      FK_SampleTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      FK_LabDepartmentID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      DeliveryPeriod: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      DeliveryTime: {
        type: DataTypes.STRING,
        allowNull: true,
      }
    },
    {
      tableName: "tblservicemaster",
      timestamps: false,
    }
  );

  return Service;
};
