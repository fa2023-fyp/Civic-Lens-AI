import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';
export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { t, language, changeLanguage } = useI18n();
  return <><header className="top"><Link to="/" className="brand">{t('brand')}</Link><nav>
    {user && <><Link to="/complaints">{t('complaints')}</Link>{user.role === 'citizen' && <Link to="/submit">{t('submit')}</Link>}{['officer','supervisor','admin'].includes(user.role) && <Link to="/review">Human review</Link>}{['supervisor','admin'].includes(user.role) && <Link to="/analytics">Analytics</Link>}<button className="link" onClick={logout}>Sign out</button></>}
    {!user && <Link to="/login">Sign in</Link>}
    <select aria-label="Language" value={language} onChange={e => changeLanguage(e.target.value)}><option value="en">English</option><option value="ur">اردو</option></select>
  </nav></header><main>{children}</main><footer>AI assists civic workflows; it does not replace officers or verify physical repair.</footer></>;
}
