import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../state/AuthContext.jsx';
import { getDueReminders } from '../utils/habitReminders.js';

export function HabitReminderScheduler() {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);

  const loadHabits = useCallback(async () => {
    try { const { data } = await api.get('/habits'); setHabits(data.habits); } catch { /* Main pages surface API errors. */ }
  }, []);

  useEffect(() => {
    loadHabits();
    window.addEventListener('quickfit-habits-updated', loadHabits);
    return () => window.removeEventListener('quickfit-habits-updated', loadHabits);
  }, [loadHabits]);

  useEffect(() => {
    function sendDueReminders() {
      if (!window.Notification || window.Notification.permission !== 'granted') return;
      let sent;
      try { sent = new Set(JSON.parse(localStorage.getItem('quickfit_sent_reminders') || '[]')); }
      catch { sent = new Set(); }
      getDueReminders(habits, new Date(), sent, user.timezone || 'UTC').forEach(({ habit, key }) => {
        new window.Notification('QuickFit habit reminder', { body: `Time for ${habit.habitName}`, tag: key });
        sent.add(key);
      });
      localStorage.setItem('quickfit_sent_reminders', JSON.stringify([...sent].slice(-100)));
    }
    sendDueReminders();
    const interval = window.setInterval(sendDueReminders, 30000);
    return () => window.clearInterval(interval);
  }, [habits, user.timezone]);

  return null;
}
