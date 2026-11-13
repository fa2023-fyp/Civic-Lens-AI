import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintsApi } from '../api/complaints';
export default function SubmitComplaint() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await complaintsApi.submit(data);
      navigate(`/complaints/${response.id}`);
    } catch (err) { setError(err.response?.data?.error || err.message); }
  }
  return <section className="narrow"><h1>Submit a complaint</h1><p className="muted">Your submitted text is retained as provided. AI recommendations may be incorrect and can be reviewed by staff.</p>
    <form onSubmit={submit} className="stack" encType="multipart/form-data">
      <label>Complaint details<textarea name="text" minLength="3" maxLength="10000" required rows="6" placeholder="Describe the issue, location and how long it has occurred." /></label>
      <label>Images (up to 5)<input type="file" name="images" accept="image/jpeg,image/png,image/webp" multiple /></label>
      <label>Latitude (optional)<input name="latitude" type="number" step="any" min="-90" max="90" /></label>
      <label>Longitude (optional)<input name="longitude" type="number" step="any" min="-180" max="180" /></label>
      {error && <p className="error">{error}</p>}<button className="button">Analyze and submit</button>
    </form>
  </section>;
}
