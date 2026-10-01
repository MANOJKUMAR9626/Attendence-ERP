import mongoose from 'mongoose';

const parentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  relation: { type: String, enum: ['Father', 'Mother', 'Guardian', 'Sibling', 'Other'], default: 'Father' },
  occupation: String,
  annualIncome: String,
  address: { street: String, city: String, state: String, pincode: String, country: { type: String, default: 'India' } },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Parent', parentSchema);
