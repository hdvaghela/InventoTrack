import { NavLink, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../app/authSlice';

export default function Layout() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const cartCount = useSelector((s) => s.cart.items.reduce((n, i) => n + i.qty, 0));
  return (
    <div className="shell">
      <nav className="side">
        <h1>InventoTrack</h1>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/checkout">Checkout{cartCount > 0 && <span className="pill">{cartCount}</span>}</NavLink>
        <NavLink to="/suppliers">Supplier orders</NavLink>
        <div className="who">
          <span>{user.name} ({user.role})</span>
          <button className="link" onClick={() => dispatch(logout())}>Sign out</button>
        </div>
      </nav>
      <main><Outlet /></main>
    </div>
  );
}
