import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
export default function Home() {
  const { t } = useI18n();
  return <div className="hero"><p className="eyebrow">CIVIC INTELLIGENCE · HUMAN ACCOUNTABILITY</p><h1>{t('tagline')}</h1>
    <p>Civic-Lens AI is an intelligence and accountability layer over complaint workflows—not a replacement complaint portal.</p>
    <p className="flow">Understand → Extract → Classify → Prioritize → Route → Monitor → Verify → Audit</p>
    <Link className="button" to="/login">Open workspace</Link>
  </div>;
}
