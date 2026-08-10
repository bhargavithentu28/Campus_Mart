import { prisma } from '../../infrastructure/database/prisma';

export class ChatService {
  /**
   * Get all active conversations for a student
   */
  async getUserChats(userId: string) {
    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: { userId }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true, isVerified: true }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return chats.map(chat => {
      const otherParticipant = chat.participants.find(p => p.userId !== userId);
      return {
        id: chat.id,
        otherUser: otherParticipant?.user || { id: 'unknown', name: 'Student Student' },
        lastMessage: chat.messages[0] || null,
        updatedAt: chat.updatedAt
      };
    });
  }

  /**
   * Get messages for a specific conversation with security authorization check
   */
  async getChatMessages(chatId: string, userId: string, page = 1, limit = 30) {
    // Authorization check: verify user is participant
    const participant = await prisma.chatParticipant.findFirst({
      where: { chatId, userId }
    });

    if (!participant) {
      throw new Error('Unauthorized access to this conversation.');
    }

    // Mark unread messages as seen
    await prisma.message.updateMany({
      where: { chatId, senderId: { not: userId }, seen: false },
      data: { seen: true }
    });

    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        sender: { select: { id: true, name: true, avatar: true } }
      }
    });

    return messages;
  }

  /**
   * Create or retrieve conversation between buyer and seller
   */
  async createOrGetChat(userId: string, recipientId: string) {
    if (userId === recipientId) {
      throw new Error('You cannot open a conversation with yourself.');
    }

    // Check if conversation already exists
    const existingChat = await prisma.chat.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: recipientId } } }
        ]
      },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, avatar: true, isVerified: true } } }
        }
      }
    });

    if (existingChat) {
      const other = existingChat.participants.find(p => p.userId !== userId);
      return { id: existingChat.id, otherUser: other?.user };
    }

    // Create new conversation with participants
    const newChat = await prisma.chat.create({
      data: {
        participants: {
          create: [
            { userId },
            { userId: recipientId }
          ]
        }
      },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, avatar: true, isVerified: true } } }
        }
      }
    });

    const other = newChat.participants.find(p => p.userId !== userId);
    return { id: newChat.id, otherUser: other?.user };
  }

  /**
   * Persist a new message in conversation
   */
  async sendMessage(userId: string, chatId: string, text?: string, image?: string, file?: string) {
    // Authorization check
    const participant = await prisma.chatParticipant.findFirst({
      where: { chatId, userId }
    });

    if (!participant) {
      throw new Error('Unauthorized send attempt.');
    }

    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: userId,
        text: text || '',
        image: image || '',
        file: file || ''
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } }
      }
    });

    // Update conversation timestamp
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    });

    return message;
  }
}

export const chatService = new ChatService();
