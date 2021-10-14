import Sequelize from "sequelize";
import config from "../config";
import initModels from "./models";

const sequelize = new Sequelize(config.database.uri, config.database.options);

class Database {
  constructor() {
    throw new Error("Use DB.getInstance()");
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = initModels(sequelize);
    }
    return Database.instance;
  }
}
module.exports = Database.getInstance();
