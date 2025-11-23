// Notifications page
"use client";

import React from "react";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/lib/hooks/notifications/useNotifications";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type?: string;
}

export default function NotificationsPage() {
  const { data: notifications = [], isLoading, isFetching, refetch } = useNotifications({ limit: 50 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const handleMarkRead = async (notificationId: string) => {
    await markRead.mutateAsync(notificationId);
    refetch();
  };

  const handleMarkAll = async () => {
    await markAllRead.mutateAsync();
    refetch();
  };

  const unreadCount = notifications.filter((notification: Notification) => !notification.read).length;

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount} unread · {notifications.length} total
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleMarkAll} disabled={!unreadCount || markAllRead.isPending}>
          {markAllRead.isPending ? "Marking..." : "Mark all as read"}
        </Button>
      </div>

      {isLoading || isFetching ? (
        <div className="py-16 text-center text-muted-foreground">Loading notifications…</div>
      ) : notifications.length > 0 ? (
        <div className="mt-8 space-y-4">
          {notifications.map((notification: Notification) => (
            <div
              key={notification.id}
              className={`rounded-xl border p-4 transition-colors ${
                notification.read ? "bg-card" : "bg-accent/60"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold leading-snug">{notification.title}</h3>
                    {notification.type && (
                      <span className="text-xs uppercase text-muted-foreground">{notification.type}</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>

                {!notification.read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMarkRead(notification.id)}
                    disabled={markRead.isPending}
                  >
                    Mark as read
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground">
          <p>No notifications</p>
        </div>
      )}
    </div>
  );
}

