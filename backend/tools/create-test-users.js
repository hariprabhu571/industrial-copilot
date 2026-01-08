// Create Test Users for Day 2 Equipment API Testing
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

console.log("👥 Creating Test Users for Equipment Management API\n");

async function createTestUsers() {
  try {
    const { query } = await import("./src/db/postgres.js");
    
    console.log("1️⃣ Checking existing users...");
    const existingUsers = await query('SELECT username, role, equipment_role FROM users ORDER BY username');
    
    console.log(`   Found ${existingUsers.rows.length} existing users:`);
    existingUsers.rows.forEach(user => {
      console.log(`      - ${user.username} (${user.role}/${user.equipment_role})`);
    });
    
    console.log("\n2️⃣ Creating/updating test users with correct passwords...");
    
    const testUsers = [
      {
        username: 'admin',
        email: 'admin@company.com',
        password: 'admin123',
        role: 'admin',
        equipment_role: 'admin',
        accessible_plants: ['PLANT-A', 'PLANT-B'],
        accessible_areas: ['PRODUCTION', 'UTILITIES', 'PROCESS', 'CONTROL-ROOM'],
        department: 'MANAGEMENT'
      },
      {
        username: 'plant.manager',
        email: 'plant.manager@company.com',
        password: 'manager123',
        role: 'editor',
        equipment_role: 'plant_manager',
        accessible_plants: ['PLANT-A'],
        accessible_areas: ['PRODUCTION', 'UTILITIES', 'CONTROL-ROOM'],
        accessible_lines: ['LINE-1', 'LINE-2'],
        department: 'OPERATIONS'
      },
      {
        username: 'tech.senior',
        email: 'tech.senior@company.com',
        password: 'tech123',
        role: 'editor',
        equipment_role: 'technician',
        accessible_plants: ['PLANT-A'],
        accessible_areas: ['PRODUCTION', 'UTILITIES'],
        assigned_equipment: ['EQ-PMP-001', 'EQ-PMP-002', 'EQ-CNV-001', 'EQ-CMP-001'],
        department: 'MAINTENANCE'
      },
      {
        username: 'operator.line1',
        email: 'operator.line1@company.com',
        password: 'operator123',
        role: 'viewer',
        equipment_role: 'operator',
        accessible_plants: ['PLANT-A'],
        accessible_areas: ['PRODUCTION'],
        accessible_lines: ['LINE-1'],
        department: 'OPERATIONS'
      },
      {
        username: 'viewer',
        email: 'viewer@company.com',
        password: 'viewer123',
        role: 'viewer',
        equipment_role: 'operator',
        accessible_plants: ['PLANT-A'],
        accessible_areas: ['PRODUCTION'],
        department: 'OPERATIONS'
      }
    ];
    
    for (const user of testUsers) {
      try {
        // Hash password
        const passwordHash = await bcrypt.hash(user.password, 10);
        
        // Check if user exists
        const existingUser = await query('SELECT id FROM users WHERE username = $1', [user.username]);
        
        if (existingUser.rows.length > 0) {
          // Update existing user
          const updateQuery = `
            UPDATE users SET
              email = $2,
              password_hash = $3,
              role = $4,
              equipment_role = $5,
              accessible_plants = $6,
              accessible_areas = $7,
              accessible_lines = $8,
              assigned_equipment = $9,
              department = $10,
              updated_at = CURRENT_TIMESTAMP
            WHERE username = $1
          `;
          
          await query(updateQuery, [
            user.username,
            user.email,
            passwordHash,
            user.role,
            user.equipment_role,
            user.accessible_plants || null,
            user.accessible_areas || null,
            user.accessible_lines || null,
            user.assigned_equipment || null,
            user.department
          ]);
          
          console.log(`   ✅ Updated user: ${user.username}`);
        } else {
          // Create new user
          const insertQuery = `
            INSERT INTO users (
              username, email, password_hash, role, equipment_role,
              accessible_plants, accessible_areas, accessible_lines,
              assigned_equipment, department, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `;
          
          await query(insertQuery, [
            user.username,
            user.email,
            passwordHash,
            user.role,
            user.equipment_role,
            user.accessible_plants || null,
            user.accessible_areas || null,
            user.accessible_lines || null,
            user.assigned_equipment || null,
            user.department
          ]);
          
          console.log(`   ✅ Created user: ${user.username}`);
        }
      } catch (error) {
        console.log(`   ❌ Failed to create/update user ${user.username}: ${error.message}`);
      }
    }
    
    console.log("\n3️⃣ Verifying test users...");
    const finalUsers = await query(`
      SELECT username, role, equipment_role, accessible_plants, department 
      FROM users 
      WHERE username IN ('admin', 'plant.manager', 'tech.senior', 'operator.line1')
      ORDER BY username
    `);
    
    console.log(`   ✅ Test users ready: ${finalUsers.rows.length}`);
    finalUsers.rows.forEach(user => {
      const plants = user.accessible_plants ? user.accessible_plants.join(', ') : 'None';
      console.log(`      - ${user.username} (${user.equipment_role}) - Plants: ${plants}`);
    });
    
    console.log("\n🎉 Test users created successfully!");
    console.log("   Ready to run: node test-day2-equipment-api.js");
    
    return true;
    
  } catch (error) {
    console.log(`\n❌ Failed to create test users: ${error.message}`);
    console.log("Stack trace:", error.stack);
    return false;
  }
}

createTestUsers().then(success => {
  process.exit(success ? 0 : 1);
});