import { useEffect, useMemo, useState } from 'react';
import AdminShell, { AdminEmpty, AdminIcon, AdminNotice } from '../components/admin/AdminShell';
import { adminFetch, downloadAdminCsv } from '../components/admin/adminApi';

const SORTS = {
  rating: (a, b) => b.avg_rating - a.avg_rating || b.completed_jobs - a.completed_jobs,
  jobs: (a, b) => b.completed_jobs - a.completed_jobs || b.avg_rating - a.avg_rating,
  reviews: (a, b) => b.review_count - a.review_count || b.avg_rating - a.avg_rating,
};

export default function AdminLeaderboard() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState('rating');

  useEffect(() => {
    adminFetch('/api/leaderboard')
      .then(data => setTechnicians(data.technicians || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const sorted = useMemo(() => [...technicians].sort(SORTS[sort]), [technicians, sort]);
  const reviewed = technicians.filter(tech => tech.review_count > 0);
  const average = reviewed.length ? reviewed.reduce((sum, tech) => sum + tech.avg_rating, 0) / reviewed.length : 0;

  return (
    <AdminShell
      eyebrow="Quality signals"
      title="Technician leaderboard"
      description="Identify consistently high-performing professionals using both customer rating and completed-job volume."
      actions={<button className="adm-btn adm-btn-primary" disabled={!technicians.length} onClick={() => downloadAdminCsv('/api/leaderboard/export', 'technician-leaderboard.csv')}><AdminIcon name="download" />Export CSV</button>}
    >
      {error && <AdminNotice>{error}</AdminNotice>}

      <section className="adm-stats">
        <LeaderboardStat label="Ranked technicians" value={technicians.length} note="Eligible technician accounts" />
        <LeaderboardStat label="Average rating" value={average ? average.toFixed(2) : '—'} note="Across reviewed technicians" />
        <LeaderboardStat label="Completed jobs" value={technicians.reduce((sum, tech) => sum + tech.completed_jobs, 0)} note="Combined marketplace history" />
        <LeaderboardStat label="Customer reviews" value={technicians.reduce((sum, tech) => sum + tech.review_count, 0)} note="Quality feedback received" />
      </section>

      <section className="adm-card">
        <div className="adm-toolbar">
          <strong style={{ fontSize: 13 }}>Rank by</strong>
          <select className="adm-select" value={sort} onChange={event => setSort(event.target.value)} aria-label="Leaderboard sorting"><option value="rating">Average rating, then jobs</option><option value="jobs">Completed jobs</option><option value="reviews">Review count</option></select>
          <span className="adm-inline-note" style={{ marginLeft: 'auto' }}><AdminIcon name="star" size={14} />Promotion decisions should also consider recent conduct and verification status.</span>
        </div>
        {loading ? <div className="adm-loading">Calculating rankings…</div> : sorted.length === 0 ? (
          <AdminEmpty title="No technician performance data" description="Rankings will populate after technicians complete jobs or receive customer reviews." />
        ) : (
          <div className="adm-table-wrap"><table className="adm-table">
            <thead><tr><th>Rank</th><th>Technician</th><th>Average rating</th><th>Reviews</th><th>Completed jobs</th><th>Performance</th></tr></thead>
            <tbody>{sorted.map((tech, index) => {
              const maxJobs = Math.max(...sorted.map(item => item.completed_jobs), 1);
              const score = sort === 'rating' ? (tech.avg_rating / 5) * 100 : sort === 'reviews' ? (tech.review_count / Math.max(...sorted.map(item => item.review_count), 1)) * 100 : (tech.completed_jobs / maxJobs) * 100;
              return <tr key={tech.id}>
                <td><span className="adm-rank">{index + 1}</span></td>
                <td><div className="adm-person"><span className="adm-avatar">{tech.name.split(' ').map(part => part[0]).slice(0,2).join('')}</span><div><strong>{tech.name}</strong><span>{tech.city || 'Location not set'}</span></div></div></td>
                <td><span className="adm-rating">★ {tech.avg_rating ? tech.avg_rating.toFixed(2) : 'Unrated'}</span></td>
                <td>{tech.review_count}</td>
                <td><strong>{tech.completed_jobs}</strong></td>
                <td style={{ minWidth: 160 }}><div className="adm-progress"><span style={{ width: `${Math.max(score, 3)}%` }} /></div></td>
              </tr>;
            })}</tbody>
          </table></div>
        )}
      </section>
    </AdminShell>
  );
}

function LeaderboardStat({ label, value, note }) {
  return <div className="adm-stat"><div className="adm-stat-top"><span>{label}</span><span className="adm-stat-icon"><AdminIcon name="star" /></span></div><strong>{value}</strong><small>{note}</small></div>;
}
