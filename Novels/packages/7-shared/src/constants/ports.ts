/**
 * Centralized Port Configuration
 * 
 * This file defines all ports used across the monorepo to prevent conflicts.
 * All services should import and use ports from this file.
 * 
 * Port Ranges:
 * - 3000-3010: HTTP/REST API ports for services
 * - 50051-50060: gRPC ports for microservices
 * - 1433: SQL Server (Docker)
 * - 5433: PostgreSQL (Docker host) / 5432 container
 * - 6379: Redis (Docker)
 * - 7700: MeiliSearch (Docker)
 */

export const SERVICE_PORTS = {
  // Client ports
  WEB_FRONTEND: 3000, // Next.js dev server

  // HTTP/REST API ports (canonical values from structure docs)
  GATEWAY: 3000,
  USERS_SERVICE: 3001,
  STORIES_SERVICE: 3002,
  COMMENTS_SERVICE: 3003,
  SEARCH_SERVICE: 3004,
  AI_SERVICE: 3005,
  NOTIFICATION_SERVICE: 3006,
  WEBSOCKET_SERVICE: 3007,
  SOCIAL_SERVICE: 3008,
  COMMUNITY_SERVICE: 3009,
  MONETIZATION_SERVICE: 3010,
} as const;

export const GRPC_PORTS = {
  USERS_SERVICE: 50051,
  STORIES_SERVICE: 50052,
  COMMENTS_SERVICE: 50053,
  SEARCH_SERVICE: 50054,
  AI_SERVICE: 50055,
  NOTIFICATION_SERVICE: 50056,
  WEBSOCKET_SERVICE: 50057,
  SOCIAL_SERVICE: 50058,
  COMMUNITY_SERVICE: 50059,
  MONETIZATION_SERVICE: 50060,
} as const;

export const INFRASTRUCTURE_PORTS = {
  SQL_SERVER: 1433,
  POSTGRESQL: 5433,
  REDIS: 6379,
  MEILISEARCH: 7700,
} as const;

/**
 * Get all HTTP ports as an array for conflict checking
 */
export function getAllHttpPorts(): number[] {
  return Object.values(SERVICE_PORTS);
}

/**
 * Get all gRPC ports as an array for conflict checking
 */
export function getAllGrpcPorts(): number[] {
  return Object.values(GRPC_PORTS);
}

/**
 * Get all infrastructure ports as an array for conflict checking
 */
export function getAllInfrastructurePorts(): number[] {
  return Object.values(INFRASTRUCTURE_PORTS);
}

/**
 * Get all ports (HTTP + gRPC + Infrastructure) for complete conflict checking
 */
export function getAllPorts(): number[] {
  return [
    ...getAllHttpPorts(),
    ...getAllGrpcPorts(),
    ...getAllInfrastructurePorts(),
  ];
}

/**
 * Port configuration metadata for services
 */
export const PORT_METADATA = {
  gateway: {
    http: SERVICE_PORTS.GATEWAY,
    grpc: null,
    service: '1-gateway',
  },
  users: {
    http: SERVICE_PORTS.USERS_SERVICE,
    grpc: GRPC_PORTS.USERS_SERVICE,
    service: 'users-service',
  },
  stories: {
    http: SERVICE_PORTS.STORIES_SERVICE,
    grpc: GRPC_PORTS.STORIES_SERVICE,
    service: 'stories-service',
  },
  comments: {
    http: SERVICE_PORTS.COMMENTS_SERVICE,
    grpc: GRPC_PORTS.COMMENTS_SERVICE,
    service: 'comments-service',
  },
  search: {
    http: SERVICE_PORTS.SEARCH_SERVICE,
    grpc: GRPC_PORTS.SEARCH_SERVICE,
    service: 'search-service',
  },
  ai: {
    http: SERVICE_PORTS.AI_SERVICE,
    grpc: GRPC_PORTS.AI_SERVICE,
    service: 'ai-service',
  },
  notification: {
    http: SERVICE_PORTS.NOTIFICATION_SERVICE,
    grpc: GRPC_PORTS.NOTIFICATION_SERVICE,
    service: 'notification-service',
  },
  websocket: {
    http: SERVICE_PORTS.WEBSOCKET_SERVICE,
    grpc: GRPC_PORTS.WEBSOCKET_SERVICE,
    service: 'websocket-service',
  },
  social: {
    http: SERVICE_PORTS.SOCIAL_SERVICE,
    grpc: GRPC_PORTS.SOCIAL_SERVICE,
    service: 'social-service',
  },
  community: {
    http: SERVICE_PORTS.COMMUNITY_SERVICE,
    grpc: GRPC_PORTS.COMMUNITY_SERVICE,
    service: 'community-service',
  },
  monetization: {
    http: SERVICE_PORTS.MONETIZATION_SERVICE,
    grpc: GRPC_PORTS.MONETIZATION_SERVICE,
    service: 'monetization-service',
  },
  web: {
    http: SERVICE_PORTS.WEB_FRONTEND,
    grpc: null,
    service: '3-web',
  },
} as const;

