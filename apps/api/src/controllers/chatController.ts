import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { chatService } from '../modules/chat/chatService';
import { translateMessage, summarizeChat, suggestReplies } from '../services/gemini';

export async function getChats(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const chats = await chatService.getUserChats(req.user.id);
    return res.status(200).json({ success: true, chats });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getChatMessages(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { chatId } = req.params;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const messages = await chatService.getChatMessages(chatId, req.user.id, page);
    return res.status(200).json({ success: true, messages });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createChat(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { recipientId } = req.body;
    if (!recipientId) return res.status(400).json({ success: false, message: 'Recipient ID is required.' });

    const chat = await chatService.createOrGetChat(req.user.id, recipientId);
    return res.status(200).json({ success: true, chat });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function sendMessage(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { chatId, text, image, file } = req.body;
    if (!chatId) return res.status(400).json({ success: false, message: 'Chat ID is required.' });

    const message = await chatService.sendMessage(req.user.id, chatId, text, image, file);
    return res.status(201).json({ success: true, message });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function apiTranslateMessage(req: AuthenticatedRequest, res: Response) {
  const { text, targetLanguage } = req.body;
  if (!text || !targetLanguage) {
    return res.status(400).json({ success: false, message: 'Text and target language are required.' });
  }

  try {
    const translated = await translateMessage(text, targetLanguage);
    return res.status(200).json({ success: true, translatedText: translated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function apiSummarizeChat(req: AuthenticatedRequest, res: Response) {
  const { chatId } = req.params;
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const messages = await chatService.getChatMessages(chatId, req.user.id, 1, 20);
    const logs = messages.map(m => ({ senderName: m.sender.name, text: m.text || '' }));
    const summary = await summarizeChat(logs);
    return res.status(200).json({ success: true, summary });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function apiSuggestReplies(req: AuthenticatedRequest, res: Response) {
  const { chatId } = req.params;
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const messages = await chatService.getChatMessages(chatId, req.user.id, 1, 10);
    const logs = messages.map(m => ({ senderName: m.sender.name, text: m.text || '' }));
    const replies = await suggestReplies(logs, true);
    return res.status(200).json({ success: true, suggestions: replies });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
