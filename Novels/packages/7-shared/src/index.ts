// Main export file for 7-shared package
// This is the "Common Dictionary" for all packages

// Export types
export * from './types';

// Export validation DTOs
export * from './validation';

// Export constants
export * from './constants';

// Export proto (when generated)
// export * from './proto';

// Re-export for backward compatibility
export type { PaginatedResponse } from './types';
export { 
  EVENT_BUS_TOPICS, 
  USER_ROLES, 
  API_STATUS,
  STORY_EVENTS,
  COMMENT_EVENTS,
  USER_EVENTS,
  SOCIAL_EVENTS,
  COMMUNITY_EVENTS,
  MONETIZATION_EVENTS,
  NOTIFICATION_EVENTS
} from './constants';
export { 
  SERVICE_PORTS, 
  GRPC_PORTS, 
  INFRASTRUCTURE_PORTS,
  getAllHttpPorts,
  getAllGrpcPorts,
  getAllInfrastructurePorts,
  getAllPorts,
  PORT_METADATA
} from './constants/ports';
