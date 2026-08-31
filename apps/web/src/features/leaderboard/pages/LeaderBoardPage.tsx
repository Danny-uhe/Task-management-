import AppLayout from '@/layout/AppLayout';

import ProgressCard from '../components/ProgressCard';
import SharingVisibilityCard from '../components/SharingVisibilityCard';
import AchievementsSection from '../components/AchievementsSection';
import TeamLeaderboardCard from '../components/TeamLeaderboardCard';
import PeerViewCard from '../components/PeerViewCard';
import HelpCard from '../components/HelpCard';

export default function LeaderboardPage() {
  return (
    <AppLayout>
      <div className='space-y-6'>
        {/* Responsive 2-column layout:
            - mobile: single column stack
            - lg+: main content | sidebar */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]'>
          {/* ── Left: main content ── */}
          <div className='min-w-0 space-y-6'>
            <ProgressCard />
            <SharingVisibilityCard />
            <AchievementsSection />
          </div>

          {/* ── Right: sidebar ── */}
          <div className='space-y-4'>
            <TeamLeaderboardCard />
            <PeerViewCard />
            <HelpCard />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
