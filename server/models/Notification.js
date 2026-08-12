import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Notification = sequelize.define('Notification', {
  _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  type: { type: DataTypes.ENUM('connected', 'referred', 'thanked', 'comment', 'invite_used'), allowNull: false },
  message: { type: DataTypes.STRING, allowNull: false },
  read: { type: DataTypes.BOOLEAN, defaultValue: false }
});

export default Notification;
