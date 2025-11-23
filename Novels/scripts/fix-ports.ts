#!/usr/bin/env bun
/**
 * Automatic Port Conflict Fixer
 * 
 * This script automatically fixes port conflicts by:
 * 1. Replacing hardcoded ports with references to centralized port configuration
 * 2. Ensuring all services use ports from 7-shared/src/constants/ports.ts
 * 3. Updating configuration files to use environment variables with defaults from port config
 */

import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import {
  SERVICE_PORTS,
  GRPC_PORTS,
} from "../packages/7-shared/src/constants/ports";

// Port configuration mapping
const PORT_MAPPING: Record<string, { http?: number; grpc?: number }> = {
  "1-gateway": { http: SERVICE_PORTS.GATEWAY },
  "users-service": {
    http: SERVICE_PORTS.USERS_SERVICE,
    grpc: GRPC_PORTS.USERS_SERVICE,
  },
  "stories-service": {
    http: SERVICE_PORTS.STORIES_SERVICE,
    grpc: GRPC_PORTS.STORIES_SERVICE,
  },
  "comments-service": {
    http: SERVICE_PORTS.COMMENTS_SERVICE,
    grpc: GRPC_PORTS.COMMENTS_SERVICE,
  },
  "search-service": {
    http: SERVICE_PORTS.SEARCH_SERVICE,
    grpc: GRPC_PORTS.SEARCH_SERVICE,
  },
  "ai-service": {
    http: SERVICE_PORTS.AI_SERVICE,
    grpc: GRPC_PORTS.AI_SERVICE,
  },
  "notification-service": {
    http: SERVICE_PORTS.NOTIFICATION_SERVICE,
    grpc: GRPC_PORTS.NOTIFICATION_SERVICE,
  },
  "websocket-service": {
    http: SERVICE_PORTS.WEBSOCKET_SERVICE,
    grpc: GRPC_PORTS.WEBSOCKET_SERVICE,
  },
  "social-service": {
    http: SERVICE_PORTS.SOCIAL_SERVICE,
    grpc: GRPC_PORTS.SOCIAL_SERVICE,
  },
  "community-service": {
    http: SERVICE_PORTS.COMMUNITY_SERVICE,
    grpc: GRPC_PORTS.COMMUNITY_SERVICE,
  },
  "monetization-service": {
    http: SERVICE_PORTS.MONETIZATION_SERVICE,
    grpc: GRPC_PORTS.MONETIZATION_SERVICE,
  },
  "3-web": { http: SERVICE_PORTS.WEB_FRONTEND },
};

/**
 * Extract service name from file path
 */
function getServiceName(filePath: string): string | null {
  const match = filePath.match(/packages[\/\\]([^\/\\]+)/);
  if (!match) return null;
  
  let serviceName = match[1];
  if (serviceName === "2-services") {
    const subMatch = filePath.match(/2-services[\/\\]([^\/\\]+)/);
    if (subMatch) {
      serviceName = subMatch[1];
    }
  }
  
  return serviceName;
}

/**
 * Fix ports in main.ts file
 */
