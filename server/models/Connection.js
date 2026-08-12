import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Connection = sequelize.define('Connection', {
  _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }
}, {
  indexes: [
    { unique: true, fields: ['requestId', 'referrerId'] }
  ]
});

export default Connection;
