# StorySphere Architecture

This document summarizes the high-level architecture for the multi-platform novel reader as described in the knowledge base document. The monorepo hosts the following packages:

- `packages/1-gateway`: API Gateway (NestJS) - BFF Layer (Backend-for-Frontend). Single entry point for AuthN, Routing, Rate Limiting, Client-specific Optimizations.
- `packages/2-services`: Contains all Microservices (Internal communication via gRPC & Event Bus). Each service owns its database.
- `packages/3-web`: Next.js 14 App Router client for web. Uses React Query + Zustand for state management.
- `packages/4-desktop`: Electron desktop application reusing the web experience.
- `packages/5-mobile-ios`: SwiftUI application skeleton following MVVM + Repository Pattern.
- `packages/6-mobile-android`: Kotlin Compose application skeleton following MVVM + Repository Pattern.
- `packages/7-shared`: Shared Library - The "Common Dictionary" for all packages. Contains types, DTOs, constants, and gRPC proto files.

Each package follows the structure outlined in the knowledge document to maximize code sharing and consistency across platforms. See `.cursor/rules/The 27 Commandments for Coding This Microservice System.mdc` for detailed coding rules and architecture guidelines.
