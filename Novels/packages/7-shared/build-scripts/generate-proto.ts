#!/usr/bin/env node
/**
 * Script to compile .proto files to TypeScript using ts-proto
 * 
 * This script:
 * 1. Finds all .proto files in src/proto/definitions/
 * 2. Compiles them to TypeScript using ts-proto
 * 3. Outputs generated files to src/proto/generated/
 * 
 * Usage:
 *   pnpm generate-proto
 *   or
 *   node build-scripts/generate-proto.ts
 */

import { execSync } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const PROTO_DEFINITIONS_DIR = join(__dirname, '../src/proto/definitions');
const GENERATED_DIR = join(__dirname, '../src/proto/generated');

function findProtoFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findProtoFiles(fullPath));
    } else if (entry.endsWith('.proto')) {
      files.push(fullPath);
    }
  }

  return files;
}

function generateProtoFiles() {
  console.log('🔍 Finding .proto files...');
  const protoFiles = findProtoFiles(PROTO_DEFINITIONS_DIR);

  if (protoFiles.length === 0) {
    console.log('⚠️  No .proto files found in', PROTO_DEFINITIONS_DIR);
    return;
  }

  console.log(`📦 Found ${protoFiles.length} .proto file(s):`);
  protoFiles.forEach(file => console.log(`   - ${file}`));

  console.log('\n🔨 Compiling .proto files to TypeScript...');

  try {
    // Use ts-proto to compile all proto files
    // ts-proto options:
    //   - esModuleInterop: Enable ES module interop
    //   - outputClientImpl: Generate client implementation
    //   - outputServices: Generate service definitions
    const command = `npx ts-proto \\
      --esModuleInterop \\
      --outputClientImpl=grpc-web \\
      --outputServices=grpc-js \\
      --outDir=${GENERATED_DIR} \\
      ${protoFiles.join(' ')}`;

    execSync(command, {
      stdio: 'inherit',
      cwd: join(__dirname, '..'),
    });

    console.log('\n✅ Successfully generated TypeScript files from .proto definitions!');
    console.log(`📁 Generated files are in: ${GENERATED_DIR}`);
  } catch (error) {
    console.error('\n❌ Error generating proto files:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  generateProtoFiles();
}

export { generateProtoFiles };

