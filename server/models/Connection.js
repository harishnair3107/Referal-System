import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
    referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

connectionSchema.index({ request: 1, referrer: 1 }, { unique: true });

export default mongoose.model('Connection', connectionSchema);
