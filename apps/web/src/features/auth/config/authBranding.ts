import type { AuthBrandingProps } from '../components/AuthBranding/AuthBranding.types';

export const loginBranding: AuthBrandingProps = {
  title: 'Welcome Back',

  quote:
    '"Board view finally let me see where the whole team was stuck—not just my own list."',

  author: '— from a TaskSync team lead',

  statOne: '2,400+',
  statOneLabel: 'Teams using TaskSync',

  statTwo: '98%',
  statTwoLabel: 'Uptime last quarter',

  features: [
    'Board, List, and Calendar views',
    'Per-person privacy on the leaderboard',
    'Free for teams up to 5',
  ],
};
