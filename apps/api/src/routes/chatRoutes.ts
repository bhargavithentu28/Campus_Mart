import { Router } from 'express';
import {
  getChats,
  getChatMessages,
  createChat,
  sendMessage,
  apiTranslateMessage,
  apiSummarizeChat,
  apiSuggestReplies
} from '../controllers/chatController';
import { protect } from '../middlewares/auth';

const router = Router();

router.get('/', protect, getChats);
router.get('/messages/:chatId', protect, getChatMessages);
router.post('/create', protect, createChat);
router.post('/send', protect, sendMessage);

// AI Chat Helpers
router.post('/ai/translate', protect, apiTranslateMessage);
router.get('/ai/summary/:chatId', protect, apiSummarizeChat);
router.get('/ai/suggestions/:chatId', protect, apiSuggestReplies);

export default router;
