import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, adjustStock, saveProduct, clearError } from '../app/inventorySlice';
import { addToCart } from '../app/cartSlice';
import api from '../app/api';

const blank = { name: '', sku: '', category: '', price: '', quantity: 0, reorderLevel: 10 };

export default function Products() {
  const dispatch = useDispatch();
  const { items, pages, loading, error } = useSelector((s) => s.inventory);
  const role = useSelector((s) => s.auth.user.role);
  const canEdit = role !== 'staff';
  const [q, setQ] = useState({ search: '', category: '', lowStock: false, page: 1 });
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(null);

  const load = () => dispatch(fetchProducts({ ...q, lowStock: q.lowStock || undefined, search: q.search || undefined, category: q.category || undefined }));
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [q]); // debounce search
  useEffect(() => { api.get('/products/categories').then((r) => setCats(r.data)); }, [items.length]);

  const save = async (e) => {
    e.preventDefault();
    const res = await dispatch(saveProduct({ ...form, price: +form.price, quantity: +form.quantity, reorderLevel: +form.reorderLevel }));
    if (!res.error) { setForm(null); load(); }
  };
  const field = (k, props = {}) => (
    <input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} required placeholder={k} {...props} />
  );

  return (
    <>
      <div className="row"><h2>Products</h2>
        {canEdit && <button className="btn" onClick={() => { dispatch(clearError()); setForm(blank); }}>Add product</button>}
      </div>
      <div className="filters">
        <input placeholder="Search name or SKU" value={q.search} onChange={(e) => setQ({ ...q, search: e.target.value, page: 1 })} />
        <select value={q.category} onChange={(e) => setQ({ ...q, category: e.target.value, page: 1 })}>
          <option value="">All categories</option>{cats.map((c) => <option key={c}>{c}</option>)}
        </select>
        <label><input type="checkbox" checked={q.lowStock} onChange={(e) => setQ({ ...q, lowStock: e.target.checked, page: 1 })} /> Low stock only</label>
      </div>
      {error && <p className="error">{error}</p>}
      {form && (
        <form className="card formgrid" onSubmit={save}>
          {field('name')}{field('sku', { disabled: !!form._id })}{field('category')}
          {field('price', { type: 'number', step: '0.01', min: 0 })}
          {field('quantity', { type: 'number', min: 0 })}{field('reorderLevel', { type: 'number', min: 0 })}
          <div><button className="btn">Save product</button> <button type="button" className="link" onClick={() => setForm(null)}>Cancel</button></div>
        </form>
      )}
      <div className="scroll">
        <table>
          <thead><tr><th>Name</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Supplier</th><th></th></tr></thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td><td>{p.sku}</td><td>{p.category}</td><td>${p.price.toFixed(2)}</td>
                <td className={p.quantity <= p.reorderLevel ? 'low' : ''}>
                  {canEdit && <button className="mini" onClick={() => dispatch(adjustStock({ id: p._id, delta: -1 }))}>−</button>}
                  {' '}{p.quantity}{' '}
                  {canEdit && <button className="mini" onClick={() => dispatch(adjustStock({ id: p._id, delta: 1 }))}>+</button>}
                </td>
                <td>{p.supplier?.name || '—'}</td>
                <td className="actions">
                  <button className="link" disabled={p.quantity < 1} onClick={() => dispatch(addToCart(p))}>Add to cart</button>
                  {canEdit && <button className="link" onClick={() => { dispatch(clearError()); setForm(p); }}>Edit</button>}
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && <tr><td colSpan="7" className="muted">No products match these filters.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="row pager">
        <button className="link" disabled={q.page <= 1} onClick={() => setQ({ ...q, page: q.page - 1 })}>Previous</button>
        <span>Page {q.page} of {pages}</span>
        <button className="link" disabled={q.page >= pages} onClick={() => setQ({ ...q, page: q.page + 1 })}>Next</button>
      </div>
    </>
  );
}
