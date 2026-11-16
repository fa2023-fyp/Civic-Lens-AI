import { lazy, Suspense } from 'react';
import { LandingEmergencySection } from './LandingEmergencySection.jsx';
import { LandingFAQSection } from './LandingFAQSection.jsx';
import { LandingHeroSection } from './LandingHeroSection.jsx';
import { LandingImageBandSection } from './LandingImageBandSection.jsx';
import { LandingJourneySection } from './LandingJourneySection.jsx';
import { LandingPhoneSection } from './LandingPhoneSection.jsx';
import { LandingPillarsSection } from './LandingPillarsSection.jsx';
import { LandingRecognitionSection } from './LandingRecognitionSection.jsx';
import { LandingServicesSection } from './LandingServicesSection.jsx';
import { LandingSnapshotSection } from './LandingSnapshotSection.jsx';
import { LandingStatsSection } from './LandingStatsSection.jsx';
import './LandingPage.css';

const LandingAnalyzerSection = lazy(() => import('./LandingAnalyzerSection.jsx'));

export default function LandingPage() {
  return (
    <div className="landing-page">
      <LandingHeroSection />
      <LandingStatsSection />
      <LandingSnapshotSection />
      <LandingRecognitionSection />
      <LandingPillarsSection />
      <LandingServicesSection />
      <div id="intelligence" className="landing-anchor landing-intelligence-anchor">
        <Suspense fallback={<div className="landing-analyzer-loader" aria-live="polite" />}>
          <LandingAnalyzerSection />
        </Suspense>
      </div>
      <LandingJourneySection />
      <LandingImageBandSection />
      <LandingPhoneSection />
      <LandingFAQSection />
      <LandingEmergencySection />
    </div>
  );
}
