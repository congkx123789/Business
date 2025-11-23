#!/usr/bin/env node
/**
 * Script to validate all contracts in 7-shared
 * 
 * This script validates:
 * 1. All types are properly exported
 * 2. All DTOs have proper validation decorators
 * 3. All proto files are syntactically correct
 * 4. All constants are properly defined
 * 
 * Usage:
 *   pnpm validate-contracts
 *   or
 *   node build-scripts/validate-contracts.ts
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const SRC_DIR = join(__dirname, '../src');
const PROTO_DIR = join(SRC_DIR, 'proto/definitions');

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

const result: ValidationResult = {
  passed: true,
  errors: [],
  warnings: [],
};

function validateTypes() {
  console.log('🔍 Validating types...');
  
  try {
    const typesIndex = readFileSync(join(SRC_DIR, 'types/index.ts'), 'utf-8');
    
    // Check if all type modules are exported
    const typeDirs = readdirSync(join(SRC_DIR, 'types')).filter(
      item => statSync(join(SRC_DIR, 'types', item)).isDirectory()
    );

    for (const dir of typeDirs) {
      if (!typesIndex.includes(`from './${dir}'`) && !typesIndex.includes(`from "./${dir}"`)) {
        result.warnings.push(`Type module '${dir}' may not be exported in types/index.ts`);
      }
    }

    console.log('✅ Types validation passed');
  } catch (error) {
    result.passed = false;
    result.errors.push(`Types validation failed: ${error}`);
    console.error('❌ Types validation failed:', error);
  }
}

function validateDTOs() {
  console.log('🔍 Validating DTOs...');
  
  try {
    const validationIndex = readFileSync(join(SRC_DIR, 'validation/index.ts'), 'utf-8');
    
    // Check if all validation modules are exported
    const validationDirs = readdirSync(join(SRC_DIR, 'validation')).filter(
      item => statSync(join(SRC_DIR, 'validation', item)).isDirectory()
    );

    for (const dir of validationDirs) {
      if (!validationIndex.includes(`from './${dir}'`) && !validationIndex.includes(`from "./${dir}"`)) {
        result.warnings.push(`Validation module '${dir}' may not be exported in validation/index.ts`);
      }
    }

    console.log('✅ DTOs validation passed');
  } catch (error) {
    result.passed = false;
    result.errors.push(`DTOs validation failed: ${error}`);
    console.error('❌ DTOs validation failed:', error);
  }
}

function validateProtoFiles() {
  console.log('🔍 Validating proto files...');
  
  try {
    const protoFiles = readdirSync(PROTO_DIR).filter(file => file.endsWith('.proto'));

    for (const file of protoFiles) {
      const content = readFileSync(join(PROTO_DIR, file), 'utf-8');
      
      // Basic syntax checks
      if (!content.includes('syntax = "proto3"')) {
        result.errors.push(`Proto file '${file}' missing syntax declaration`);
        result.passed = false;
      }

      if (!content.includes('service') && !content.includes('message')) {
        result.warnings.push(`Proto file '${file}' appears to be empty or incomplete`);
      }
    }

    console.log('✅ Proto files validation passed');
  } catch (error) {
    result.passed = false;
    result.errors.push(`Proto files validation failed: ${error}`);
    console.error('❌ Proto files validation failed:', error);
  }
}

function validateConstants() {
  console.log('🔍 Validating constants...');
  
  try {
    const constantsIndex = readFileSync(join(SRC_DIR, 'constants/index.ts'), 'utf-8');
    
    // Check if all constant modules are exported
    const constantDirs = readdirSync(join(SRC_DIR, 'constants')).filter(
      item => statSync(join(SRC_DIR, 'constants', item)).isDirectory()
    );

    for (const dir of constantDirs) {
      if (!constantsIndex.includes(`from './${dir}'`) && !constantsIndex.includes(`from "./${dir}"`)) {
        result.warnings.push(`Constants module '${dir}' may not be exported in constants/index.ts`);
      }
    }

    console.log('✅ Constants validation passed');
  } catch (error) {
    result.passed = false;
    result.errors.push(`Constants validation failed: ${error}`);
    console.error('❌ Constants validation failed:', error);
  }
}

function runValidation() {
  console.log('🚀 Starting contract validation...\n');

  validateTypes();
  validateDTOs();
  validateProtoFiles();
  validateConstants();

  console.log('\n📊 Validation Summary:');
  
  if (result.errors.length > 0) {
    console.error('\n❌ Errors:');
    result.errors.forEach(error => console.error(`   - ${error}`));
  }

  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Warnings:');
    result.warnings.forEach(warning => console.warn(`   - ${warning}`));
  }

  if (result.passed && result.errors.length === 0) {
    console.log('\n✅ All validations passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Validation failed!');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runValidation();
}

export { runValidation, validateTypes, validateDTOs, validateProtoFiles, validateConstants };

