// Day 1 Verification Test - Equipment Management Foundation
import dotenv from 'dotenv';
dotenv.config();

console.log("🧪 Day 1 Verification Test - Equipment Management Foundation\n");

async function verifyDay1() {
  try {
    const { query } = await import("./src/db/postgres.js");
    
    console.log("1️⃣ Database Connection Test...");
    const version = await query("SELECT version()");
    console.log(`   ✅ Connected: ${version.rows[0].version.split(' ')[0]} ${version.rows[0].version.split(' ')[1]}`);
    
    console.log("\n2️⃣ Equipment Tables Test...");
    const equipmentCount = await query('SELECT COUNT(*) FROM equipment');
    const categoriesCount = await query('SELECT COUNT(*) FROM equipment_categories');
    const locationsCount = await query('SELECT COUNT(*) FROM equipment_locations');
    
    console.log(`   ✅ Equipment Records: ${equipmentCount.rows[0].count}`);
    console.log(`   ✅ Equipment Categories: ${categoriesCount.rows[0].count}`);
    console.log(`   ✅ Equipment Locations: ${locationsCount.rows[0].count}`);
    
    console.log("\n3️⃣ Demo Users Test...");
    const users = await query(`
      SELECT username, equipment_role, accessible_plants, department 
      FROM users 
      WHERE equipment_role IS NOT NULL
      ORDER BY equipment_role
    `);
    
    console.log(`   ✅ Equipment Users: ${users.rows.length}`);
    users.rows.forEach(user => {
      const plants = user.accessible_plants ? user.accessible_plants.join(', ') : 'None';
      console.log(`      - ${user.username} (${user.equipment_role}) - Plants: ${plants}`);
    });
    
    console.log("\n4️⃣ Equipment Query Test...");
    const equipmentQuery = await query(`
      SELECT e.equipment_number, e.name, el.plant, el.area, e.operational_state
      FROM equipment e
      LEFT JOIN equipment_locations el ON e.location_id = el.id
      WHERE e.operational_state = 'OPERATIONAL'
      LIMIT 3
    `);
    
    console.log(`   ✅ Operational Equipment: ${equipmentQuery.rows.length} results`);
    equipmentQuery.rows.forEach(eq => {
      console.log(`      - ${eq.equipment_number}: ${eq.name} (${eq.plant}-${eq.area})`);
    });
    
    console.log("\n5️⃣ Maintenance Records Test...");
    const maintenance = await query(`
      SELECT mr.work_order_number, mr.work_type, mr.status, e.equipment_number
      FROM maintenance_records mr
      JOIN equipment e ON mr.equipment_id = e.id
      LIMIT 3
    `);
    
    console.log(`   ✅ Maintenance Records: ${maintenance.rows.length} results`);
    maintenance.rows.forEach(mr => {
      console.log(`      - ${mr.work_order_number}: ${mr.equipment_number} (${mr.work_type}) - ${mr.status}`);
    });
    
    console.log("\n6️⃣ Enterprise Simulation Test...");
    const sapCount = await query('SELECT COUNT(*) FROM sap_equipment_master');
    const maximoCount = await query('SELECT COUNT(*) FROM maximo_work_orders');
    const mesCount = await query('SELECT COUNT(*) FROM mes_production_data');
    const scadaCount = await query('SELECT COUNT(*) FROM scada_status_data');
    
    console.log(`   ✅ SAP Equipment Master: ${sapCount.rows[0].count} records`);
    console.log(`   ✅ Maximo Work Orders: ${maximoCount.rows[0].count} records`);
    console.log(`   ✅ MES Production Data: ${mesCount.rows[0].count} records`);
    console.log(`   ✅ SCADA Status Data: ${scadaCount.rows[0].count} records`);
    
    console.log("\n🎉 Day 1 Verification PASSED!");
    console.log("✅ Equipment Management Foundation is solid and ready for Day 2");
    
    return true;
    
  } catch (error) {
    console.log(`\n❌ Day 1 Verification FAILED: ${error.message}`);
    return false;
  }
}

verifyDay1().then(success => {
  if (success) {
    console.log("\n🚀 Ready to proceed to Day 2: Equipment Service Layer & API");
  } else {
    console.log("\n⚠️  Please fix Day 1 issues before proceeding to Day 2");
  }
  process.exit(success ? 0 : 1);
});