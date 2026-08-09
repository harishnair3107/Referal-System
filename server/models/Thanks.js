import mongoose from 'mongoose';

const thanksSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    letter: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Thanks', thanksSchema);
