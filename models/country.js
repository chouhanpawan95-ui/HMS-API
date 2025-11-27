// models/Country.js
module.exports = (sequelize, DataTypes) => {
  const Country = sequelize.define(
    "Country",
    {
      PK_CountryId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      CountryName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      CountryCode: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "tblcountrymaster",
      timestamps: false,
    }
  );

  return country;
};
