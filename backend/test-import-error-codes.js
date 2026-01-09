// Test importing error codes route
console.log('Testing error codes route import...');

try {
  const errorCodeRoute = await import('./src/routes/errorCodes.js');
  console.log('✅ Error codes route imported successfully');
  console.log('Route type:', typeof errorCodeRoute.default);
  console.log('Route methods:', Object.getOwnPropertyNames(errorCodeRoute.default));
} catch (error) {
  console.error('❌ Error importing error codes route:', error);
}