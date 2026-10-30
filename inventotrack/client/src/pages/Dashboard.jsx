import { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';
import api from '../app/api';
import Stat from '../components/Stat';

export default function Dashboard() {
  const [d, setD] = useState(null);
  useEffect(() => {
    const load = () => api.get('/dashboard').then((r) => setD(r.data)).catch(() => {});
    load();
    const t = setInterval(load, 15000); // refresh every 15s for near real-time stock levels
    return () => clearInterval(t);
  }, []);
  if (!d) return <p className="muted">Loading dashboard…</p>;
  const money = (n) => `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  return (
    <>
      <h2>Dashboard</h2>
      <div className="stats">
        <Stat label="Products" value={d.totals.products} />
        <Stat label="Units in stock" value={d.totals.units} />
        <Stat label="Stock value" value={money(d.totals.value)} />
        <Stat label="Low stock items" value={d.lowStock.length} warn={d.lowStock.length > 0} />
        <Stat label="Pending supplier orders" value={d.pendingOrders} />
      </div>
      <div className="grid2">
        <section className="card">
          <h3>Revenue, last 30 days</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={d.trend}>
              <CartesianGrid stroke="#e3e8e8" vertical={false} />
              <XAxis dataKey="date" tickFormatter={(s) => s.slice(5)} fontSize={12} />
              <YAxis fontSize={12} tickFormatter={money} width={60} />
              <Tooltip formatter={(v) => money(v)} />
              <Line type="monotone" dataKey="revenue" stroke="#0f4c5c" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </section>
        <section className="card">
          <h3>Top sellers (units)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={d.top} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" fontSize={12} />
              <YAxis type="category" dataKey="name" width={110} fontSize={12} />
              <Tooltip />
              <Bar dataKey="units" fill="#0f4c5c" />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
      <section className="card">
        <h3>Needs reordering</h3>
        {d.lowStock.length === 0 ? <p className="muted">Everything is above its reorder level.</p> : (
          <table>
            <thead><tr><th>Product</th><th>SKU</th><th>In stock</th><th>Reorder at</th></tr></thead>
            <tbody>{d.lowStock.map((p) => (
              <tr key={p._id}><td>{p.name}</td><td>{p.sku}</td><td className="low">{p.quantity}</td><td>{p.reorderLevel}</td></tr>
            ))}</tbody>
          </table>
        )}
      </section>
    </>
  );
}
