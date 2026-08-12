import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Referral = sequelize.define('Referral', {
  _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  description: { type: DataTypes.TEXT, allowNull: false }
});

export default Referral;
