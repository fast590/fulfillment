const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  return Shop.init(sequelize, DataTypes);
};

class Shop extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    super.init(
      {
        ShopDomain: {
          type: DataTypes.TEXT,
          allowNull: false,
          primaryKey: true,
          field: "shop_domain",
        },
        FulfillmentServiceId: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: "fulfillment_service_id",
        },
        FulfillmentLocationId: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: "fulfillment_location_id",
        },
        CreatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.Sequelize.literal("CURRENT_TIMESTAMP"),
          field: "created_at",
        },
        ModifiedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.Sequelize.literal("CURRENT_TIMESTAMP"),
          field: "modified_at",
        },
      },
      {
        sequelize,
        tableName: "shop",
        schema: "shopify",
        hasTrigger: true,
        timestamps: false,
        indexes: [
          {
            name: "shop_pkey",
            unique: true,
            fields: [{ name: "shop_domain" }],
          },
        ],
      }
    );
    return Shop;
  }
}
