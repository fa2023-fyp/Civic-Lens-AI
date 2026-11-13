import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    try { await login(event.target.email.value, event.target.password.value); navigate('/complaints'); }
    catch (err) { setError(err.response?.data?.error || 'Unable to sign in'); }
  }
  return <section className="narrow"><h1>Sign in</h1><form onSubmit={submit} className="stack">
    <label>Email<input name="email" type="email" required autoComplete="email" /></label>
    <label>Password<input name="password" type="password" required autoComplete="current-password" /></label>
    {error && <p className="error">{error}</p>}<button className="button">Sign in</button>
  </form><p className="muted">Need an account? <Link to="/register">Register as a citizen</Link></p></section>;
}
