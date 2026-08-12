import User from './User.js';
import Request from './Request.js';
import Comment from './Comment.js';
import Connection from './Connection.js';
import Invite from './Invite.js';
import Notification from './Notification.js';
import Referral from './Referral.js';
import Thanks from './Thanks.js';
import sequelize from '../db.js';

// Associations

// Request <-> User (Author)
User.hasMany(Request, { foreignKey: 'authorId', as: 'requests' });
Request.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// Comment <-> User & Request
User.hasMany(Comment, { foreignKey: 'authorId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
Request.hasMany(Comment, { foreignKey: 'requestId', as: 'comments' });
Comment.belongsTo(Request, { foreignKey: 'requestId', as: 'request' });

// Connection <-> User (Referrer) & Request
User.hasMany(Connection, { foreignKey: 'referrerId', as: 'connections' });
Connection.belongsTo(User, { foreignKey: 'referrerId', as: 'referrer' });
Request.hasMany(Connection, { foreignKey: 'requestId', as: 'connections' });
Connection.belongsTo(Request, { foreignKey: 'requestId', as: 'request' });

// Referral <-> User (Referrer) & Request
User.hasMany(Referral, { foreignKey: 'referrerId', as: 'referrals' });
Referral.belongsTo(User, { foreignKey: 'referrerId', as: 'referrer' });
Request.hasOne(Referral, { foreignKey: 'requestId', as: 'referral' });
Referral.belongsTo(Request, { foreignKey: 'requestId', as: 'request' });

// Thanks <-> User (From/To) & Request
User.hasMany(Thanks, { foreignKey: 'fromId', as: 'thanksSent' });
Thanks.belongsTo(User, { foreignKey: 'fromId', as: 'from' });
User.hasMany(Thanks, { foreignKey: 'toId', as: 'thanksReceived' });
Thanks.belongsTo(User, { foreignKey: 'toId', as: 'to' });
Request.hasOne(Thanks, { foreignKey: 'requestId', as: 'thanks' });
Thanks.belongsTo(Request, { foreignKey: 'requestId', as: 'request' });

// Invite <-> User (CreatedBy/UsedBy)
User.hasMany(Invite, { foreignKey: 'createdById', as: 'createdInvites' });
Invite.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });
User.hasOne(Invite, { foreignKey: 'usedById', as: 'usedInvite' });
Invite.belongsTo(User, { foreignKey: 'usedById', as: 'usedBy' });

// Notification <-> User & Request
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Request.hasMany(Notification, { foreignKey: 'relatedRequestId', as: 'relatedRequestModel' });
Notification.belongsTo(Request, { foreignKey: 'relatedRequestId', as: 'relatedRequest' });

export {
  User, Request, Comment, Connection, Invite, Notification, Referral, Thanks, sequelize
};
