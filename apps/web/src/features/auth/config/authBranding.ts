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

export const registerBranding: AuthBrandingProps = {
  title: 'Create your account',

  quote:
    '"Set up our workspace in under five minutes — tags, boards, and the whole team invited by lunch."',

  author: '— a Seamlessweb-style agency team',

  statOne: '2,400+',
  statOneLabel: 'Teams using TaskSync',

  statTwo: '4.8/5',
  statTwoLabel: 'Average team rating',

  features: [
    'No credit card required',
    'Invite your team after signup',
    'Cancel anytime',
  ],
};
