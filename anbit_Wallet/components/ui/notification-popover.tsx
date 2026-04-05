import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type Notification = {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
};

interface NotificationItemProps {
  notification: Notification;
  index: number;
  onMarkAsRead: (id: string) => void;
  textColor?: string;
  hoverBgColor?: string;
  dotColor?: string;
}

const NotificationItem = ({
  notification,
  index,
  onMarkAsRead,
  textColor = 'text-anbit-text',
  dotColor = 'bg-anbit-xp-accent',
  hoverBgColor = 'hover:bg-anbit-border/40',
}: NotificationItemProps) => (
  <motion.div
    initial={{ opacity: 0, x: 12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.2, delay: index * 0.05 }}
    key={notification.id}
    className={cn('p-4 cursor-pointer transition-colors', hoverBgColor)}
    onClick={() => onMarkAsRead(notification.id)}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onMarkAsRead(notification.id);
      }
    }}
  >
    <div className="flex justify-between items-start gap-2">
      <div className="flex items-center gap-2 min-w-0">
        {!notification.read && <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotColor)} />}
        <h4 className={cn('text-sm font-semibold truncate', textColor)}>{notification.title}</h4>
      </div>
      <span className="text-xs shrink-0 text-anbit-muted">
        {notification.timestamp.toLocaleDateString()}
      </span>
    </div>
    <p className="text-xs mt-1.5 leading-relaxed text-anbit-muted">{notification.description}</p>
  </motion.div>
);

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  textColor?: string;
  hoverBgColor?: string;
  dividerColor?: string;
  dotColor?: string;
}

const NotificationList = ({
  notifications,
  onMarkAsRead,
  textColor,
  hoverBgColor,
  dividerColor = 'divide-anbit-border',
  dotColor,
}: NotificationListProps) => (
  <div className={cn('divide-y', dividerColor)}>
    {notifications.map((notification, index) => (
      <NotificationItem
        key={notification.id}
        notification={notification}
        index={index}
        onMarkAsRead={onMarkAsRead}
        textColor={textColor}
        hoverBgColor={hoverBgColor}
        dotColor={dotColor}
      />
    ))}
  </div>
);

export interface NotificationPopoverProps {
  notifications?: Notification[];
  onNotificationsChange?: (notifications: Notification[]) => void;
  buttonClassName?: string;
  popoverClassName?: string;
  textColor?: string;
  hoverBgColor?: string;
  dividerColor?: string;
  headerBorderColor?: string;
  dotColor?: string;
  title?: string;
  markAllReadLabel?: string;
  bellAriaLabel?: string;
  badgeClassName?: string;
}

export const defaultWalletNotifications: Notification[] = [
  {
    id: '1',
    title: 'Νέα προσφορά',
    description: 'Έχεις νέα προσφορά στο αγαπημένο σου κατάστημα στο δίκτυο Anbit.',
    timestamp: new Date(),
    read: false,
  },
  {
    id: '2',
    title: 'Ενημέρωση συστήματος',
    description: 'Προγραμματισμένη συντήρηση πλατφόρμας αύριο 02:00–04:00.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: '3',
    title: 'Υπενθύμιση',
    description: 'Έχεις ανεκμετάλλευτα XP σε 2 καταστήματα — δες το Προφίλ.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
  },
];

export const NotificationPopover = ({
  notifications: controlledNotifications,
  onNotificationsChange,
  buttonClassName,
  popoverClassName,
  textColor = 'text-anbit-text',
  hoverBgColor = 'hover:bg-anbit-border/40',
  dividerColor = 'divide-anbit-border',
  headerBorderColor = 'border-anbit-border',
  dotColor = 'bg-anbit-xp-accent',
  title = 'Ειδοποιήσεις',
  markAllReadLabel = 'Όλα αναγνωσμένα',
  bellAriaLabel = 'Ειδοποιήσεις',
  badgeClassName = 'absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full flex items-center justify-center text-[10px] font-bold border border-anbit-border bg-anbit-xp-bar text-[color:var(--anbit-bg)]',
}: NotificationPopoverProps) => {
  const [internal, setInternal] = useState<Notification[]>(defaultWalletNotifications);
  const isControlled = controlledNotifications !== undefined && onNotificationsChange !== undefined;
  const notifications = isControlled ? controlledNotifications! : internal;

  const setNotifications = (next: Notification[]) => {
    if (isControlled) onNotificationsChange!(next);
    else setInternal(next);
  };

  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!isOpen) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current && !rootRef.current.contains(t)) setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
  };

  const defaultBtn =
    'relative w-10 h-10 lg:w-11 lg:h-11 rounded-lg bg-white/[0.05] border border-anbit-border text-anbit-muted hover:text-anbit-xp-accent transition-colors shadow-none';

  return (
    <div ref={rootRef} className="relative text-anbit-text">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen((o) => !o)}
        className={cn(buttonClassName ?? defaultBtn)}
        aria-label={bellAriaLabel}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Bell className="w-5 h-5" strokeWidth={2} />
        {unreadCount > 0 && <span className={badgeClassName}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'notification-popover-panel absolute right-0 mt-2 w-[min(100vw-2rem,20rem)] max-h-[400px] overflow-y-auto rounded-xl z-[200]',
              'border border-anbit-border shadow-2xl isolate',
              'bg-anbit-card text-anbit-text',
              popoverClassName,
            )}
            style={{ backgroundColor: 'var(--anbit-card)' }}
            role="dialog"
            aria-label={title}
          >
            <div
              className={cn(
                'p-4 border-b flex justify-between items-center gap-2 bg-anbit-card',
                headerBorderColor,
              )}
              style={{ backgroundColor: 'var(--anbit-card)' }}
            >
              <h3 className="text-sm font-semibold font-greek text-anbit-text">{title}</h3>
              <Button
                type="button"
                onClick={markAllAsRead}
                variant="ghost"
                size="sm"
                className={cn(
                  'text-xs h-8 px-2 text-anbit-muted hover:text-anbit-text hover:bg-anbit-border/50',
                )}
              >
                {markAllReadLabel}
              </Button>
            </div>

            <NotificationList
              notifications={notifications}
              onMarkAsRead={markAsRead}
              textColor={textColor}
              hoverBgColor={hoverBgColor}
              dividerColor={dividerColor}
              dotColor={dotColor}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
