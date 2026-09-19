import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Bell,
  MessageSquare,
  ThumbsUp,
  BadgeCheck,
  CalendarClock,
  Mail,
  CheckCheck,
  X,
} from 'lucide-react';
import { useApp } from '@/i18n/AppContext';

type NotificationType = 'doctorAnswered' | 'questionVoted' | 'doctorVerified' | 'appointmentReminder' | 'newMessage';

interface AppNotification {
  id: string;
  type: NotificationType;
  text: string;
  createdAt: number; // epoch ms
  read: boolean;
}

function timeAgo(ts: number, t: ReturnType<typeof useApp>['t']): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(diff / 3600000);
  const day = Math.floor(diff / 86400000);
  if (min < 1) return t.notifications.justNow;
  if (min < 60) return t.notifications.minutesAgo.replace('{n}', String(min));
  if (hr < 24) return t.notifications.hoursAgo.replace('{n}', String(hr));
  return t.notifications.daysAgo.replace('{n}', String(day));
}

const TYPE_CONFIG: Record<NotificationType, { icon: typeof MessageSquare; bg: string; text: string; ring: string }> = {
  doctorAnswered: { icon: MessageSquare, bg: 'bg-primary-100', text: 'text-primary-700', ring: 'ring-primary-200' },
  questionVoted: { icon: ThumbsUp, bg: 'bg-accent-100', text: 'text-accent-700', ring: 'ring-accent-200' },
  doctorVerified: { icon: BadgeCheck, bg: 'bg-primary-100', text: 'text-primary-700', ring: 'ring-primary-200' },
  appointmentReminder: { icon: CalendarClock, bg: 'bg-secondary-100', text: 'text-secondary-700', ring: 'ring-secondary-200' },
  newMessage: { icon: Mail, bg: 'bg-primary-100', text: 'text-primary-700', ring: 'ring-primary-200' },
};

function buildDemoNotifications(t: ReturnType<typeof useApp>['t']): AppNotification[] {
  const now = Date.now();
  const items: Array<[NotificationType, number]> = [
    ['doctorAnswered', now - 5 * 60000],
    ['questionVoted', now - 23 * 60000],
    ['doctorVerified', now - 2 * 3600000],
    ['appointmentReminder', now - 6 * 3600000],
    ['newMessage', now - 26 * 3600000],
  ];
  return items.map(([type, createdAt], i) => ({
    id: `n${i}`,
    type,
    text: t.notifications[type],
    createdAt,
    read: i >= 3,
  }));
}

export function NotificationsPopover() {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifications(buildDemoNotifications(t));
  }, [t]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-neutral-700 transition-all hover:bg-neutral-100"
        aria-label={t.notifications.title}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <>
            <span className="absolute top-1.5 end-1.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary-500 ring-2 ring-white" />
            </span>
            {unreadCount <= 9 && (
              <span className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {open && (
        <div className="absolute end-0 top-full z-50 mt-2 w-[360px] max-w-[calc(100vw-2rem)] origin-top-right rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-900/15 animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
            <h3 className="text-sm font-bold text-neutral-900">{t.notifications.title}</h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  {t.notifications.markAllRead}
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-8 w-8 text-neutral-300 mb-2" />
                <p className="text-sm text-neutral-400">{t.notifications.noNotifications}</p>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type];
                const Icon = cfg.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`flex w-full items-start gap-3 border-b border-neutral-50 px-4 py-3 text-start transition-colors hover:bg-neutral-50 ${
                      !n.read ? 'bg-primary-50/40' : ''
                    }`}
                  >
                    {/* Icon */}
                    <div className={`relative flex-shrink-0 mt-0.5`}>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${cfg.bg} ${cfg.text} ring-1 ${cfg.ring}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {!n.read && (
                        <span className="absolute -top-0.5 -end-0.5 h-3 w-3 rounded-full bg-primary-500 ring-2 ring-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-600'}`}>
                        {n.text}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-400">{timeAgo(n.createdAt, t)}</p>
                    </div>

                    {/* Unread dot */}
                    {!n.read && (
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary-500" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-100 p-2">
            <button
              onClick={() => setOpen(false)}
              className="w-full rounded-xl px-3 py-2.5 text-center text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50"
            >
              {t.notifications.viewAll}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
