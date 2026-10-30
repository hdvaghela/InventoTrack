import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { login, register } from '../app/authSlice';

export default function Login() {
  const dispatch = useDispatch();
  const { user, error } = useSelector((s) => s.auth);
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: 'admin@inventotrack.com', password: 'admin123' });
  if (user) return <Navigate to="/" replace />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => { e.preventDefault(); dispatch(mode === 'login' ? login(f) : register(f)); };
  return (
    <div className="login">
      <form onSubmit={submit} className="card">
        <h1>InventoTrack</h1>
        <p className="muted">{mode === 'login' ? 'Sign in to your stock room.' : 'Create a staff account.'}</p>
        {mode === 'register' && <input placeholder="Full name" value={f.name} onChange={set('name')} required />}
        <input type="email" placeholder="Email" value={f.email} onChange={set('email')} required />
        <input type="password" placeholder="Password" value={f.password} onChange={set('password')} required minLength={6} />
        {error && <p className="error">{error}</p>}
        <button className="btn">{mode === 'login' ? 'Sign in' : 'Create account'}</button>
        <button type="button" className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Need an account? Register' : 'Have an account? Sign in'}
        </button>
      </form>
    </div>
  );
}
