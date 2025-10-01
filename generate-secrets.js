// Generate secure JWT secrets for production
const crypto = require('crypto');

console.log('='.repeat(60));
console.log('🔐 JWT SECRETS FOR PRODUCTION DEPLOYMENT');
console.log('='.repeat(60));
console.log();

console.log('JWT_SECRET:');
console.log(crypto.randomBytes(64).toString('hex'));
console.log();

console.log('JWT_REFRESH_SECRET:');
console.log(crypto.randomBytes(64).toString('hex'));
console.log();

console.log('='.repeat(60));
console.log('⚠️  IMPORTANT: Keep these secrets secure!');
console.log('   - Never commit them to version control');
console.log('   - Use different secrets for each environment');
console.log('   - Store them securely in Render environment variables');
console.log('='.repeat(60));
