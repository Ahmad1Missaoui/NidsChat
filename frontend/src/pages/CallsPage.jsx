import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useCallStore } from '../store/useCallStore';
import { useAuthStore } from '../store/useAuthStore';
import Sidebar from '../components/Sidebar';
import { 
  ArrowLeft, Video, Phone, PhoneMissed, PhoneIncoming, 
  PhoneOutgoing, Search, Filter, Trash2, Clock
} from 'lucide-react';

function CallsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { calls, getCallHistory, deleteCall, initiateCall } = useCallStore();
  const { authUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, missed, incoming, outgoing

  useEffect(() => {
    getCallHistory();
  }, [getCallHistory]);

  const filteredCalls = calls.filter(call => {
    const matchesSearch = call.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || call.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleCall = (userId, isVideo = false) => {
    initiateCall(userId, isVideo);
  };

  const formatCallDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCallTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return t('calls.yesterday');
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getCallIcon = (type) => {
    switch(type) {
      case 'missed':
        return <PhoneMissed className="size-5 text-red-500" />;
      case 'incoming':
        return <PhoneIncoming className="size-5 text-green-500" />;
      case 'outgoing':
        return <PhoneOutgoing className="size-5 text-blue-500" />;
      default:
        return <Phone className="size-5" />;
    }
  };

  return (
    <div className="h-screen w-screen flex bg-[#121212] overflow-hidden transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-white dark:bg-[#0b0b0f] rounded-none md:rounded-l-[40px] overflow-hidden shadow-2xl relative z-10 my-0 mr-0 border-0 md:border-l md:border-white/5 h-full pt-16 md:pt-0">
        {/* Header */}
        <div className="h-auto md:h-20 border-b border-gray-100 dark:border-[rgba(255,255,255,0.05)] bg-white dark:bg-[#0b0b0f] px-4 md:px-8 py-4 md:py-0 flex items-center gap-4 flex-shrink-0">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{t('calls.title')}</h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">{t('calls.subtitle')}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="px-4 md:px-8 py-4 md:py-6 bg-white dark:bg-[#0b0b0f] flex-shrink-0">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
              <input
                type="text"
                placeholder={t('calls.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 dark:bg-[#18181b] border-none rounded-2xl py-3 pl-12 pr-4 text-gray-900 dark:text-gray-100 placeholder-gray-500 text-[15px] focus:ring-1 focus:ring-amber-400/50 transition-all outline-none"
              />
            </div>
            
            <div className="flex gap-2 bg-gray-100 dark:bg-[#18181b] p-1.5 rounded-2xl w-full md:w-fit overflow-x-auto">
              {['all', 'missed', 'incoming', 'outgoing'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all capitalize whitespace-nowrap ${
                    filterType === type
                      ? 'bg-white dark:bg-[#2a2a2a] text-amber-600 dark:text-[#facc15] shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {t(`calls.filter_${type}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calls List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-[#0b0b0f] px-4 md:px-8 pb-8">
          {filteredCalls.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 opacity-60">
              <div className="w-20 h-20 bg-gray-100 dark:bg-[#18181b] rounded-full flex items-center justify-center mb-6">
                <Phone className="size-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('calls.no_calls')}</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                {searchQuery || filterType !== 'all' ? t('calls.no_calls_adjust') : t('calls.no_calls_start')}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredCalls.map((call) => (
                 <div 
                    key={call._id}
                    className="flex items-center justify-between p-4 bg-white dark:bg-[#18181b] rounded-2xl border border-gray-100 dark:border-[rgba(255,255,255,0.05)] hover:border-amber-400/30 transition-all group"
                 >
                    <div className="flex items-center gap-4">
                       <div className="relative">
                          <div className="size-12 rounded-full overflow-hidden border border-gray-100 dark:border-[rgba(255,255,255,0.1)]">
                            <img 
                              src={call.profilePic || "/avatar.png"} 
                              alt={call.name} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#18181b] rounded-full p-0.5">
                             {getCallIcon(call.type)}
                          </div>
                       </div>
                       
                       <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{call.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                             <Clock className="size-3" />
                             <span>{formatCallTime(call.timestamp)}</span>
                             <span>•</span>
                             <span>{formatCallDuration(call.duration)}</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleCall(call.userId, false)}
                          className="p-2 bg-gray-100 dark:bg-[#27272a] hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 rounded-xl transition-colors"
                          title={t('calls.voice_call')}
                        >
                           <Phone className="size-5" />
                        </button>
                         <button 
                          onClick={() => handleCall(call.userId, true)}
                          className="p-2 bg-gray-100 dark:bg-[#27272a] hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors"
                          title={t('calls.video_call')}
                        >
                           <Video className="size-5" />
                        </button>
                        <button 
                          onClick={() => deleteCall(call._id)}
                          className="p-2 bg-gray-100 dark:bg-[#27272a] hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-colors"
                          title={t('calls.delete_log')}
                        >
                           <Trash2 className="size-5" />
                        </button>
                    </div>
                 </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CallsPage;
