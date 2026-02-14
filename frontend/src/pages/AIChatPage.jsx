import React, { useState, useEffect, useRef } from 'react';
import Sidebar from "../components/Sidebar";
import { Bot, SendIcon, Sparkles } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

function AIChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am Nids AI. I've been trained to assist you with everything from coding to philosophical debates. How can I help you today?",
      createdAt: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Convert messages to history format expected by backend
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await axiosInstance.post('/ai/chat', {
        message: userMessage.content,
        history: history.slice(-10) // Keep last 10 messages for context
      });

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.message,
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Chat error:', error);
      toast.error("Failed to get response from Nids AI");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex bg-[#121212] overflow-hidden transition-colors duration-300">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex bg-white dark:bg-[#0b0b0f] rounded-none md:rounded-[42px] overflow-hidden shadow-2xl relative z-10 m-0 md:m-2 border-0 md:border md:border-white/5 h-screen md:h-[calc(100vh-1rem)] pt-16 md:pt-0">
        
        {/* Chat Container */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-[#121212] w-full min-h-0 relative">
             {/* Background */}
             <div 
                className="absolute inset-0 z-0 opacity-10"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
             />

             {/* Header */}
             <div className="flex items-center justify-between bg-white/80 dark:bg-[rgba(12,12,18,0.7)] backdrop-blur-md m-4 rounded-[24px] shadow-sm border border-gray-200/50 dark:border-[rgba(255,255,255,0.08)] px-6 py-4 z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Bot className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                           Nids AI
                           <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-xs font-semibold">BETA</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Always here to help</p>
                    </div>
                </div>
             </div>

             {/* Messages */}
             <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar z-10">
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                        <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                    <Sparkles className="w-4 h-4 text-indigo-500" />
                                </div>
                            )}
                            
                            <div className={`relative px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                                msg.role === 'user' 
                                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                                    : 'bg-white dark:bg-[#1e1e24] text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-[#2a2a34] rounded-tl-none'
                            }`}>
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                                <div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300 ml-11">
                        <div className="bg-white dark:bg-[#1e1e24] border border-gray-100 dark:border-[#2a2a34] px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                
                <div ref={scrollRef} />
             </div>

             {/* Input Area */}
             <div className="p-4 pb-6 z-10">
                <form 
                    onSubmit={handleSendMessage}
                    className="max-w-4xl mx-auto flex items-center gap-2 bg-white dark:bg-[#1a1a20] border border-gray-200 dark:border-[rgba(255,255,255,0.08)] rounded-full px-2 py-2 shadow-lg dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-all duration-300 hover:shadow-xl"
                >
                    <div className="pl-4 pr-2">
                        <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                    </div>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask Nids AI anything..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-[16px] py-2"
                        disabled={isLoading}
                    />

                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-3 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                    >
                        <SendIcon className="w-5 h-5 ml-0.5" />
                    </button>
                </form>
             </div>
        </div>
      </div>
    </div>
  );
}

export default AIChatPage;