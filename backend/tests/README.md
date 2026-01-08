# Industrial AI Copilot - Test Suite

This directory contains all tests for the Industrial AI Copilot backend system, organized by test type and purpose.

## 📁 Test Structure

```
tests/
├── run-tests.js              # Test runner script
├── README.md                 # This file
├── unit/                     # Unit tests - individual components
│   ├── test-db-connection.js # Database connection testing
│   ├── test-api-keys.js      # API key validation
│   └── test-fixes.js         # Bug fix verification
├── integration/              # Integration tests - component interactions
│   ├── test-day2-equipment-api.js  # Equipment API testing
│   ├── test-api-endpoints.js       # API endpoint testing
│   └── test-chat-with-auth.js      # Chat API with authentication
├── system/                   # System tests - end-to-end functionality
│   ├── test-all-systems.js         # Comprehensive system test
│   ├── test-complete-system.js     # Complete system verification
│   └── test-day1-verification.js   # Day 1 system verification
└── setup/                    # Setup and configuration tests
    └── test-equipment-setup.js     # Equipment setup verification
```

## 🚀 Running Tests

### Run All Tests
```bash
npm test
# or
node tests/run-tests.js
```

### Run Specific Test Categories
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# System tests only
npm run test:system

# Setup tests only
npm run test:setup
```

### Run Individual Tests
```bash
# Run a specific test file
node tests/unit/test-db-connection.js
node tests/integration/test-day2-equipment-api.js
node tests/system/test-all-systems.js
```

## 📊 Test Categories

### 📦 Unit Tests
Test individual components in isolation:
- **Database Connection** - PostgreSQL connectivity and schema
- **API Keys** - Environment variable validation
- **Bug Fixes** - Critical bug fix verification

### 🔗 Integration Tests
Test component interactions and API endpoints:
- **Equipment API** - Equipment management system testing
- **API Endpoints** - REST API endpoint testing
- **Chat with Auth** - Chat system with authentication

### 🖥️ System Tests
Test complete system functionality end-to-end:
- **All Systems** - Comprehensive system test suite
- **Complete System** - Full system verification
- **Day 1 Verification** - Initial system setup verification

### ⚙️ Setup Tests
Test system setup and configuration:
- **Equipment Setup** - Equipment management setup verification

## 🧪 Test Requirements

### Prerequisites
1. **Backend server running** on port 3001
2. **PostgreSQL database** configured and running
3. **Environment variables** set in `.env` file:
   - `GEMINI_API_KEY`
   - `GROQ_API_KEY`
   - `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
   - `ADMIN_API_KEY`

### Test Data
- Tests use sample data created by `create-test-users.js`
- Equipment data from `sql/equipment-sample-data.sql`
- Document data from previous uploads

## 📈 Test Results

Tests provide detailed output including:
- ✅ **Pass/Fail status** for each test
- 📊 **Success rate percentage**
- 🔍 **Detailed error messages** for failures
- 📋 **Summary statistics**

## 🛠️ Adding New Tests

### Unit Test Template
```javascript
// tests/unit/test-new-feature.js
import dotenv from 'dotenv';
dotenv.config();

async function testNewFeature() {
  console.log('🧪 Testing New Feature...\n');
  
  try {
    // Test implementation
    console.log('   ✅ Test passed');
  } catch (error) {
    console.log('   ❌ Test failed:', error.message);
    process.exit(1);
  }
}

testNewFeature();
```

### Integration Test Template
```javascript
// tests/integration/test-new-integration.js
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

async function testNewIntegration() {
  console.log('🔗 Testing New Integration...\n');
  
  try {
    const response = await fetch('http://localhost:3001/api/new-endpoint');
    // Test implementation
    console.log('   ✅ Integration test passed');
  } catch (error) {
    console.log('   ❌ Integration test failed:', error.message);
    process.exit(1);
  }
}

testNewIntegration();
```

## 🔧 Troubleshooting

### Common Issues
1. **Server not running** - Start backend with `npm start`
2. **Database connection failed** - Check PostgreSQL service and credentials
3. **API key missing** - Verify `.env` file configuration
4. **Port conflicts** - Ensure port 3001 is available

### Debug Mode
Add debug logging to tests:
```javascript
console.log('Debug:', JSON.stringify(data, null, 2));
```

## 📝 Test Maintenance

- **Update tests** when adding new features
- **Run tests** before committing changes
- **Fix failing tests** immediately
- **Add new test categories** as system grows

## 🎯 Test Coverage Goals

- **Unit Tests**: 90%+ coverage of individual functions
- **Integration Tests**: All API endpoints tested
- **System Tests**: Complete user workflows tested
- **Setup Tests**: All configuration scenarios tested