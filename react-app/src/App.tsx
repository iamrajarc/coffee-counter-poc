import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { CoffeeList, type Coffee } from './components/CoffeeList';
import { LogCoffee } from './components/LogCoffee';
import { StatsPanel } from './components/StatsPanel';

function App() {
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchCoffees() {
    try {
      const response = await axios.get<Coffee[]>(
        `${import.meta.env.VITE_API_BASE_URL}/coffees`,
      );

      setCoffees(response.data);
    } finally {
      setLoading(false);
    }
  }

  function refreshPageData() {
    void fetchCoffees();
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchCoffees();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <main className="app">
      <h1>Coffee Counter</h1>
      <p className="subtitle">Log coffee, track count, and view live stats.</p>

      <div className="grid">
        <LogCoffee onLogged={refreshPageData} />
        <StatsPanel />
      </div>

      {loading ? (
        <p>Loading coffees...</p>
      ) : (
        <CoffeeList coffees={coffees} onDeleted={refreshPageData} />
      )}
    </main>
  );
}

export default App;