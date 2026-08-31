import ActivityCard from './ActivityCard';

export default function ActivityTimeline() {
  return (
    <div className='space-y-5'>
      <ActivityCard
        type='task'
        title='Completed Dashboard UI'
        description='You successfully completed the dashboard redesign.'
        time='10 mins ago'
      />

      <ActivityCard
        type='reward'
        title='Earned 120 Points'
        description="Points awarded for completing today's goals."
        time='35 mins ago'
      />

      <ActivityCard
        type='project'
        title='Created New Project'
        description='TaskSync SaaS project was created.'
        time='2 hours ago'
      />

      <ActivityCard
        type='task'
        title='Moved Task to Completed'
        description='Authentication UI finished.'
        time='Yesterday'
      />
    </div>
  );
}
