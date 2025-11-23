// Constants exports

export * from './events';
export * from './roles';
export * from './reading';
export * from './api';
export * from './ports';

// Explicitly export event constants for better compatibility
export { COMMENT_EVENTS, STORY_EVENTS, USER_EVENTS, SOCIAL_EVENTS, COMMUNITY_EVENTS, MONETIZATION_EVENTS, NOTIFICATION_EVENTS } from './events';

// Legacy exports (for backward compatibility)
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
} as const;

export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;
