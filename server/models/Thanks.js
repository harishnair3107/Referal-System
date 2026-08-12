import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Thanks = sequelize.define('Thanks', {
  _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  letter: { type: DataTypes.TEXT, allowNull: false }
});

export default Thanks;
