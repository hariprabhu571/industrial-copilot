#!/usr/bin/env node
// Test Runner for Industrial AI Copilot
// Organizes and runs different categories of tests

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class TestRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async runTest(testFile, category) {
    return new Promise((resolve) => {
      this.log(`\n🧪 Running ${category}: ${path.basename(testFile)}`, 'cyan');
      
      const child = spawn('node', [testFile], {
        stdio: 'inherit',
        cwd: path.dirname(testFile)
      });

      child.on('close', (code) => {
        this.results.total++;
        if (code === 0) {
          this.results.passed++;
          this.log(`✅ ${path.basename(testFile)} - PASSED`, 'green');
        } else {
          this.results.failed++;
          this.log(`❌ ${path.basename(testFile)} - FAILED (exit code: ${code})`, 'red');
        }
        resolve(code === 0);
      });

      child.on('error', (error) => {
        this.results.total++;
        this.results.failed++;
        this.log(`❌ ${path.basename(testFile)} - ERROR: ${error.message}`, 'red');
        resolve(false);
      });
    });
  }

  async runTestCategory(category, testFiles) {
    this.log(`\n${'='.repeat(60)}`, 'bright');
    this.log(`🔧 ${category.toUpperCase()} TESTS`, 'bright');
    this.log(`${'='.repeat(60)}`, 'bright');

    for (const testFile of testFiles) {
      await this.runTest(testFile, category);
    }
  }

  async runAllTests() {
    this.log('🚀 Industrial AI Copilot - Test Suite Runner\n', 'bright');

    const testCategories = {
      'Unit Tests': [
        path.join(__dirname, 'unit', 'test-db-connection.js'),
        path.join(__dirname, 'unit', 'test-api-keys.js'),
        path.join(__dirname, 'unit', 'test-fixes.js')
      ],
      'Integration Tests': [
        path.join(__dirname, 'integration', 'test-day2-equipment-api.js'),
        path.join(__dirname, 'integration', 'test-api-endpoints.js'),
        path.join(__dirname, 'integration', 'test-chat-with-auth.js')
      ],
      'System Tests': [
        path.join(__dirname, 'system', 'test-day1-verification.js'),
        path.join(__dirname, 'system', 'test-complete-system.js'),
        path.join(__dirname, 'system', 'test-all-systems.js')
      ],
      'Setup Tests': [
        path.join(__dirname, 'setup', 'test-equipment-setup.js')
      ]
    };

    // Run tests by category
    for (const [category, testFiles] of Object.entries(testCategories)) {
      await this.runTestCategory(category, testFiles);
    }

    // Print final summary
    this.printSummary();
  }

  async runSpecificCategory(category) {
    const testCategories = {
      unit: [
        path.join(__dirname, 'unit', 'test-db-connection.js'),
        path.join(__dirname, 'unit', 'test-api-keys.js'),
        path.join(__dirname, 'unit', 'test-fixes.js')
      ],
      integration: [
        path.join(__dirname, 'integration', 'test-day2-equipment-api.js'),
        path.join(__dirname, 'integration', 'test-api-endpoints.js'),
        path.join(__dirname, 'integration', 'test-chat-with-auth.js')
      ],
      system: [
        path.join(__dirname, 'system', 'test-day1-verification.js'),
        path.join(__dirname, 'system', 'test-complete-system.js'),
        path.join(__dirname, 'system', 'test-all-systems.js')
      ],
      setup: [
        path.join(__dirname, 'setup', 'test-equipment-setup.js')
      ]
    };

    if (testCategories[category]) {
      await this.runTestCategory(`${category} tests`, testCategories[category]);
      this.printSummary();
    } else {
      this.log(`❌ Unknown test category: ${category}`, 'red');
      this.log('Available categories: unit, integration, system, setup', 'yellow');
    }
  }

  printSummary() {
    this.log(`\n${'='.repeat(60)}`, 'bright');
    this.log('📊 TEST SUMMARY', 'bright');
    this.log(`${'='.repeat(60)}`, 'bright');
    
    this.log(`Total Tests: ${this.results.total}`, 'cyan');
    this.log(`✅ Passed: ${this.results.passed}`, 'green');
    this.log(`❌ Failed: ${this.results.failed}`, 'red');
    
    const successRate = this.results.total > 0 ? 
      Math.round((this.results.passed / this.results.total) * 100) : 0;
    
    this.log(`📈 Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : 'yellow');

    if (this.results.failed === 0) {
      this.log('\n🎉 All tests passed! System is ready for production.', 'green');
    } else {
      this.log(`\n⚠️  ${this.results.failed} test(s) failed. Please review and fix issues.`, 'yellow');
    }

    process.exit(this.results.failed > 0 ? 1 : 0);
  }
}

// Command line interface
const args = process.argv.slice(2);
const runner = new TestRunner();

if (args.length === 0) {
  // Run all tests
  runner.runAllTests().catch(console.error);
} else if (args[0] === '--category' && args[1]) {
  // Run specific category
  runner.runSpecificCategory(args[1]).catch(console.error);
} else if (args[0] === '--help' || args[0] === '-h') {
  console.log(`
🧪 Industrial AI Copilot Test Runner

Usage:
  node tests/run-tests.js                    # Run all tests
  node tests/run-tests.js --category unit    # Run unit tests only
  node tests/run-tests.js --category integration  # Run integration tests only
  node tests/run-tests.js --category system      # Run system tests only
  node tests/run-tests.js --category setup       # Run setup tests only
  node tests/run-tests.js --help                 # Show this help

Test Categories:
  📦 unit        - Unit tests (database, API keys, bug fixes)
  🔗 integration - Integration tests (API endpoints, equipment, chat)
  🖥️  system      - System tests (complete system verification)
  ⚙️  setup       - Setup tests (equipment setup verification)
`);
} else {
  console.log('❌ Invalid arguments. Use --help for usage information.');
  process.exit(1);
}