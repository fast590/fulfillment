const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  return Setting.init(sequelize, DataTypes);
};

class Setting extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    super.init(
      {
        ShopDomain: {
          type: DataTypes.TEXT,
          allowNull: false,
          primaryKey: true,
          references: {
            model: "shop",
            key: "shop_domain",
          },
          field: "shop_domain",
        },
        CapsuleUsername: {
          type: DataTypes.TEXT,
          allowNull: false,
          field: "capsule_username",
        },
        CapsuleApiKey: {
          type: DataTypes.TEXT,
          allowNull: false,
          field: "capsule_api_key",
        },
        CapsuleBrandId: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: "capsule_brand_id",
        },
        Environment: {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: "development",
          field: "environment",
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
        tableName: "settings",
        schema: "shopify",
        hasTrigger: true,
        timestamps: false,
        indexes: [
          {
            name: "settings_pkey",
            unique: true,
            fields: [{ name: "shop_domain" }],
          },
        ],
      }
    );
    return Setting;
  }
}
