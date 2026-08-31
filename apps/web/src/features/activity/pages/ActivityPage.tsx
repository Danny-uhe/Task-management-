import AppLayout from '@/layout/AppLayout';
import ActivityStats from '../components/ActivityStats';
import ActivityFilter from '../components/ActivityFilter';

export default function ActivityPage() {
  return (
    <AppLayout>
      <div className='space-y-6'>
        <ActivityStats />
        <ActivityFilter />
      </div>
    </AppLayout>
  );
}
