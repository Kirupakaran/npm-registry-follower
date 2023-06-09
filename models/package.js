'use strict';
const {
  Model,
  DataTypes
} = require('sequelize');
module.exports = (sequelize) => {
  class Package extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Package.init({
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    readme: { type: DataTypes.TEXT, allowNull: true },
  }, {
    sequelize,
    modelName: 'Package',
  });
  return Package;
};