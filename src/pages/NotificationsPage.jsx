import React, { useState, useEffect, useCallback } from 'react';
import { notificationsApi } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import {
  Bell, Calendar, FileText, Clock, CheckCheck, Trash2,
  BellOff, Info, AlertTriangle, Pill, Activity
} from 'lucide-react';

const TYPE_CONFIG = {
  appointment: { icon: Calendar, color: 'bg-blue-50 text-blue-600', ring: 'ring-blue-100' },
  report:       { icon: FileText, color: 'bg-violet-50 text-violet-600', ring: 'ring-violet-100' },
  reminder:     { icon: Pill, color: 'bg-amber-50 text-amber-600', ring: 'ring-amber-100' },
  vitals:       { icon: Activity, color: 'bg-rose-50 text-rose-600', ring: 'ring-rose-100' },
  warning:      { icon: AlertTriangle, color: 'bg-orange-50 text-orange-600', ring: 'ring-orange-100' },
  general:      { icon: Info, color: 'bg-slate-50 text-slate-500', ring: 'ring-slate-100' },
};

const formatRelTime = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [filter, setFilter] = useState('all'); // all | unread | read

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationsApi.list(1);
      const data = res.data?.data || res.data || {};
      const items = Array.isArray(data) ? data : data.notifications || [];
      setNotifications(items.map((item) => ({
        ...item,
        id: item.id || item._id,
        title: item.title || 'Notification',
        message: item.message || '',
        type: item.type || 'general',
        is_read: item.is_read ?? item.isRead ?? false,
        created_at: item.created_at || item.createdAt || new Date().toISOString(),
      })));
      const unreadCount = typeof data.unread === 'number' ? data.unread : items.filter((item) => !item.is_read && !item.isRead).length;
      setUnread(unreadCount);
    } catch {
      setNotifications([]);
      setUnread(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id || n.id === id ? { ...n, is_read: true } : n)
      );
      setUnread(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsApi.delete(id);
      setNotifications(prev => prev.filter(n => n._id !== id && n.id !== id));
    } catch { /* silent */ }
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnread(0);
    } finally {
      setMarkingAll(false);
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, x: -16 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
    exit: { opacity: 0, x: 16, transition: { duration: 0.2 } },
  };

  return (
    <div className="pb-24 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-start justify-between flex-wrap gap-4"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Bell className="text-brand-500" size={28} />
            Notifications
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {unread > 0 ? (
              <span className="text-brand-600 font-bold">{unread} unread</span>
            ) : (
              'All caught up!'
            )} · {notifications.length} total
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={markingAll}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 text-sm font-semibold hover:bg-brand-100 transition-colors disabled:opacity-50"
          >
            <CheckCheck size={16} />
            {markingAll ? 'Marking...' : 'Mark all read'}
          </button>
        )}
      </motion.div>

      {/* Filter Tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 mb-6">
        {['all', 'unread', 'read'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
              filter === f
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-500 hover:border-brand-200 hover:text-brand-600'
            }`}
          >
            {f}
          </button>
        ))}
      </motion.div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard className="p-16 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <BellOff size={28} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No notifications</h3>
          <p className="text-sm text-slate-400 mt-1">You're all caught up!</p>
        </GlassCard>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((notif) => {
              const id = notif._id || notif.id;
              const typeKey = notif.type || 'general';
              const config = TYPE_CONFIG[typeKey] || TYPE_CONFIG.general;
              const Icon = config.icon;

              return (
                <motion.div
                  key={id}
                  variants={itemVariants}
                  layout
                  exit="exit"
                  className={`group relative flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
                    notif.is_read
                      ? 'bg-white border-slate-100 hover:border-slate-200'
                      : 'bg-brand-50/40 border-brand-100 hover:border-brand-200'
                  }`}
                  onClick={() => !notif.is_read && handleMarkRead(id)}
                >
                  {/* Unread dot */}
                  {!notif.is_read && (
                    <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-brand-500 rounded-full" />
                  )}

                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ring-1 shrink-0 ${config.color} ${config.ring}`}>
                    <Icon size={20} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <p className={`text-sm font-bold ${notif.is_read ? 'text-slate-600' : 'text-slate-900'}`}>
                      {notif.title || 'Notification'}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Clock size={12} className="text-slate-400" />
                      <span className="text-xs text-slate-400">{formatRelTime(notif.created_at)}</span>
                    </div>
                  </div>

                  {/* Delete btn */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(id); }}
                    className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}


