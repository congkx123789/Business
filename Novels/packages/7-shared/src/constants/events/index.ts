// Event Bus Topics exports

export * from "./user-events";
export * from "./story-events";
export * from "./comment-events";
export * from "./community-events";
export * from "./social-events";
export * from "./notification-events";
export * from "./behavior-events";
export * from "./monetization-events";

// Legacy EVENT_BUS_TOPICS (for backward compatibility)
import { USER_EVENTS } from "./user-events";
import { STORY_EVENTS } from "./story-events";
import { COMMENT_EVENTS } from "./comment-events";
import { SOCIAL_EVENTS } from "./social-events";
import { COMMUNITY_EVENTS } from "./community-events";
import { MONETIZATION_EVENTS } from "./monetization-events";
import { NOTIFICATION_EVENTS } from "./notification-events";

export const EVENT_BUS_TOPICS = {
  ...USER_EVENTS,
  ...STORY_EVENTS,
  ...COMMENT_EVENTS,
  ...SOCIAL_EVENTS,
  ...COMMUNITY_EVENTS,
  ...MONETIZATION_EVENTS,
  ...NOTIFICATION_EVENTS,
} as const;

