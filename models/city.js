// models/City.js
module.exports = (sequelize, DataTypes) => {
  const City = sequelize.define(
    "City",
    {
      PK_CityId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      CityName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      FK_DistrictId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      tableName: "tblcitymaster",
      timestamps: false
    }
  );

  return City;
};
