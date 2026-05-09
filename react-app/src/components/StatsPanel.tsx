import { useEffect, useState } from 'react';
import axios from 'axios';

type StatsSummary = {
  total: number;
  today: number;
  favourite: string;
};

const emptyStats: StatsSummary = {
  total: 0,
  today: 0,
  favourite: 'none',
};

export function StatsPanel() {
  const [stats, setStats] = useState<StatsSummary>(emptyStats);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      try {
        const response = await axios.get<StatsSummary>(
          `${import.meta.env.VITE_API_BASE_URL}/stats`,
        );

        if (!isMounted) {
          return;
        }

        setStats(response.data);
        setError('');
      } catch {
        if (!isMounted) {
          return;
        }

        setError('Stats service is not available');
      }
    }

    const timeoutId = window.setTimeout(() => {
      void fetchStats();
    }, 0);

    const intervalId = window.setInterval(() => {
      void fetchStats();
    }, 5000);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <section>
      <h2>Stats</h2>

      {error ? <p>{error}</p> : null}

      <div>
        <p>Total: {stats.total}</p>
        <p>Today: {stats.today}</p>
        <p>Favourite: {stats.favourite}</p>
      </div>
    </section>
  );
}