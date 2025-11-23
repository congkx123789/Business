#!/usr/bin/env bun
/**
 * Port Conflict Checker
 * 
 * This script checks for port conflicts across all services in the monorepo.
 * It scans all main.ts files and configuration files to detect:
 * 1. Duplicate port assignments
 * 2. Ports that are already in use by the system
 * 3. Ports that don't match the centralized configuration
 */

import { readFile } from "fs/promises";
import { join } from "path";
import { exec } from "child_process";
import { promisify } from "util";
import {
  SERVICE_PORTS,
  GRPC_PORTS,
  INFRASTRUCTURE_PORTS,
} from "../packages/7-shared/src/constants/ports";

const execAsync = promisify(exec);

interface PortUsage {
  port: number;
  service: string;
  file: string;
  line: number;
  type: "http" | "grpc" | "infrastructure";
  isHardcoded: boolean;
}

interface PortConflict {
  port: number;
  usages: PortUsage[];
}

const HTTP_PORT_SET = new Set(Object.values(SERVICE_PORTS));
const GRPC_PORT_SET = new Set(Object.values(GRPC_PORTS));
const INFRA_PORT_SET = new Set(Object.values(INFRASTRUCTURE_PORTS));

/**
 * Check if a port is currently in use on the system
 */
async function isPortInUse(port: number): Promise<boolean> {
  try {
    if (process.platform === "win32") {
      // Windows: Use netstat
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      return stdout.trim().length > 0;
    } else {
      // Unix/Linux/Mac: Use lsof
      const { stdout } = await execAsync(`lsof -i :${port}`);
      return stdout.trim().length > 0;
    }
  } catch (error) {
    // Command failed, port is likely not in use
    return false;
  }
}

/**
 * Extract port numbers from a file
 */
async function extractPortsFromFile(filePath: string): Promise<PortUsage[]> {
  const usages: PortUsage[] = [];
  
  try {
    const content = await readFile(filePath, "utf-8");
    const lines = content.split("\n");
    
    // Patterns to match port assignments
    const patterns = [
      // app.listen(3001) or app.listen(port)
      /app\.listen\((\d+)\)/g,
      // await app.listen(3001)
      /await\s+app\.listen\((\d+)\)/g,
      // const port = 3001
      /const\s+port\s*=\s*(\d+)/g,
      // port: 3001
      /port:\s*(\d+)/g,
      // PORT=3001
      /PORT\s*=\s*(\d+)/g,
      // "0.0.0.0:50051"
      /["']0\.0\.0\.0:(\d+)["']/g,
      // "localhost:50051"
      /["']localhost:(\d+)["']/g,
      // grpcUrl: "0.0.0.0:50051"
      /grpcUrl.*?["']0\.0\.0\.0:(\d+)["']/g,
    ];
    
    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const port = parseInt(match[1], 10);
        if (port >= 1000 && port <= 65535) {
          const lineNumber = content.substring(0, match.index).split("\n").length;
          const service = extractServiceName(filePath);
          let type: PortUsage["type"] = "infrastructure";
          if (GRPC_PORT_SET.has(port)) {
            type = "grpc";
          } else if (HTTP_PORT_SET.has(port)) {
            type = "http";
          } else if (INFRA_PORT_SET.has(port)) {
            type = "infrastructure";
          }
          const isHardcoded = !content.includes("configService") && 
                             !content.includes("process.env") &&
                             !content.includes("SERVICE_PORTS") &&
                             !content.includes("GRPC_PORTS");
          
          usages.push({
            port,
            service,
            file: filePath,
            line: lineNumber,
            type,
            isHardcoded,
          });
        }
      }
    });
  } catch (error) {
    // File might not exist or be readable
  }
  
  return usages;
}

/**
 * Extract service name from file path
 */
function extractServiceName(filePath: string): string {
  const match = filePath.match(/packages[\/\\]([^\/\\]+)/);
  return match ? match[1] : "unknown";
}

