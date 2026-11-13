import { Link } from 'react-router-dom';
export default function SupervisorDashboard() {
  return <section><h1>Department oversight</h1><p>Use authorized queue and aggregate reports to monitor workload and overdue cases. This prototype does not yet provide officer-level workload charts.</p>
    <div className="cards"><Link className="card" to="/complaints">Open department complaint queue</Link><Link className="card" to="/analytics">View aggregate SLA and category metrics</Link></div></section>;
}
