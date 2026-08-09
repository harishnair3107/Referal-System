import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['open', 'connected', 'referred', 'thanked', 'closed'],
      default: 'open',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Request', requestSchema);
