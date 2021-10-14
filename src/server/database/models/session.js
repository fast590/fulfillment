const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  return Session.init(sequelize, DataTypes);
};

class Session extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    super.init(
      {
        Id: {
          type: DataTypes.TEXT,
          allowNull: false,
          primaryKey: true,
          field: "id",
        },
        ShopDomain: {
          type: DataTypes.TEXT,
          allowNull: false,
          references: {
            model: "shop",
            key: "shop_domain",
          },
          field: "shop_domain",
        },
        Scope: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: "scope",
        },
        State: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: "state",
        },
        IsOnline: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          field: "is_online",
        },
        AccessToken: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: "access_token",
        },
        Expires: {
          type: DataTypes.DATE,
          allowNull: true,
          field: "expires",
        },
        OnlineAccessInfo: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: "online_access_info",
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
        tableName: "session",
        schema: "shopify",
        hasTrigger: true,
        timestamps: false,
        indexes: [
          {
            name: "session_pkey",
            unique: true,
            fields: [{ name: "id" }],
          },
        ],
      }
    );
    return Session;
  }
}
