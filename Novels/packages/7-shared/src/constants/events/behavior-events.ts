// User Behavior Events (for Recommendation Engine)

export const BEHAVIOR_EVENTS = {
  USER_CLICKED: 'user.clicked',
  USER_READ: 'user.read',
  USER_READ_COMPLETED: 'user.read.completed',
  USER_READ_ABANDONED: 'user.read.abandoned',
  USER_PURCHASED: 'user.purchased',
  USER_BROWSED: 'user.browsed',
  USER_LIKED: 'user.liked',
  USER_RECOMMENDED: 'user.recommended',
  USER_SEARCHED: 'user.searched',
} as const;

