// models/District.js
module.exports = (sequelize, DataTypes) => {
  const District = sequelize.define(
    "District",
    {
      PK_DistrictId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      DistrictName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      FK_StateId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      tableName: "tbldistrictmaster",
      timestamps: false
    }
  );

  return District;
};
