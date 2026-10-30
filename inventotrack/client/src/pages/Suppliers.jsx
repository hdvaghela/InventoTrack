import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api, { errMsg } from '../app/api';

export default function Suppliers() {
  const canEdit = useSelector((s) => s.auth.user.role) !== 'staff';
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [f, setF] = useState({ supplier: '', product: '', quantity: 20 });
  const [error, setError] = useState('');

  const load = () => api.get('/suppliers/orders').then((r) => setOrders(r.data));
  useEffect(() => {
    load();
    api.get('/suppliers').then((r) => setSuppliers(r.data));
    api.get('/products', { params: { limit: 100 } }).then((r) => setProducts(r.data.items));
  }, []);

  const act = async (fn) => { try { setError(''); await fn(); load(); } catch (e) { setError(errMsg(e)); } };
  const create = (e) => { e.preventDefault(); act(() => api.post('/suppliers/orders', { ...f, quantity: +f.quantity })); };

  return (
    <>
      <h2>Supplier orders</h2>
      {canEdit && (
        <form className="card formgrid" onSubmit={create}>
          <select required value={f.supplier} onChange={(e) => setF({ ...f, supplier: e.target.value })}>
            <option value="">Supplier</option>{suppliers.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <select required value={f.product} onChange={(e) => setF({ ...f, product: e.target.value })}>
            <option value="">Product</option>{products.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
          </select>
          <input type="number" min="1" value={f.quantity} onChange={(e) => setF({ ...f, quantity: e.target.value })} />
          <button className="btn">Place order</button>
        </form>
      )}
      {error && <p className="error">{error}</p>}
      <div className="scroll">
        <table>
          <thead><tr><th>Date</th><th>Supplier</th><th>Product</th><th>Qty</th><th>Status</th><th></th></tr></thead>
          <tbody>{orders.map((o) => (
            <tr key={o._id}>
              <td>{new Date(o.createdAt).toLocaleDateString()}</td><td>{o.supplier?.name}</td>
              <td>{o.product?.name}</td><td>{o.quantity}</td><td>{o.status}</td>
              <td className="actions">{canEdit && o.status === 'pending' && (<>
                <button className="link" onClick={() => act(() => api.patch(`/suppliers/orders/${o._id}/receive`))}>Mark received</button>
                <button className="link" onClick={() => act(() => api.patch(`/suppliers/orders/${o._id}/cancel`))}>Cancel</button></>)}
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </>
  );
}
