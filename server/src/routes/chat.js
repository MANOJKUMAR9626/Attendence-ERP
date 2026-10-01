import express from 'express';
import { protect } from '../middleware/auth.js';
import { generateResponse } from '../services/aiChatService.js';

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    
    const reply = await generateResponse(req.user, message, history);
    res.json({ success: true, reply });
  } catch (error) {
    console.error('AI Service Error:', error);
    const errorMessage = error.message && (error.message.includes('429') || error.message.includes('quota')) ? 'AI Service is busy or rate limit exceeded. Please wait a few seconds and try again.' : 'Failed to communicate with AI Service. Please try again.';
    res.status(500).json({ success: false, message: errorMessage });
  }
});

export default router;
