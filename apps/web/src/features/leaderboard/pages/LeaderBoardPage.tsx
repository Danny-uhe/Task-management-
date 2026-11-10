import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import AppLayout from '@/layout/AppLayout';
import ProgressCard from '../components/ProgressCard';
import SharingVisibilityCard from '../components/SharingVisibilityCard';
import AchievementsSection from '../components/AchievementsSection';
import TeamLeaderboardCard from '../components/TeamLeaderboardCard';
import PeerViewCard from '../components/PeerViewCard';
import HelpCard from '../components/HelpCard';
import {
  leaderboardService,
  type GamificationPreferences,
  type GamificationProfile,
} from '../services/leaderboard.service';

export default function LeaderboardPage() {
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingPreference, setSavingPreference] =
    useState<keyof GamificationPreferences | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await leaderboardService.getMyProfile();
      setProfile(data);
    } catch {
      setError('Could not load your progress and achievements.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  async function savePreference(key: keyof GamificationPreferences, value: boolean) {
    if (!profile) return;
    const previous = profile.preferences[key];
    setProfile({
      ...profile,
      preferences: { ...profile.preferences, [key]: value },
    });
    setSavingPreference(key);
    setError('');
    try {
      const { data } = await leaderboardService.updatePreferences({ [key]: value });
      setProfile((current) => current
        ? { ...current, preferences: { ...current.preferences, ...data.preferences } }
        : current);
    } catch {
      setProfile((current) => current
        ? { ...current, preferences: { ...current.preferences, [key]: previous } }
        : current);
      setError('Could not save your sharing preference. Please try again.');
    } finally {
      setSavingPreference(null);
    }
  }

  return (
    <AppLayout>
      <div className='space-y-6'>
        {error && (
          <div role='alert' className='flex items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400'>
            <span>{error}</span>
            {!profile && <button type='button' onClick={() => void loadProfile()} className='font-semibold underline'>Retry</button>}
          </div>
        )}
        {loading ? (
          <div role='status' className='flex justify-center rounded-2xl border border-zinc-700 bg-zinc-900 py-20 text-cyan-500'>
            <Loader2 className='animate-spin' aria-label='Loading leaderboard data' />
          </div>
        ) : profile ? (
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]'>
            <div className='min-w-0 space-y-6'>
              <ProgressCard profile={profile} />
              <SharingVisibilityCard
                preferences={profile.preferences}
                savingPreference={savingPreference}
                onChange={(key, value) => void savePreference(key, value)}
              />
              <AchievementsSection achievements={profile.achievements} />
            </div>
            <div className='space-y-4'>
              <TeamLeaderboardCard />
              <PeerViewCard />
              <HelpCard />
            </div>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}
