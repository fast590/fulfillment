var DataTypes = require("sequelize").DataTypes;
var _Session = require("./session");
var _Setting = require("./setting");
var _Shop = require("./shop");

function initModels(sequelize) {
  var Session = _Session(sequelize, DataTypes);
  var Setting = _Setting(sequelize, DataTypes);
  var Shop = _Shop(sequelize, DataTypes);

  Session.belongsTo(Shop, { as: "ShopDomainShop", foreignKey: "ShopDomain" });
  Shop.hasMany(Session, { as: "Sessions", foreignKey: "ShopDomain" });
  Setting.belongsTo(Shop, { as: "ShopDomainShop", foreignKey: "ShopDomain" });
  Shop.hasOne(Setting, { as: "Setting", foreignKey: "ShopDomain" });

  return {
    Session,
    Setting,
    Shop,
    sequelize,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
