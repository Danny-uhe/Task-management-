import { useEffect, useState } from 'react';
import AppLayout from '@/layout/AppLayout';
import ActivityStats from '../components/ActivityStats';
import ActivityFilter from '../components/ActivityFilter';
import { activityService, type ActivityResponse } from '../services/activity.service';

export default function ActivityPage() {
  const [activity, setActivity] = useState<ActivityResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    activityService.getMyActivity()
      .then(({ data }) => {
        if (active) setActivity(data);
      })
      .catch(() => {
        if (active) setError('Could not load your activity. Please try again.');
      });
    return () => { active = false; };
  }, []);

  return (
    <AppLayout>
      <div className='space-y-6'>
        {error ? (
          <div role='alert' className='rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400'>
            {error}
          </div>
        ) : (
          <>
            <ActivityStats stats={activity?.stats ?? null} />
            <ActivityFilter activities={activity?.activities ?? null} />
          </>
        )}
      </div>
    </AppLayout>
  );
}
