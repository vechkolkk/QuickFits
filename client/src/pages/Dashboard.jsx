import React, { useEffect, useMemo, useState } from 'react';
import { Activity, AlertCircle, CalendarDays, Droplets, RefreshCw } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { api, getErrorMessage } from '../api/client.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { StatCard } from '../components/StatCard.jsx';

const chartDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric'
});

function formatShortDate(date) {
  return chartDateFormatter.format(new Date(`${date}T00:00:00`));
}

function fillRecentDays(series, valueKey, days = 7) {
  const valuesByDate = new Map(series.map((item) => [item.date, item[valueKey]]));
  const today = new Date();

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - index - 1));
    const key = date.toISOString().slice(0, 10);

    return {
      date: key,
      label: formatShortDate(key),
      [valueKey]: valuesByDate.get(key) || 0
    };
  });
}

function chartHasData(series, valueKey) {
  return series.some((item) => item[valueKey] > 0);
}

function CustomTooltip({ active, label, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      {payload.map((item) => (
        <span key={item.dataKey}>
          {item.name}: {item.value}
        </span>
      ))}
    </div>
  );
}

function EmptyChart({ title, message }) {
  return (
    <div className="chart-empty">
      <Activity size={28} />
      <strong>{title}</strong>
      <span>{message}</span>
    </div>
  );
}

export function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState({ workoutFrequency: [], habitCompletions: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError('');

      try {
        const [summaryRes, statsRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/stats')
        ]);

        if (isMounted) {
          setSummary(summaryRes.data.summary);
          setStats(statsRes.data.stats);
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const workoutChartData = useMemo(
    () => fillRecentDays(stats.workoutFrequency, 'count'),
    [stats.workoutFrequency]
  );
  const habitChartData = useMemo(
    () => fillRecentDays(stats.habitCompletions, 'count'),
    [stats.habitCompletions]
  );
  const hasWorkoutData = chartHasData(workoutChartData, 'count');
  const hasHabitData = chartHasData(habitChartData, 'count');
  const habitCompletionRate = summary?.totalHabits
    ? Math.round((summary.completedToday / summary.totalHabits) * 100)
    : 0;
  const activeWeekLabel = summary?.mostActiveWeek
    ? `${formatShortDate(summary.mostActiveWeek.week)} week`
    : 'No active week yet';

  if (isLoading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <AlertCircle size={30} />
        <strong>Dashboard could not load</strong>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Dashboard" eyebrow="Today" />
      <div className="stat-grid">
        <StatCard label="Total Workouts" value={summary.totalWorkouts} hint={`${summary.weeklyWorkouts} this week`} />
        <StatCard label="Current Streak" value={summary.currentStreak} hint="best active habit streak" />
        <StatCard label="Longest Streak" value={summary.longestStreak} hint="personal consistency record" />
        <StatCard label="Habits Today" value={`${summary.completedToday}/${summary.totalHabits}`} hint="daily completions" />
      </div>
      <section className="dashboard-hero panel">
        <div>
          <span className="metric-eyebrow">This week</span>
          <h2>{summary.weeklyWorkouts} workouts logged</h2>
          <p>
            {summary.weeklyWorkouts > 0
              ? 'Momentum is showing up in your recent training history.'
              : 'Log your first workout this week to start building a visible pattern.'}
          </p>
        </div>
        <div className="dashboard-metrics">
          <article>
            <CalendarDays size={18} />
            <strong>{summary.mostActiveWeek?.count || 0}</strong>
            <span>{activeWeekLabel}</span>
          </article>
          <article>
            <Droplets size={18} />
            <strong>{habitCompletionRate}%</strong>
            <span>habits completed today</span>
          </article>
          <article>
            <RefreshCw size={18} />
            <strong>{stats.workoutFrequency.length}</strong>
            <span>training days tracked</span>
          </article>
        </div>
      </section>
      <section className="panel">
        <div className="section-title-row">
          <div>
            <h2>Workout Frequency</h2>
            <p>Last 7 days of completed workout sessions.</p>
          </div>
          <span className="muted-label">{summary.totalWorkouts} total</span>
        </div>
        <div className="chart-frame">
          {hasWorkoutData ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={workoutChartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfe5d8" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#edf4eb' }} />
                <Bar name="Workouts" dataKey="count" fill="#166534" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart title="No workouts this week" message="Save a workout to see your frequency chart fill in." />
          )}
        </div>
      </section>
      <section className="panel">
        <div className="section-title-row">
          <div>
            <h2>Habit Completions</h2>
            <p>Daily habit check-ins across the last 7 days.</p>
          </div>
          <span className="muted-label">{summary.completedToday} today</span>
        </div>
        <div className="chart-frame">
          {hasHabitData ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={habitChartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="habitFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0e7490" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#0e7490" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfe5d8" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  name="Habits"
                  dataKey="count"
                  stroke="#0e7490"
                  strokeWidth={3}
                  fill="url(#habitFill)"
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart title="No habit check-ins yet" message="Complete a habit to start tracking consistency." />
          )}
        </div>
      </section>
      <section className="panel">
        <h2>Recent Workouts</h2>
        <div className="list">
          {summary.recentActivity.length === 0 ? (
            <p className="empty">No workouts logged yet.</p>
          ) : (
            summary.recentActivity.map((workout) => (
              <article className="row-item" key={workout._id}>
                <div>
                  <strong>{workout.workoutName}</strong>
                  <span>{new Date(workout.date).toLocaleDateString()}</span>
                </div>
                <small>{workout.exercises.length} exercises</small>
              </article>
            ))
          )}
        </div>
      </section>
    </>
  );
}
