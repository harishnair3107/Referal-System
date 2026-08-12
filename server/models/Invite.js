import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Invite = sequelize.define('Invite', {
  _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  usedAt: { type: DataTypes.DATE, defaultValue: null }
});

export default Invite;
