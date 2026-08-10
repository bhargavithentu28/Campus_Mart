import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { isMockDB } from '../config/db';
import Chat from '../models/Chat';
import Message from '../models/Message';
import User from '../models/User';
import { mockChats, mockMessages, mockUsers } from '../config/mockStore';
import { translateMessage, summarizeChat, suggestReplies } from '../services/gemini';

/**
 * Get all active chats for authenticated student
 */
export async function getChats(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id;

  try {
    if (isMockDB) {
      // Find chats where the user is a participant
      const userChats = mockChats.filter(chat => 
        chat.participants.includes(userId!)
      );

      // Populate participants and lastMessage
      const populatedChats = userChats.map(chat => {
        const otherId = chat.participants.find(pId => pId !== userId);
        const otherUser = mockUsers.find(u => u._id === otherId) || mockUsers[0];
        
        let lastMsg = null;
        if (chat.lastMessage) {
          lastMsg = mockMessages.find(m => m._id === chat.lastMessage) || null;
        }

        return {
          _id: chat._id,
          participants: [otherUser], // return only the other participant for ease
          lastMessage: lastMsg,
          updatedAt: chat.updatedAt
        };
      });

      // Sort by last message time
      populatedChats.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      return res.status(200).json({ success: true, chats: populatedChats });
    } else {
      const chats = await Chat.find({
        participants: userId
      })
      .populate('participants', '-password')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

      // Transform participant array to display the counterparty
      const transformedChats = chats.map((chat: any) => {
        const otherParticipants = chat.participants.filter(
          (p: any) => p._id.toString() !== userId
        );
        return {
          _id: chat._id,
          participants: otherParticipants,
          lastMessage: chat.lastMessage,
          updatedAt: chat.updatedAt
        };
      });

      return res.status(200).json({ success: true, chats: transformedChats });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Fetch messages inside a chat
 */
export async function getChatMessages(req: AuthenticatedRequest, res: Response) {
  const { chatId } = req.params;

  try {
    if (isMockDB) {
      const messages = mockMessages.filter(m => m.chat === chatId);
      // Sort ascending
      messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      
      // Update messages to 'seen: true'
      messages.forEach(m => {
        if (m.sender !== req.user?.id) m.seen = true;
      });

      return res.status(200).json({ success: true, messages });
    } else {
      const messages = await Message.find({ chat: chatId }).sort({ createdAt: 1 });
      
      // Mark as seen
      await Message.updateMany(
        { chat: chatId, sender: { $ne: req.user?.id } },
        { $set: { seen: true } }
      );

      return res.status(200).json({ success: true, messages });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Open or create a chat
 */
export async function createChat(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id;
  const { recipientId } = req.body;

  if (!recipientId) {
    return res.status(400).json({ success: false, message: 'Recipient student ID is required.' });
  }

  if (userId === recipientId) {
    return res.status(400).json({ success: false, message: 'You cannot open a chat with yourself.' });
  }

  try {
    if (isMockDB) {
      // Look for existing chat
      let chat = mockChats.find(c => 
        c.participants.includes(userId!) && c.participants.includes(recipientId)
      );

      if (!chat) {
        chat = {
          _id: `c_${Date.now()}`,
          participants: [userId!, recipientId],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockChats.push(chat);
      }

      const otherUser = mockUsers.find(u => u._id === recipientId) || mockUsers[0];
      return res.status(200).json({
        success: true,
        chat: {
          _id: chat._id,
          participants: [otherUser],
          updatedAt: chat.updatedAt
        }
      });
    } else {
      let chat = await Chat.findOne({
        participants: { $all: [userId, recipientId] }
      });

      if (!chat) {
        chat = new Chat({
          participants: [userId, recipientId]
        });
        await chat.save();
      }

      const populatedChat = await chat.populate('participants', '-password');
      const otherUser = populatedChat.participants.filter(
        (p: any) => p._id.toString() !== userId
      );

      return res.status(200).json({
        success: true,
        chat: {
          _id: chat.id,
          participants: otherUser,
          updatedAt: chat.updatedAt
        }
      });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Send Message (REST endpoint, Socket.io is used for instant updates)
 */
export async function sendMessage(req: AuthenticatedRequest, res: Response) {
  const senderId = req.user?.id;
  const { chatId, text, image, file } = req.body;

  if (!chatId) {
    return res.status(400).json({ success: false, message: 'Chat ID is required.' });
  }

  try {
    if (isMockDB) {
      const chatIndex = mockChats.findIndex(c => c._id === chatId);
      if (chatIndex === -1) return res.status(404).json({ success: false, message: 'Chat room not found.' });

      const newMsg: MockMessage = {
        _id: `m_${Date.now()}`,
        chat: chatId,
        sender: senderId!,
        text: text || '',
        image: image || '',
        file: file || '',
        seen: false,
        createdAt: new Date()
      };

      mockMessages.push(newMsg);
      mockChats[chatIndex].lastMessage = newMsg._id;
      mockChats[chatIndex].updatedAt = new Date();

      return res.status(201).json({ success: true, message: newMsg });
    } else {
      const newMsg = new Message({
        chat: chatId,
        sender: senderId,
        text: text || '',
        image: image || '',
        file: file || ''
      });

      await newMsg.save();

      await Chat.findByIdAndUpdate(chatId, {
        $set: { lastMessage: newMsg._id },
        $set: { updatedAt: new Date() }
      });

      return res.status(201).json({ success: true, message: newMsg });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * AI Endpoint: Translate Message
 */
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

/**
 * AI Endpoint: Summarize Conversation
 */
export async function apiSummarizeChat(req: AuthenticatedRequest, res: Response) {
  const { chatId } = req.params;

  try {
    let messageLogs: { senderName: string; text: string }[] = [];

    if (isMockDB) {
      const messages = mockMessages.filter(m => m.chat === chatId);
      messageLogs = messages.map(m => {
        const u = mockUsers.find(user => user._id === m.sender);
        return { senderName: u ? u.name : 'Student', text: m.text };
      });
    } else {
      const messages = await Message.find({ chat: chatId }).populate('sender', 'name');
      messageLogs = messages.map((m: any) => ({
        senderName: m.sender ? m.sender.name : 'Student',
        text: m.text
      }));
    }

    const summary = await summarizeChat(messageLogs);
    return res.status(200).json({ success: true, summary });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * AI Endpoint: Suggest Quick Replies
 */
export async function apiSuggestReplies(req: AuthenticatedRequest, res: Response) {
  const { chatId } = req.params;
  const userId = req.user?.id;

  try {
    let messageLogs: { senderName: string; text: string }[] = [];
    let isSeller = false;

    if (isMockDB) {
      const chat = mockChats.find(c => c._id === chatId);
      const messages = mockMessages.filter(m => m.chat === chatId).slice(-5); // get last 5 messages for context
      messageLogs = messages.map(m => {
        const u = mockUsers.find(user => user._id === m.sender);
        return { senderName: u ? u.name : 'Student', text: m.text };
      });
      // Mock isSeller logic: seller is usually user u_1 for cycle, u_2 for wood table. Let's toggle based on sender of first message in context
      if (chat && chat.participants[0] === userId) {
        isSeller = true;
      }
    } else {
      const chatObj = await Chat.findById(chatId);
      const messages = await Message.find({ chat: chatId }).populate('sender', 'name').sort({ createdAt: -1 }).limit(5);
      messages.reverse(); // sort chronologically

      messageLogs = messages.map((m: any) => ({
        senderName: m.sender ? m.sender.name : 'Student',
        text: m.text
      }));

      // Let's check if the current user is the product owner (seller). If the first message in this chat was initiated by someone else, we can estimate roles.
      if (chatObj && chatObj.participants[0].toString() === userId) {
        isSeller = true;
      }
    }

    const replies = await suggestReplies(messageLogs, isSeller);
    return res.status(200).json({ success: true, suggestions: replies });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
