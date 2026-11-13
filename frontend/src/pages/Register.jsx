import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
export default function Register() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  async function submit(event) {
    event.preventDefault();
    try {
      await api.post('/auth/register', {
        name: event.target.name.value,
        email: event.target.email.value,
        password: event.target.password.value
      });
      navigate('/login');
    } catch (err) { setError(err.response?.data?.error || err.message); }
  }
  return <section className="narrow"><h1>Create citizen account</h1><form className="stack" onSubmit={submit}>
    <label>Name<input name="name" required maxLength="120"/></label>
    <label>Email<input name="email" type="email" required autoComplete="email"/></label>
    <label>Password (at least 10 characters)<input name="password" type="password" required minLength="10" autoComplete="new-password"/></label>
    {error && <p className="error">{error}</p>}<button className="button">Register</button>
  </form><p>Already registered? <Link to="/login">Sign in</Link></p></section>;
}
