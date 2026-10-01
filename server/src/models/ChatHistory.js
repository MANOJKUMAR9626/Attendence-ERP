import mongoose from 'mongoose';

const chatHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, required: true }, // To group conversations
  messages: [{
    role: { type: String, enum: ['user', 'model', 'system'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    // If the AI fetched DB context, store what it fetched for audit/explainability
    contextUsed: { type: mongoose.Schema.Types.Mixed }, 
  }],
}, { timestamps: true });

export default mongoose.model('ChatHistory', chatHistorySchema);
