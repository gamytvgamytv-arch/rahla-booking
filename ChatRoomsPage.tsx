import { useEffect, useState, useRef } from 'react';
import { MessageSquare, Send, Users } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useRouter, parseQuery, getPathOnly } from '@/lib/router';
import { supabase, type SpecialtyChatRoom, type ChatRoomMessage, type Specialty } from '@/lib/supabase';

export default function ChatRoomsPage() {
  const { t, specialtyName } = useI18n();
  const { path, navigate } = useRouter();
  const query = parseQuery(path);
  const route = getPathOnly(path);
  const activeRoomId = route.startsWith('/chat/') ? route.split('/')[2] : query.room;

  const [rooms, setRooms] = useState<(SpecialtyChatRoom & { specialty?: Specialty })[]>([]);
  const [messages, setMessages] = useState<ChatRoomMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState(() => localStorage.getItem('chat_name') || '');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from('specialty_chat_rooms').select('*, specialty(*)').order('created_at').then(({ data }) => {
      setRooms(data || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (activeRoomId) {
      supabase.from('chat_room_messages').select('*').eq('room_id', activeRoomId).order('created_at').limit(50).then(({ data }) => {
        setMessages(data || []);
      });
    }
  }, [activeRoomId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeRoomId) return;
    if (!userName) { setShowNamePrompt(true); return; }
    const msg = input.trim();
    setInput('');
    await supabase.from('chat_room_messages').insert({
      room_id: activeRoomId,
      sender_name: userName,
      sender_type: 'user',
      body: msg,
    });
    setMessages((prev) => [...prev, { id: Date.now().toString(), room_id: activeRoomId, sender_name: userName, sender_type: 'user', body: msg, is_flagged: false, created_at: new Date().toISOString() }]);
  };

  if (loading) {
    return <div className="min-h-screen pt-24 pb-16 flex items-center justify-center"><div className="animate-pulse text-gray-400">{t('common.loading')}</div></div>;
  }

  if (activeRoomId) {
    const room = rooms.find((r) => r.id === activeRoomId);
    return (
      <div className="min-h-screen pt-20 pb-4 flex flex-col" style={{ height: 'calc(100vh - 5rem)' }}>
        <div className="max-w-4xl mx-auto w-full px-4 flex flex-col flex-1">
          <div className="card flex items-center justify-between p-4 mb-3">
            <div>
              <h2 className="font-bold text-gray-800">{room?.name || t('chat.title')}</h2>
              <p className="text-xs text-gray-400">{room?.specialty ? specialtyName(room.specialty) : ''}</p>
            </div>
            <button onClick={() => navigate('/chat')} className="text-sm text-teal-600 hover:text-teal-700">{t('common.back')}</button>
          </div>
          <div ref={scrollRef} className="card flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 && <p className="text-center text-gray-400 text-sm py-8">{t('chat.placeholder')}</p>}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender_name === userName ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${msg.sender_name === userName ? 'bg-teal-600 text-white' : 'bg-white text-gray-700 border border-gray-100'}`}>
                  {msg.sender_name !== userName && <p className="text-xs font-semibold text-teal-600 mb-0.5">{msg.sender_name}</p>}
                  <p className="text-sm">{msg.body}</p>
                  <p className={`text-[10px] mt-1 ${msg.sender_name === userName ? 'text-teal-100' : 'text-gray-400'}`}>{new Date(msg.created_at).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="card p-3 mt-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('chat.placeholder')}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm"
            />
            <button onClick={handleSend} className="bg-teal-600 hover:bg-teal-700 text-white p-2.5 rounded-xl">
              <Send className="w-5 h-5" />
            </button>
          </div>
          {showNamePrompt && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowNamePrompt(false)}>
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
                <h3 className="font-bold text-gray-800 mb-3">{t('register.name')}</h3>
                <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="input-field mb-3" />
                <button onClick={() => { localStorage.setItem('chat_name', userName); setShowNamePrompt(false); }} className="btn-primary w-full">{t('chat.send')}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('chat.title')}</h1>
        <p className="text-gray-500 mb-6">{t('chat.subtitle')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((room) => (
            <button key={room.id} onClick={() => navigate(`/chat/${room.id}`)} className="card p-5 text-right hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6 text-teal-600" />
                </div>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Users className="w-3.5 h-3.5" />
                  {room.member_count} {t('chat.members')}
                </span>
              </div>
              <h3 className="font-bold text-gray-800">{room.name}</h3>
              <p className="text-sm text-gray-500">{room.specialty ? specialtyName(room.specialty) : ''}</p>
              {room.description && <p className="text-xs text-gray-400 mt-1">{room.description}</p>}
            </button>
          ))}
          {rooms.length === 0 && <p className="text-center text-gray-400 py-8 col-span-2">{t('common.loading')}</p>}
        </div>
      </div>
    </div>
  );
}
