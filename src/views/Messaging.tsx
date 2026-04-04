'use client'

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, ArrowLeft, User } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useMessaging, type Message, type Conversation } from '../hooks/useMessaging';
import { Button } from '../components/ui/Button';

function timeLabel(date: string): string {
    const d = new Date(date);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) + ' ' +
        d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

interface ChatViewProps {
    conversation: Conversation;
    onBack: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ conversation, onBack }) => {
    const { user } = useAuth();
    const { messages, sendMessage, loadingMsgs, markAsRead } = useMessaging(conversation.id);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Reset input when switching conversations
    useEffect(() => {
        setInput('');
    }, [conversation.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const lastMarkedMessageId = useRef<string | null>(null);
    useEffect(() => {
        const unreadMessages = messages.filter(m => !m.read_at && m.sender_id !== user?.id);
        if (unreadMessages.length > 0) {
            const latestId = unreadMessages[unreadMessages.length - 1].id;
            if (latestId !== lastMarkedMessageId.current) {
                lastMarkedMessageId.current = latestId;
                markAsRead.mutate(conversation.id);
            }
        }
    }, [messages, conversation.id, markAsRead, user?.id]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text) return;
        
        try {
            await sendMessage.mutateAsync({ content: text });
            setInput(''); // Clear input only if success
        } catch (err: any) {
            console.error(err);
            alert(`Erreur d'envoi: ${err.message || JSON.stringify(err)}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Chat header */}
            <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-white">
                <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-slate-100 md:hidden">
                    <ArrowLeft size={18} className="text-slate-600" />
                </button>
                <div className="w-9 h-9 bg-brand-blue/10 rounded-full flex items-center justify-center">
                    <User size={16} className="text-brand-blue" />
                </div>
                <div>
                    <p className="font-semibold text-slate-900 text-sm">
                        {conversation.other_user_name || 'Conversation'}
                    </p>
                    <p className="text-xs text-slate-400">{conversation.job_title || (conversation.job_id ? `Mission · ${conversation.job_id.slice(0, 8)}` : 'Discussion générale')}</p>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {loadingMsgs ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <MessageCircle className="mx-auto text-slate-200 mb-2" size={36} />
                            <p className="text-sm text-slate-400">Démarrez la conversation</p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg: Message, i: number) => {
                        const isMe = msg.sender_id === user?.id;
                        const showTime = i === 0 ||
                            new Date(msg.created_at).getTime() - new Date(messages[i - 1].created_at).getTime() > 5 * 60 * 1000;

                        return (
                            <div key={msg.id}>
                                {showTime && (
                                    <div className="text-center">
                                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                            {timeLabel(msg.created_at)}
                                        </span>
                                    </div>
                                )}
                                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                        isMe
                                            ? 'bg-brand-blue text-white rounded-br-sm'
                                            : 'bg-white text-slate-800 shadow-sm rounded-bl-sm border border-slate-100'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-100 bg-white">
                <div className="flex items-end gap-2">
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Écrire un message… (Entrée pour envoyer)"
                        rows={1}
                        className="flex-1 resize-none px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 max-h-28"
                        style={{ height: 'auto' }}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        isLoading={sendMessage.isPending}
                        className="p-2.5 min-w-0 h-auto rounded-xl shadow-none"
                    >
                        <Send size={17} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const MessagingPage: React.FC = () => {
    const { user } = useAuth();
    const { conversations, loadingConvos } = useMessaging();
    const [selected, setSelected] = useState<Conversation | null>(null);
    const [searchParams] = useSearchParams();
    const conversationIdFromUrl = searchParams.get('id');

    useEffect(() => {
        if (conversationIdFromUrl && conversations.length > 0) {
            const conv = conversations.find(c => c.id === conversationIdFromUrl);
            if (conv) {
                setSelected(conv);
            }
        }
    }, [conversationIdFromUrl, conversations]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-500">Vous devez être connecté pour accéder à la messagerie.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container max-w-5xl py-6">
                <h1 className="text-2xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                    <MessageCircle size={24} className="text-brand-blue" />
                    Messagerie
                </h1>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" style={{ height: '70vh' }}>
                    <div className="flex h-full">
                        {/* Conversation list */}
                        <div className={`w-full md:w-72 border-r border-slate-100 flex flex-col ${selected ? 'hidden md:flex' : 'flex'}`}>
                            <div className="p-3 border-b border-slate-100">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                    Conversations
                                </p>
                            </div>

                            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                                {loadingConvos ? (
                                    <div className="flex items-center justify-center py-10">
                                        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-brand-blue" />
                                    </div>
                                ) : conversations.length === 0 ? (
                                    <div className="text-center py-12 px-4">
                                        <MessageCircle className="mx-auto text-slate-200 mb-2" size={32} />
                                        <p className="text-sm text-slate-400">Aucune conversation</p>
                                        <p className="text-xs text-slate-300 mt-1">
                                            {user && conversations.length === 0 
                                                ? 'Les professionnels vous contacteront ici une fois votre mission publiée'
                                                : 'Débloquez un lead pour démarrer une discussion'}
                                        </p>
                                    </div>
                                ) : (
                                    conversations.map(conv => {
                                        const isSelected = selected?.id === conv.id;
                                        const isMe = conv.client_id === user.id;
                                        return (
                                            <button
                                                key={conv.id}
                                                onClick={() => setSelected(conv)}
                                                className={`w-full text-left flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors ${isSelected ? 'bg-brand-blue/5 border-r-2 border-brand-blue' : ''}`}
                                            >
                                                <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                                                    <User size={16} className="text-slate-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-900 truncate">
                                                        {conv.other_user_name || (isMe ? 'Pro' : 'Client')}
                                                    </p>
                                                    <p className="text-xs text-slate-400 truncate mt-0.5">
                                                        {conv.job_title || (conv.job_id ? `Mission · ${conv.job_id.slice(0, 8)}…` : 'Discussion générale')}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Chat view */}
                        <div className={`flex-1 flex flex-col ${!selected ? 'hidden md:flex' : 'flex'}`}>
                            {selected ? (
                                <ChatView conversation={selected} onBack={() => setSelected(null)} />
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <MessageCircle className="mx-auto text-slate-200 mb-3" size={48} />
                                        <p className="text-slate-500">Sélectionnez une conversation</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
