import { useEffect, useState } from 'react';
import { ArrowRight, Star, MapPin, Clock, MessageCircle, GraduationCap, Award, Heart, Users, FileText, Video, BookOpen, Send, Phone, BadgeCheck, PenLine } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { supabase, type Doctor, type Question, type SpecialistPost, type PostComment, type Article, type DoctorAudio } from '@/lib/supabase';
import QuestionCard from '@/components/QuestionCard';

type Tab = 'posts' | 'reels' | 'diary' | 'articles' | 'audio';

export default function DoctorProfilePage({ id }: { id: string }) {
  const { navigate } = useRouter();
  const { t, specialtyName, lang } = useI18n();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [posts, setPosts] = useState<SpecialistPost[]>([]);
  const [diary, setDiary] = useState<{ id: string; title: string | null; body: string; created_at: string }[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [audios, setAudios] = useState<DoctorAudio[]>([]);
  const [comments, setComments] = useState<Record<string, PostComment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: doc } = await supabase.from('doctors').select('*, specialty(*)').eq('id', id).maybeSingle();
      if (doc) {
        setDoctor(doc);
        const { data: ans } = await supabase.from('answers').select('question_id').eq('doctor_id', id);
        if (ans && ans.length > 0) {
          const qIds = ans.map((a) => a.question_id);
          const { data: qs } = await supabase.from('questions').select('*, specialty(*), answers(*)').in('id', qIds).order('created_at', { ascending: false });
          setQuestions(qs || []);
        }
        const { data: p } = await supabase.from('specialist_posts').select('*').eq('doctor_id', id).order('created_at', { ascending: false }).limit(20);
        setPosts(p || []);
        const { data: d } = await supabase.from('specialist_diary').select('id, title, body, created_at').eq('doctor_id', id).eq('is_public', true).order('created_at', { ascending: false }).limit(10);
        setDiary(d || []);
        const { data: arts } = await supabase.from('articles').select('*, specialty(*)').eq('doctor_id', id).order('created_at', { ascending: false }).limit(10);
        setArticles(arts || []);
        const { data: aud } = await supabase.from('doctor_audio').select('*, specialty(*)').eq('doctor_id', id).order('created_at', { ascending: false }).limit(10);
        setAudios(aud || []);
        if (p && p.length > 0) {
          const pIds = p.map((x) => x.id);
          const { data: cs } = await supabase.from('post_comments').select('*').in('post_id', pIds).order('created_at');
          const cMap: Record<string, PostComment[]> = {};
          (cs || []).forEach((c) => { (cMap[c.post_id] = cMap[c.post_id] || []).push(c); });
          setComments(cMap);
        }
      }
      setLoading(false);
    })();
  }, [id]);

  const handleLike = (postId: string) => {
    setLikedPosts((prev) => { const n = new Set(prev); if (n.has(postId)) n.delete(postId); else n.add(postId); return n; });
  };

  const handleComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    const name = localStorage.getItem('chat_name') || 'مستخدم';
    const { data } = await supabase.from('post_comments').insert({ post_id: postId, author_name: name, body: text }).select().single();
    if (data) {
      setComments((prev) => ({ ...prev, [postId]: [...(prev[postId] || []), data] }));
    }
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleFollow = () => {
    setIsFollowing((prev) => !prev);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 animate-pulse">
          <div className="h-6 bg-gray-100 rounded w-32 mb-6" />
          <div className="card p-8"><div className="flex gap-6"><div className="w-32 h-32 rounded-2xl bg-gray-100" /><div className="flex-1"><div className="h-8 bg-gray-100 rounded w-48 mb-3" /><div className="h-5 bg-gray-100 rounded w-32 mb-3" /></div></div></div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">{t('common.not_found')}</p>
          <button onClick={() => navigate('/doctors')} className="btn-primary">{t('common.back')}</button>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof FileText }[] = [
    { key: 'posts', label: t('profile.posts'), icon: FileText },
    { key: 'reels', label: t('profile.reels'), icon: Video },
    { key: 'diary', label: t('profile.diary'), icon: PenLine },
    { key: 'articles', label: t('profile.articles'), icon: BookOpen },
    { key: 'audio', label: t('profile.audio'), icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate('/doctors')} className="flex items-center gap-2 text-gray-500 hover:text-teal-600 transition-colors mb-4 mt-4">
          <ArrowRight className="w-4 h-4" />
          {t('common.back')}
        </button>

        {/* Cover + Profile Header */}
        <div className="card overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-l from-teal-500 via-teal-600 to-teal-700" />
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row gap-4 -mt-12">
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center shrink-0 ring-4 ring-white mx-auto md:mx-0">
                {!imgError && doctor.photo_url ? (
                  <img src={doctor.photo_url} alt={doctor.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
                ) : (
                  <span className="text-4xl font-bold text-teal-600">{doctor.name.replace('د. ', '').charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 text-center md:text-right pt-2">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h1 className="text-xl font-bold text-gray-800">{doctor.name}</h1>
                  {doctor.is_verified && <BadgeCheck className="w-5 h-5 text-teal-500" />}
                </div>
                {doctor.specialty && <p className="text-teal-600 font-medium text-sm">{specialtyName(doctor.specialty)}</p>}
                <div className="flex flex-wrap justify-center md:justify-start gap-3 text-xs text-gray-500 mt-2">
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />{Number(doctor.rating).toFixed(1)}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-teal-500" />{doctor.city}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-teal-500" />{doctor.experience_years} {lang === 'ar' ? 'سنوات' : ''}</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-teal-500" />{doctor.follower_count || 0} {t('profile.followers')}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 justify-center">
                <button onClick={handleFollow} className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${isFollowing ? 'bg-gray-100 text-gray-600' : 'bg-teal-600 text-white hover:bg-teal-700'}`}>
                  {isFollowing ? t('profile.following') : t('profile.follow')}
                </button>
                {doctor.phone_number && (
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400">{t('profile.share_phone')}</p>
                    <p className="text-xs font-medium text-gray-600 flex items-center justify-center gap-1"><Phone className="w-3 h-3" />{doctor.phone_number}</p>
                  </div>
                )}
              </div>
            </div>
            {doctor.bio && <p className="text-sm text-gray-600 mt-4 leading-relaxed">{doctor.bio}</p>}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-100 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${activeTab === tab.key ? 'text-teal-600 border-teal-600' : 'text-gray-500 border-transparent hover:text-teal-600'}`}>
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-sm">{doctor.name.charAt(0)}</div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{doctor.name}</p>
                    <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3">{post.body}</p>
                {post.image_url && <img src={post.image_url} alt="" className="w-full rounded-xl mb-3 max-h-96 object-cover" />}
                {post.video_url && <video src={post.video_url} controls className="w-full rounded-xl mb-3" />}
                <div className="flex items-center gap-4 text-sm text-gray-500 pb-3 border-b border-gray-50">
                  <button onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 hover:text-rose-500 transition-colors">
                    <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    {(post.likes_count || 0) + (likedPosts.has(post.id) ? 1 : 0)}
                  </button>
                  <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4" />{(comments[post.id] || []).length}</span>
                </div>
                <div className="space-y-2 mt-3">
                  {(comments[post.id] || []).map((c) => (
                    <div key={c.id} className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">{c.author_name.charAt(0)}</div>
                      <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
                        <p className="text-xs font-semibold text-gray-700">{c.author_name}</p>
                        <p className="text-sm text-gray-600">{c.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={commentInputs[post.id] || ''}
                    onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                    placeholder={t('profile.comment_placeholder')}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm"
                  />
                  <button onClick={() => handleComment(post.id)} className="bg-teal-600 text-white p-2 rounded-xl"><Send className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {posts.length === 0 && <p className="text-center text-gray-400 py-8">{t('common.loading')}</p>}
          </div>
        )}

        {activeTab === 'reels' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {posts.filter((p) => p.video_url).map((p) => (
              <div key={p.id} className="card overflow-hidden">
                <video src={p.video_url || undefined} controls className="w-full aspect-[9/16] object-cover" />
                <div className="p-3"><p className="text-xs text-gray-600 line-clamp-2">{p.body}</p></div>
              </div>
            ))}
            {posts.filter((p) => p.video_url).length === 0 && <p className="text-center text-gray-400 py-8 col-span-full">{t('common.loading')}</p>}
          </div>
        )}

        {activeTab === 'diary' && (
          <div className="space-y-4">
            {diary.map((d) => (
              <div key={d.id} className="card p-5">
                {d.title && <h3 className="font-bold text-gray-800 mb-2">{d.title}</h3>}
                <p className="text-sm text-gray-600 leading-relaxed">{d.body}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(d.created_at).toLocaleDateString()}</p>
              </div>
            ))}
            {diary.length === 0 && <p className="text-center text-gray-400 py-8">{t('common.loading')}</p>}
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((a) => (
              <div key={a.id} className="card p-5 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate(`/articles/${a.id}`)}>
                {a.image_url && <img src={a.image_url} alt="" className="w-full h-32 rounded-xl object-cover mb-3" />}
                <h3 className="font-bold text-gray-800 text-sm mb-1">{a.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{a.excerpt}</p>
              </div>
            ))}
            {articles.length === 0 && <p className="text-center text-gray-400 py-8 col-span-full">{t('common.loading')}</p>}
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="space-y-3">
            {audios.map((a) => (
              <div key={a.id} className="card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center"><MessageCircle className="w-5 h-5 text-teal-600" /></div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-800">{a.title}</p>
                  <p className="text-xs text-gray-400">{a.duration_seconds} {t('common.minutes')}</p>
                </div>
                {a.audio_url && <audio src={a.audio_url} controls className="h-8" />}
              </div>
            ))}
            {audios.length === 0 && <p className="text-center text-gray-400 py-8">{t('common.loading')}</p>}
          </div>
        )}

        {/* CTA */}
        <div className="card p-6 mt-6 bg-gradient-to-l from-teal-50 to-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-bold text-gray-800 mb-1">{lang === 'ar' ? 'لديك سؤال لهذا الأخصائي؟' : 'Have a question?'}</h3>
              <p className="text-gray-500 text-sm">{lang === 'ar' ? 'اطرح سؤالك واحصل على إجابة احترافية' : 'Ask and get a professional answer'}</p>
            </div>
            <button onClick={() => navigate(`/ask?specialty=${doctor.specialty?.slug || ''}`)} className="btn-primary flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {t('hero.ask_now')}
            </button>
          </div>
        </div>

        {questions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{lang === 'ar' ? 'الأسئلة المجابة' : 'Answered Questions'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {questions.map((q) => <QuestionCard key={q.id} question={q} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
