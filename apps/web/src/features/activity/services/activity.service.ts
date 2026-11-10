import api from '@/lib/axios';

export type ActivityEntry = {
  id: string;
  type: 'task_created' | 'task_completed' | 'notification' | 'project_created';
  title: string;
  description: string;
  occurredAt: string;
};

export type ActivityResponse = {
  success: boolean;
  stats: {
    completedToday: number;
    updatedToday: number;
    points: number;
  };
  activities: ActivityEntry[];
};

export const activityService = {
  getMyActivity() {
    return api.get<ActivityResponse>('/activity');
  },
};
