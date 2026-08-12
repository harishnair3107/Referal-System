import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Request = sequelize.define('Request', {
  _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('open', 'connected', 'referred', 'thanked', 'closed'), defaultValue: 'open' }
});

export default Request;
