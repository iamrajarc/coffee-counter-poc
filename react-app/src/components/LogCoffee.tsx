import { useState } from 'react';
import axios from 'axios';

type LogCoffeeProps = {
  onLogged: () => void;
};

const coffeeTypes = ['latte', 'cappuccino', 'black', 'espresso'];

export function LogCoffee({ onLogged }: LogCoffeeProps) {
  const [type, setType] = useState('latte');
  const [loading, setLoading] = useState(false);

  async function handleLogCoffee() {
    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/coffees`, {
        type,
      });

      onLogged();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2>Log Coffee</h2>

      <select value={type} onChange={(event) => setType(event.target.value)}>
        {coffeeTypes.map((coffeeType) => (
          <option key={coffeeType} value={coffeeType}>
            {coffeeType}
          </option>
        ))}
      </select>

      <button onClick={handleLogCoffee} disabled={loading}>
        {loading ? 'Logging...' : 'Log Coffee'}
      </button>
    </section>
  );
}