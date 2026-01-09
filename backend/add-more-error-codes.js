import './src/bootstrap.js';
import { query } from './src/db/postgres.js';

const additionalErrorCodes = [
  // Conveyor System Errors
  {
    code: 'CONV007',
    equipment_id: '770e8400-e29b-41d4-a716-446655440004',
    severity_level: 'HIGH',
    title: 'Belt Tension Too High',
    description: 'Conveyor belt tension exceeds recommended specifications',
    category: 'Mechanical',
    frequency_count: 19,
    avg_resolution_time_minutes: 35
  },
  {
    code: 'CONV008',
    equipment_id: '770e8400-e29b-41d4-a716-446655440004',
    severity_level: 'MEDIUM',
    title: 'Idler Roller Seized',
    description: 'One or more idler rollers are not rotating freely',
    category: 'Mechanical',
    frequency_count: 16,
    avg_resolution_time_minutes: 40
  },
  {
    code: 'CONV009',
    equipment_id: '770e8400-e29b-41d4-a716-446655440003',
    severity_level: 'LOW',
    title: 'Belt Cleaner Worn',
    description: 'Belt cleaning system requires maintenance or replacement',
    category: 'Maintenance',
    frequency_count: 28,
    avg_resolution_time_minutes: 20
  },
  {
    code: 'CONV010',
    equipment_id: '770e8400-e29b-41d4-a716-446655440003',
    severity_level: 'CRITICAL',
    title: 'Emergency Stop Triggered',
    description: 'Conveyor emergency stop activated due to safety concern',
    category: 'Safety',
    frequency_count: 5,
    avg_resolution_time_minutes: 10
  },

  // Pump System Errors
  {
    code: 'PUMP007',
    equipment_id: '770e8400-e29b-41d4-a716-446655440001',
    severity_level: 'HIGH',
    title: 'Bearing Overheating',
    description: 'Pump bearing temperature exceeds safe operating limits',
    category: 'Thermal',
    frequency_count: 13,
    avg_resolution_time_minutes: 60
  },
  {
    code: 'PUMP008',
    equipment_id: '770e8400-e29b-41d4-a716-446655440002',
    severity_level: 'MEDIUM',
    title: 'Pressure Fluctuation',
    description: 'Pump discharge pressure showing irregular fluctuations',
    category: 'Performance',
    frequency_count: 21,
    avg_resolution_time_minutes: 30
  },
  {
    code: 'PUMP009',
    equipment_id: '770e8400-e29b-41d4-a716-446655440001',
    severity_level: 'LOW',
    title: 'Coupling Misalignment',
    description: 'Motor-pump coupling shows signs of misalignment',
    category: 'Mechanical',
    frequency_count: 8,
    avg_resolution_time_minutes: 45
  },
  {
    code: 'PUMP010',
    equipment_id: '770e8400-e29b-41d4-a716-446655440002',
    severity_level: 'CRITICAL',
    title: 'Suction Line Blockage',
    description: 'Complete or partial blockage in pump suction line',
    category: 'Mechanical',
    frequency_count: 3,
    avg_resolution_time_minutes: 90
  },

  // Electrical System Errors
  {
    code: 'ELEC001',
    equipment_id: null,
    severity_level: 'HIGH',
    title: 'Phase Imbalance',
    description: 'Three-phase power supply showing voltage imbalance',
    category: 'Electrical',
    frequency_count: 11,
    avg_resolution_time_minutes: 50
  },
  {
    code: 'ELEC002',
    equipment_id: null,
    severity_level: 'CRITICAL',
    title: 'Ground Fault Detected',
    description: 'Ground fault circuit interrupter has been triggered',
    category: 'Electrical',
    frequency_count: 4,
    avg_resolution_time_minutes: 75
  },
  {
    code: 'ELEC003',
    equipment_id: '770e8400-e29b-41d4-a716-446655440005',
    severity_level: 'MEDIUM',
    title: 'Motor Overheating',
    description: 'Electric motor temperature above normal operating range',
    category: 'Thermal',
    frequency_count: 17,
    avg_resolution_time_minutes: 40
  },
  {
    code: 'ELEC004',
    equipment_id: null,
    severity_level: 'LOW',
    title: 'Harmonic Distortion',
    description: 'Power quality issues due to harmonic distortion',
    category: 'Electrical',
    frequency_count: 9,
    avg_resolution_time_minutes: 30
  },

  // Hydraulic System Errors
  {
    code: 'HYD001',
    equipment_id: null,
    severity_level: 'HIGH',
    title: 'System Pressure Low',
    description: 'Hydraulic system pressure below minimum operating level',
    category: 'Hydraulic',
    frequency_count: 14,
    avg_resolution_time_minutes: 55
  },
  {
    code: 'HYD002',
    equipment_id: null,
    severity_level: 'CRITICAL',
    title: 'Fluid Contamination',
    description: 'Hydraulic fluid contaminated with water or particles',
    category: 'Hydraulic',
    frequency_count: 6,
    avg_resolution_time_minutes: 120
  },
  {
    code: 'HYD003',
    equipment_id: null,
    severity_level: 'MEDIUM',
    title: 'Cylinder Drift',
    description: 'Hydraulic cylinder not maintaining position under load',
    category: 'Hydraulic',
    frequency_count: 12,
    avg_resolution_time_minutes: 35
  },
  {
    code: 'HYD004',
    equipment_id: null,
    severity_level: 'LOW',
    title: 'Filter Bypass',
    description: 'Hydraulic filter bypass indicator activated',
    category: 'Maintenance',
    frequency_count: 20,
    avg_resolution_time_minutes: 25
  },

  // Pneumatic System Errors
  {
    code: 'PNEU001',
    equipment_id: null,
    severity_level: 'MEDIUM',
    title: 'Air Pressure Drop',
    description: 'Compressed air system pressure dropping below setpoint',
    category: 'Pneumatic',
    frequency_count: 15,
    avg_resolution_time_minutes: 30
  },
  {
    code: 'PNEU002',
    equipment_id: null,
    severity_level: 'HIGH',
    title: 'Compressor Overload',
    description: 'Air compressor motor drawing excessive current',
    category: 'Electrical',
    frequency_count: 7,
    avg_resolution_time_minutes: 60
  },
  {
    code: 'PNEU003',
    equipment_id: null,
    severity_level: 'LOW',
    title: 'Moisture in Lines',
    description: 'Excessive moisture detected in pneumatic lines',
    category: 'Pneumatic',
    frequency_count: 23,
    avg_resolution_time_minutes: 20
  },
  {
    code: 'PNEU004',
    equipment_id: null,
    severity_level: 'CRITICAL',
    title: 'Safety Valve Stuck',
    description: 'Pneumatic safety relief valve not operating properly',
    category: 'Safety',
    frequency_count: 2,
    avg_resolution_time_minutes: 45
  },

  // Sensor and Instrumentation Errors
  {
    code: 'SENS001',
    equipment_id: null,
    severity_level: 'MEDIUM',
    title: 'Proximity Sensor Fault',
    description: 'Proximity sensor not detecting target consistently',
    category: 'Sensor',
    frequency_count: 18,
    avg_resolution_time_minutes: 25
  },
  {
    code: 'SENS002',
    equipment_id: null,
    severity_level: 'HIGH',
    title: 'Pressure Transducer Error',
    description: 'Pressure measurement device showing erratic readings',
    category: 'Sensor',
    frequency_count: 10,
    avg_resolution_time_minutes: 40
  },
  {
    code: 'SENS003',
    equipment_id: null,
    severity_level: 'LOW',
    title: 'Level Switch Drift',
    description: 'Liquid level switch activation point has drifted',
    category: 'Calibration',
    frequency_count: 13,
    avg_resolution_time_minutes: 35
  },
  {
    code: 'SENS004',
    equipment_id: null,
    severity_level: 'CRITICAL',
    title: 'Safety Light Curtain Fault',
    description: 'Safety light curtain system not functioning properly',
    category: 'Safety',
    frequency_count: 1,
    avg_resolution_time_minutes: 15
  },

  // HVAC System Errors
  {
    code: 'HVAC001',
    equipment_id: null,
    severity_level: 'MEDIUM',
    title: 'Filter Restriction High',
    description: 'HVAC air filter showing high pressure differential',
    category: 'Maintenance',
    frequency_count: 26,
    avg_resolution_time_minutes: 15
  },
  {
    code: 'HVAC002',
    equipment_id: null,
    severity_level: 'HIGH',
    title: 'Cooling System Fault',
    description: 'Industrial cooling system not maintaining temperature',
    category: 'Thermal',
    frequency_count: 8,
    avg_resolution_time_minutes: 90
  },
  {
    code: 'HVAC003',
    equipment_id: null,
    severity_level: 'LOW',
    title: 'Ventilation Fan Vibration',
    description: 'Exhaust fan showing increased vibration levels',
    category: 'Mechanical',
    frequency_count: 14,
    avg_resolution_time_minutes: 30
  }
];

async function addErrorCodes() {
  console.log('🚀 Adding additional error codes...');
  
  try {
    for (const errorCode of additionalErrorCodes) {
      const insertQuery = `
        INSERT INTO error_codes (
          code, equipment_id, severity_level, title, description, 
          category, frequency_count, avg_resolution_time_minutes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (code) DO NOTHING
      `;
      
      await query(insertQuery, [
        errorCode.code,
        errorCode.equipment_id,
        errorCode.severity_level,
        errorCode.title,
        errorCode.description,
        errorCode.category,
        errorCode.frequency_count,
        errorCode.avg_resolution_time_minutes
      ]);
      
      console.log(`✅ Added error code: ${errorCode.code}`);
    }
    
    // Get final count
    const countResult = await query('SELECT COUNT(*) as total FROM error_codes');
    console.log(`\n🎉 Successfully added error codes! Total error codes: ${countResult.rows[0].total}`);
    
  } catch (error) {
    console.error('❌ Error adding error codes:', error);
  }
}

addErrorCodes();