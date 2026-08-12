import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Comment = sequelize.define('Comment', {
  _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  text: { type: DataTypes.TEXT, allowNull: false }
});

export default Comment;