async function fixMainTs(filePath: string): Promise<boolean> {
  try {
    let content = await readFile(filePath, "utf-8");
    const serviceName = getServiceName(filePath);
    
    if (!serviceName || !PORT_MAPPING[serviceName]) {
      return false;
    }
    
    const ports = PORT_MAPPING[serviceName];
    let modified = false;
    
    // Fix HTTP port
    if (ports.http) {
      // Replace hardcoded app.listen(3002) with configService
      const hardcodedListenPattern = new RegExp(
        `app\\.listen\\((\\d+)\\)`,
        "g"
      );
      if (hardcodedListenPattern.test(content) && !content.includes("configService.get")) {
        content = content.replace(
          /await\s+app\.listen\((\d+)\)/g,
          `await app.listen(configService.get<number>("app.port", ${ports.http}))`
        );
        content = content.replace(
          /app\.listen\((\d+)\)/g,
          `app.listen(configService.get<number>("app.port", ${ports.http}))`
        );
        modified = true;
      }
      
      // Ensure configService is imported if not already
      if (!content.includes("ConfigService") && content.includes("configService")) {
        if (!content.includes("import { ConfigService }")) {
          const nestFactoryImport = content.match(/import.*NestFactory.*from.*@nestjs\/core/);
          if (nestFactoryImport) {
            content = content.replace(
              /import\s*\{([^}]+)\}\s*from\s*["']@nestjs\/core["']/,
              `import { $1, ConfigService } from "@nestjs/core"`
            );
            modified = true;
          }
        }
      }
    }
    
    // Fix gRPC port
    if (ports.grpc) {
      const grpcUrlPattern = new RegExp(
        `["']0\\.0\\.0\\.0:${ports.grpc}["']`,
        "g"
      );
      if (grpcUrlPattern.test(content)) {
        // Already correct format, but ensure it uses configService
        if (!content.includes("configService.get") && content.includes(`"0.0.0.0:${ports.grpc}"`)) {
          content = content.replace(
            new RegExp(`["']0\\.0\\.0\\.0:${ports.grpc}["']`, "g"),
            `configService.get<string>("app.grpcUrl", "0.0.0.0:${ports.grpc}")`
          );
          modified = true;
        }
      }
    }
    
    if (modified) {
      await writeFile(filePath, content, "utf-8");
      console.log(`  ✅ Fixed ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`  ❌ Error fixing ${filePath}:`, error);
    return false;
  }
}

/**
 * Fix ports in configuration.ts file
 */
async function fixConfigurationTs(filePath: string): Promise<boolean> {
  try {
    let content = await readFile(filePath, "utf-8");
    const serviceName = getServiceName(filePath);
    
    if (!serviceName || !PORT_MAPPING[serviceName]) {
      return false;
    }
    
    const ports = PORT_MAPPING[serviceName];
    let modified = false;
    
    // Fix HTTP port in config
    if (ports.http) {
      // Find the port assignment in appConfig
      const portPattern = new RegExp(
        `port:\\s*toNumber\\([^,]+,\\s*(\\d+)\\)`,
        "g"
      );
      const match = portPattern.exec(content);
      if (match && parseInt(match[1]) !== ports.http) {
        // Determine the env var name based on service
        const envVarName = serviceName.toUpperCase().replace(/-/g, "_") + "_PORT";
        content = content.replace(
          portPattern,
          `port: toNumber(process.env.${envVarName}, ${ports.http})`
        );
        modified = true;
      }
    }
    
    // Fix gRPC port in config
    if (ports.grpc) {
      const grpcPattern = new RegExp(
        `grpcUrl:\\s*process\\.env\\.[^,]+\\s*\\?\\?\\s*["']0\\.0\\.0\\.0:(\\d+)["']`,
        "g"
      );
      const match = grpcPattern.exec(content);
      if (match && parseInt(match[1]) !== ports.grpc) {
        const envVarName = serviceName.toUpperCase().replace(/-/g, "_") + "_GRPC_URL";
        content = content.replace(
          grpcPattern,
          `grpcUrl: process.env.${envVarName} ?? "0.0.0.0:${ports.grpc}"`
        );
        modified = true;
      }
    }
    
    if (modified) {
      await writeFile(filePath, content, "utf-8");
      console.log(`  ✅ Fixed ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`  ❌ Error fixing ${filePath}:`, error);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log("🔧 Fixing port conflicts...\n");
  
  const packagesDir = join(process.cwd(), "packages");
  const services = [
    "1-gateway",
    "2-services/users-service",
    "2-services/stories-service",
    "2-services/comments-service",
    "2-services/search-service",
    "2-services/ai-service",
    "2-services/notification-service",
    "2-services/websocket-service",
    "2-services/social-service",
    "2-services/community-service",
    "2-services/monetization-service",
  ];
  
  let fixedCount = 0;
  
  for (const service of services) {
    const servicePath = join(packagesDir, service);
    
    // Fix main.ts
    const mainTsPath = join(servicePath, "src", "main.ts");
    try {
      const { stat } = await import("fs/promises");
      const stats = await stat(mainTsPath);
      if (stats.isFile()) {
        const fixed = await fixMainTs(mainTsPath);
        if (fixed) fixedCount++;
      }
    } catch {}
    
    // Fix configuration.ts
    const configPath = join(servicePath, "src", "config", "configuration.ts");
    try {
      const { stat } = await import("fs/promises");
      const stats = await stat(configPath);
      if (stats.isFile()) {
        const fixed = await fixConfigurationTs(configPath);
        if (fixed) fixedCount++;
      }
    } catch {}
  }
  
  console.log(`\n✅ Fixed ${fixedCount} file(s)`);
  console.log("\n💡 Run 'bun run check:ports' to verify the fixes");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

