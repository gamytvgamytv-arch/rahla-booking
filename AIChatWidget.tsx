import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

type Message = { role: 'user' | 'ai'; text: string };

export default function AIChatWidget() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'ai', text: t('ai.welcome') }]);
    }
  }, [open, messages.length, t]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const getAIResponse = (userText: string): string => {
    const lower = userText.toLowerCase();
    const contactPatterns = /(\+?\d{7,}|www\.|http|@[a-zA-Z0-9]+\.[a-zA-Z]{2,}|facebook|whatsapp|telegram|viber|skype|instagram|snapchat)/i;
    const religionPatterns = /(الله|إله|دين|محمد|سياسة|رئيس|حزب|politics|religion|jesus)/i;

    if (contactPatterns.test(userText)) {
      return 'عذراً، يمنع تبادل وسائل التواصل أو أرقام الهواتف وفقاً لقواعد الموقع. تم إرسال إشعار للإدارة.';
    }
    if (religionPatterns.test(userText)) {
      return 'عذراً، يمنع النقاش في الدين أو السياسة وفقاً لقواعد الموقع. يرجى الالتزام بالمواضيع الطبية.';
    }

    if (lower.includes('طبيب') || lower.includes('doctor') || lower.includes('استشار')) {
      return 'يمكنك تصفح دليل الأطباء من صفحة "الأطباء" والبحث حسب التخصص والمدينة. كما يمكنك حجز جلسة فيديو أو نصية مجانية من صفحة "الجلسات".';
    }
    if (lower.includes('دورة') || lower.includes('course') || lower.includes('كورس')) {
      return 'نقدم دورات تدريبية احترافية في مختلف التخصصات الطبية. تفضل بزيارة صفحة "الدورات" للاطلاع على الكورسات المتاحة والتسجيل.';
    }
    if (lower.includes('فيديو') || lower.includes('video')) {
      return 'يمكنك مشاهدة الفيديوهات الطبية من صفحة "الفيديوهات"، أو حجز جلسة فيديو مباشرة مع طبيب من صفحة "الجلسات".';
    }
    if (lower.includes('سعر') || lower.includes('price') || lower.includes('تكلفة')) {
      return 'الاستشارات النصية المحدودة مجانية. جلسات الفيديو تبدأ من $25. أسعار الدورات التدريبية تختلف حسب الدورة.';
    }
    if (lower.includes('مرض') || lower.includes('علاج') || lower.includes('ألم') || lower.includes('symptom')) {
      return 'للحصول على استشارة طبية موثوقة، يرجى طرح سؤالك في صفحة "اسأل طبيباً" أو بدء جلسة نصية مجانية. تذكر أن هذه الاستشارة لا تغني عن الفحص المباشر.';
    }
    if (lower.includes('مرحبا') || lower.includes('hello') || lower.includes('hi') || lower.includes('سلام')) {
      return 'مرحباً بك في منصة سهله وبسيطه! يمكنني مساعدتك في البحث عن أطباء، حجز جلسات، التسجيل في دورات، والإجابة على أسئلتك العامة. كيف يمكنني مساعدتك؟';
    }
    return 'شكراً لسؤالك. يمكنني مساعدتك في: البحث عن أطباء، حجز جلسات استشارية، التسجيل في دورات تدريبية، أو الإجابة على الأسئلة العامة. للحالات الطبية المحددة، يرجى استخدام خدمة "اسأل طبيباً".';
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      const response = getAIResponse(userMsg);
      setMessages((prev) => [...prev, { role: 'ai', text: response }]);
      setThinking(false);
    }, 1000);
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center group"
        >
          <Bot className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 left-6 z-40 w-[360px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col animate-scale-in" style={{ height: '500px', maxHeight: 'calc(100vh - 3rem)' }}>
          {/* Header */}
          <div className="bg-gradient-to-l from-teal-600 to-teal-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">{t('ai.assistant')}</h3>
                <span className="text-xs text-teal-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  متصل
                </span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${msg.role === 'user' ? 'bg-teal-600 text-white' : 'bg-white text-gray-700 border border-gray-100 shadow-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-end">
                <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('ai.placeholder')}
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
              />
              <button onClick={handleSend} className="bg-teal-600 hover:bg-teal-700 text-white p-2.5 rounded-xl transition-all">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
