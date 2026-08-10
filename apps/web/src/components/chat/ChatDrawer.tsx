import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Image as ImageIcon, Sparkles, DollarSign, Calendar, ShieldCheck, CheckCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { OfferModal } from './OfferModal';
import { MeetupModal } from './MeetupModal';
import { api } from '../../lib/api';
import { socket } from '../../lib/socket';

export interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
  activeChatId?: string;
  recipientUser?: any;
  productContext?: any;
}

export function ChatDrawer({
  isOpen,
  onClose,
  currentUser,
  activeChatId: initialChatId,
  recipientUser,
  productContext
}: ChatDrawerProps) {
  const [chatId, setChatId] = useState<string | undefined>(initialChatId);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [isMeetupOpen, setIsMeetupOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or fetch conversation
  useEffect(() => {
    if (!isOpen) return;

    if (recipientUser && !chatId) {
      api.post('/chats/create', { recipientId: recipientUser.id })
        .then(res => {
          if (res.data.chat?.id) {
            setChatId(res.data.chat.id);
          }
        })
        .catch(err => console.error('Failed to create chat:', err));
    }
  }, [isOpen, recipientUser, chatId]);

  // Connect Socket.io and fetch message history
  useEffect(() => {
    if (!chatId || !isOpen) return;

    socket.connect();
    socket.emit('register_user', currentUser?.id);
    socket.emit('join_chat', chatId);

    api.get(`/chats/messages/${chatId}`)
      .then(res => {
        if (res.data.messages) {
          setMessages(res.data.messages);
        }
      })
      .catch(err => console.error('Fetch messages error:', err));

    const handleNewMessage = (msg: any) => {
      setMessages(prev => [...prev, msg]);
    };

    const handleTyping = (data: any) => {
      if (data.chatId === chatId && data.userId !== currentUser?.id) {
        setIsTyping(data.isTyping);
      }
    };

    socket.on('message_received', handleNewMessage);
    socket.on('typing_status', handleTyping);

    return () => {
      socket.off('message_received', handleNewMessage);
      socket.off('typing_status', handleTyping);
    };
  }, [chatId, isOpen, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !chatId) return;

    const textToSend = inputText;
    setInputText('');

    try {
      const { data } = await api.post('/chats/send', {
        chatId,
        text: textToSend
      });

      if (data.message) {
        setMessages(prev => [...prev, data.message]);
        socket.emit('send_message', { chatId, senderId: currentUser?.id, ...data.message });
      }
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  const handleSendOffer = (amount: number, note?: string) => {
    const offerMsg = `💰 PRICE OFFER PROPOSED: ₹${amount.toLocaleString('en-IN')}${note ? `\nNote: ${note}` : ''}`;
    setInputText(offerMsg);
    handleSendMessage();
  };

  const handleSendMeetup = (location: string, time: string) => {
    const meetupMsg = `📍 ON-CAMPUS MEETUP PROPOSED:\nLocation: ${location}\nTime: ${time}`;
    setInputText(meetupMsg);
    handleSendMessage();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-white/10 flex flex-col h-full shadow-2xl">
        
        {/* Chat Drawer Header */}
        <div className="p-4 glass-panel border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={recipientUser?.name} src={recipientUser?.avatar} isVerified={true} size="sm" />
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1">
                {recipientUser?.name || 'Verified Student'}
              </h3>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
              </span>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Optional Product Reference Context Header */}
        {productContext && (
          <div className="p-3 bg-indigo-950/40 border-b border-indigo-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <img src={productContext.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
              <div>
                <span className="font-bold text-slate-200 block line-clamp-1">{productContext.title}</span>
                <span className="text-emerald-400 font-extrabold">₹{productContext.price}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsOfferOpen(true)}>
              Make Offer
            </Button>
          </div>
        )}

        {/* Message History Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUser?.id || msg.sender?.id === currentUser?.id;
            return (
              <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-line ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'glass-panel border border-white/10 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-70">
                    <span>{new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && <CheckCheck className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="text-[10px] text-slate-400 animate-pulse italic">
              {recipientUser?.name || 'Student'} is typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Action Toolbar */}
        <div className="p-2 border-t border-white/5 bg-slate-950/60 flex items-center justify-around text-xs">
          <button
            onClick={() => setIsOfferOpen(true)}
            className="flex items-center gap-1 text-slate-300 hover:text-indigo-400 font-semibold"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Offer
          </button>
          <button
            onClick={() => setIsMeetupOpen(true)}
            className="flex items-center gap-1 text-slate-300 hover:text-indigo-400 font-semibold"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Meetup
          </button>
        </div>

        {/* Input Composer */}
        <form onSubmit={handleSendMessage} className="p-3 glass-panel border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              socket.emit('typing', { chatId, userId: currentUser?.id, isTyping: true });
            }}
            placeholder="Type a message..."
            className="w-full glass-input text-xs rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
          />
          <Button type="submit" variant="primary" size="sm" disabled={!inputText.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>

      </div>

      <OfferModal
        isOpen={isOfferOpen}
        onClose={() => setIsOfferOpen(false)}
        productTitle={productContext?.title || 'Listing Item'}
        originalPrice={productContext?.price || 1000}
        onSubmitOffer={handleSendOffer}
      />

      <MeetupModal
        isOpen={isMeetupOpen}
        onClose={() => setIsMeetupOpen(false)}
        onSubmitMeetup={handleSendMeetup}
      />
    </div>
  );
}
