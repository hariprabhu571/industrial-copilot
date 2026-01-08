# Phase 29 Equipment Management - Postman Testing Guide

## 🚀 Quick Setup

1. **Start Backend Server**:
   ```bash
   cd backend
   npm start
   ```
   Server runs on: `http://localhost:3001`

2. **Import Postman Collection**: Use the JSON collection below or create requests manually

## 🔐 Authentication (Required for All Equipment APIs)

### Step 1: Login to Get Token
```
POST http://localhost:3001/api/auth/login
Content-Type: application/json

Body (JSON):
{
  "username": "admin",
  "password": "admin123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "cdf92e76-54e1-4763-91d0-e8b9c28e7e7c",
      "username": "admin",
      "email": "admin@company.com",
      "role": "admin"
    }
  }
}
```

### Step 2: Use Token in Headers
For all equipment API calls, add this header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

## 🔧 Equipment Management API Tests

### 1. Equipment Search
```
GET http://localhost:3001/api/equipment
Authorization: Bearer YOUR_TOKEN

Query Parameters (optional):
- equipmentNumber: EQ-PMP-001
- name: pump
- manufacturer: Grundfos
- category: PUMPS
- plant: PLANT-A
- area: UTILITIES
- operationalState: OPERATIONAL
- criticality: HIGH
- page: 1
- limit: 10
```

### 2. Equipment Detail
```
GET http://localhost:3001/api/equipment/EQ-PMP-001
Authorization: Bearer YOUR_TOKEN
```

### 3. Equipment Statistics
```
GET http://localhost:3001/api/equipment/statistics
Authorization: Bearer YOUR_TOKEN
```

### 4. Equipment Maintenance History
```
GET http://localhost:3001/api/equipment/EQ-PMP-001/maintenance
Authorization: Bearer YOUR_TOKEN

Query Parameters (optional):
- limit: 50
- offset: 0
- status: COMPLETED
```

### 5. Equipment Status
```
GET http://localhost:3001/api/equipment/EQ-PMP-001/status
Authorization: Bearer YOUR_TOKEN
```

### 6. Equipment Alarms
```
GET http://localhost:3001/api/equipment/EQ-PMP-001/alarms
Authorization: Bearer YOUR_TOKEN

Query Parameters (optional):
- activeOnly: true
```

### 7. Equipment by Location
```
GET http://localhost:3001/api/equipment/location/PLANT-A
Authorization: Bearer YOUR_TOKEN

GET http://localhost:3001/api/equipment/location/PLANT-A/PRODUCTION
Authorization: Bearer YOUR_TOKEN

GET http://localhost:3001/api/equipment/location/PLANT-A/PRODUCTION/LINE-1
Authorization: Bearer YOUR_TOKEN
```

### 8. Equipment Categories
```
GET http://localhost:3001/api/equipment/categories
Authorization: Bearer YOUR_TOKEN
```

### 9. Equipment Locations
```
GET http://localhost:3001/api/equipment/locations
Authorization: Bearer YOUR_TOKEN
```

### 10. Adapter Health (Admin Only)
```
GET http://localhost:3001/api/equipment/health
Authorization: Bearer YOUR_TOKEN
```

## 👥 Test Different User Roles

### Admin User (Full Access)
```json
{
  "username": "admin",
  "password": "admin123"
}
```

### Plant Manager (Plant A Access)
```json
{
  "username": "plant.manager",
  "password": "manager123"
}
```

### Senior Technician (Limited Equipment)
```json
{
  "username": "tech.senior",
  "password": "tech123"
}
```

### Line Operator (Production Line Only)
```json
{
  "username": "operator.line1",
  "password": "operator123"
}
```

## 📋 Sample Equipment IDs for Testing

