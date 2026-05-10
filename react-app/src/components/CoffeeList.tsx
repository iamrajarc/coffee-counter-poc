import axios from 'axios';

export type Coffee = {
  id: string;
  type: string;
  createdAt: string;
};

type CoffeeListProps = {
  coffees: Coffee[];
  onDeleted: () => void;
};

export function CoffeeList({ coffees, onDeleted }: CoffeeListProps) {
  async function handleDelete(id: string) {
    await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/coffees/${id}`);
    onDeleted();
  }

  return (
    <section>
      <h2>Coffee Logs Raja</h2>

      {coffees.length === 0 ? (
        <p>No coffees logged yet.</p>
      ) : (
        <ul>
          {coffees.map((coffee) => (
            <li key={coffee.id}>
              <span>
                {coffee.type} — {new Date(coffee.createdAt).toLocaleString()}
              </span>

              <button onClick={() => handleDelete(coffee.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}