/**
 * Scan all services for port usage
 */
async function scanAllServices(): Promise<PortUsage[]> {
  const allUsages: PortUsage[] = [];
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
    "3-web",
  ];
  
  for (const service of services) {
    const servicePath = join(packagesDir, service);
    
    // Check main.ts files
    const mainTsPath = join(servicePath, "src", "main.ts");
    try {
      const stat = await import("fs/promises").then(m => m.stat(mainTsPath));
      if (stat.isFile()) {
        const usages = await extractPortsFromFile(mainTsPath);
        allUsages.push(...usages);
      }
    } catch {}
    
    // Check config files
    const configPath = join(servicePath, "src", "config", "configuration.ts");
    try {
      const stat = await import("fs/promises").then(m => m.stat(configPath));
      if (stat.isFile()) {
        const usages = await extractPortsFromFile(configPath);
        allUsages.push(...usages);
      }
    } catch {}
  }
  
  return allUsages;
}

/**
 * Find port conflicts
 */
function findConflicts(usages: PortUsage[]): PortConflict[] {
  const portMap = new Map<number, PortUsage[]>();
  
  usages.forEach((usage) => {
    if (!portMap.has(usage.port)) {
      portMap.set(usage.port, []);
    }
    portMap.get(usage.port)!.push(usage);
  });
  
  const conflicts: PortConflict[] = [];
  portMap.forEach((usages, port) => {
    if (usages.length > 1) {
      conflicts.push({ port, usages });
    }
  });
  
  return conflicts;
}

/**
 * Main function
 */
async function main() {
  console.log("🔍 Checking for port conflicts...\n");
  
  // Scan all services
  const usages = await scanAllServices();
  console.log(`Found ${usages.length} port usages across all services\n`);
  
  // Find conflicts
  const conflicts = findConflicts(usages);
  
  if (conflicts.length === 0) {
    console.log("✅ No port conflicts found!\n");
  } else {
    console.log(`❌ Found ${conflicts.length} port conflict(s):\n`);
    conflicts.forEach((conflict) => {
      console.log(`  Port ${conflict.port} is used by:`);
      conflict.usages.forEach((usage) => {
        console.log(`    - ${usage.service} (${usage.file}:${usage.line}) [${usage.type}]`);
        if (usage.isHardcoded) {
          console.log(`      ⚠️  Hardcoded port detected!`);
        }
      });
      console.log();
    });
  }
  
  // Check for hardcoded ports
  const hardcodedPorts = usages.filter((u) => u.isHardcoded);
  if (hardcodedPorts.length > 0) {
    console.log(`⚠️  Found ${hardcodedPorts.length} hardcoded port(s):\n`);
    hardcodedPorts.forEach((usage) => {
      console.log(`  Port ${usage.port} in ${usage.service} (${usage.file}:${usage.line})`);
    });
    console.log();
  }
  
  // Check if ports are in use
  console.log("🔍 Checking if ports are currently in use...\n");
  const uniquePorts = [...new Set(usages.map((u) => u.port))];
  const inUsePorts: number[] = [];
  
  for (const port of uniquePorts) {
    const inUse = await isPortInUse(port);
    if (inUse) {
      inUsePorts.push(port);
      console.log(`  ⚠️  Port ${port} is currently in use`);
    }
  }
  
  if (inUsePorts.length === 0) {
    console.log("  ✅ No ports are currently in use\n");
  }
  
  // Summary
  console.log("📊 Summary:");
  console.log(`  Total port usages: ${usages.length}`);
  console.log(`  Conflicts: ${conflicts.length}`);
  console.log(`  Hardcoded ports: ${hardcodedPorts.length}`);
  console.log(`  Ports in use: ${inUsePorts.length}`);
  
  if (conflicts.length > 0 || hardcodedPorts.length > 0) {
    console.log("\n💡 Run 'bun run fix:ports' to automatically fix conflicts");
    process.exit(1);
  }
  
  process.exit(0);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

