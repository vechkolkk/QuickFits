import { useEffect, useState } from 'react';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../api/client.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { StatCard } from '../components/StatCard.jsx';

export function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState({ workoutFrequency: [], habitCompletions: [] });

  useEffect(() => {
    async function loadDashboard() {
      const [summaryRes, statsRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/stats')
      ]);

      setSummary(summaryRes.data.summary);
      setStats(statsRes.data.stats);
    }

    loadDashboard();
  }, []);

  if (!summary) {
    return <div className="loading">Loading dashboard...</div>;
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
      <section className="panel">
        <h2>Workout Frequency</h2>
        <div className="chart-frame">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.workoutFrequency}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#166534" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
