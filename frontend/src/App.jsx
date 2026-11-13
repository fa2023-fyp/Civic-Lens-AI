import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { I18nProvider } from './i18n/I18nContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Complaints from './pages/Complaints';
import SubmitComplaint from './pages/SubmitComplaint';
import ComplaintDetail from './pages/ComplaintDetail';
import ReviewQueue from './pages/ReviewQueue';
import Analytics from './pages/Analytics';
import SupervisorDashboard from './pages/SupervisorDashboard';
import Register from './pages/Register';
function Guard({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return roles && !roles.includes(user.role) ? <Navigate to="/complaints" replace /> : children;
}
function AppRoutes() {
  return <Layout><Routes>
    <Route path="/" element={<Home/>}/><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/>
    <Route path="/submit" element={<Guard roles={['citizen']}><SubmitComplaint/></Guard>}/>
    <Route path="/complaints" element={<Guard><Complaints/></Guard>}/>
    <Route path="/complaints/:id" element={<Guard><ComplaintDetail/></Guard>}/>
    <Route path="/review" element={<Guard roles={['officer','supervisor','admin']}><ReviewQueue/></Guard>}/>
    <Route path="/analytics" element={<Guard roles={['admin','supervisor']}><Analytics/></Guard>}/>
    <Route path="/supervisor" element={<Guard roles={['supervisor']}><SupervisorDashboard/></Guard>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes></Layout>;
}
export default function App() { return <I18nProvider><AuthProvider><AppRoutes/></AuthProvider></I18nProvider>; }