- **EQ-PMP-001**: Centrifugal Pump #1 (HIGH criticality, OPERATIONAL)
- **EQ-PMP-002**: Centrifugal Pump #2 (HIGH criticality, OPERATIONAL)
- **EQ-PMP-003**: Chemical Transfer Pump (HIGH criticality, MAINTENANCE)
- **EQ-CNV-001**: Conveyor Belt System #1 (CRITICAL, OPERATIONAL)
- **EQ-CNV-002**: Conveyor Belt System #2 (CRITICAL, OPERATIONAL)
- **EQ-PLC-001**: Allen Bradley PLC (CRITICAL, OPERATIONAL)
- **EQ-PLC-002**: Process Control PLC (CRITICAL, OPERATIONAL)
- **EQ-RCT-001**: Chemical Reactor #1 (CRITICAL, OPERATIONAL)
- **EQ-HEX-001**: Heat Exchanger #1 (HIGH criticality, OPERATIONAL)
- **EQ-COL-001**: Distillation Column (CRITICAL, OPERATIONAL)
- **EQ-CMP-001**: Air Compressor #1 (HIGH criticality, OPERATIONAL)
- **EQ-MOT-001**: AC Motor #1 (MEDIUM criticality, OPERATIONAL)
- **EQ-HMI-001**: Operator Interface Panel (MEDIUM criticality, OPERATIONAL)

## 🧪 Expected Results by User Role

### Admin User
- **Search**: 13 equipment items (all equipment)
- **Detail**: Can access any equipment
- **Statistics**: Full system statistics
- **Health**: Can access adapter health

### Plant Manager
- **Search**: 3 equipment items (Plant A only)
- **Detail**: Can access Plant A equipment only
- **Statistics**: Filtered statistics for accessible equipment
- **Health**: Access denied

### Senior Technician
- **Search**: 1 equipment item (assigned equipment only)
- **Detail**: Can access EQ-PMP-001 and EQ-CNV-001, denied EQ-PLC-001
- **Maintenance**: Can view maintenance records
- **Health**: Access denied

### Line Operator
- **Search**: 2 equipment items (production line equipment)
- **Detail**: Can access production line equipment
- **Maintenance**: Access denied
- **Health**: Access denied

## 🔍 Testing Permission-Based Access

1. **Login as different users** and test the same equipment ID
2. **Verify access control**: Some users should get "Access denied" errors
3. **Check filtered results**: Different users see different equipment counts
4. **Test location filtering**: Plant managers only see their plant's equipment

## 📊 Expected Response Formats

### Equipment Detail Response
```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440001",
    "equipmentNumber": "EQ-PMP-001",
    "name": "Centrifugal Pump #1",
    "description": "Main process water circulation pump",
    "manufacturer": "Grundfos",
    "model": "CR64-2-2",
    "criticality": "HIGH",
    "operationalState": "OPERATIONAL",
    "category": {
      "name": "PUMPS",
      "description": "Centrifugal, Positive Displacement"
    },
    "location": {
      "plant": "PLANT-A",
      "area": "UTILITIES",
      "line": "PUMP-HOUSE"
    },
    "specifications": [...],
    "status": {
      "operationalState": "OPERATIONAL",
      "availabilityPercentage": "98.50",
      "reliabilityPercentage": "99.20"
    },
    "alarms": [...]
  }
}
```

### Statistics Response
```json
{
  "success": true,
  "data": {
    "total": 13,
    "operational": 12,
    "maintenance": 1,
    "offline": 0,
    "alarm": 0,
    "critical": 6,
    "activeAlarms": 6,
    "scheduledMaintenance": 2
  }
}
```

## 🚨 Common Issues & Troubleshooting

1. **401 Unauthorized**: Token expired or invalid - re-authenticate
2. **403 Access Denied**: User doesn't have permission for that resource
3. **404 Equipment Not Found**: Equipment ID doesn't exist or user can't access it
4. **500 Internal Server Error**: Check backend logs for database issues

## ✅ Phase 29 Task Completion Checklist

- [x] **Task 1**: Database Schema and Core Infrastructure
- [x] **Task 2**: Equipment Data Models and Interfaces  
- [x] **Task 3**: Equipment Repository and Adapter Pattern
- [x] **Task 4**: Permission Service Implementation
- [x] **Task 5**: Equipment Service Layer
- [x] **Task 7**: Equipment API Endpoints
- [x] **Task 8**: Equipment Search and Filtering
- [x] **Task 9**: Equipment Status Monitoring
- [x] **Task 10**: Maintenance History Management
- [x] **Task 13**: System Health Monitoring
- [x] **Task 14**: Sample Data and Configuration
- [x] **Task 15**: Integration Testing and Validation

**Status**: ✅ **ALL CORE TASKS COMPLETED**

The equipment management system is fully functional with enterprise-level security, role-based access control, and comprehensive API coverage!