import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
  _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
  inviteCode: { type: DataTypes.STRING }
}, {
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  },
  defaultScope: {
    attributes: { exclude: ['password'] }
  },
  scopes: {
    withPassword: { attributes: {} }
  }
});

User.prototype.comparePassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

export default User;
