import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


async function testConnection() {
  try {
    console.log('Testing MongoDB Connection...');
    
    // Check environment variables
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set in .env file');
    }
    console.log('✅ Environment variables are configured');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Successfully connected to MongoDB');
    
    // Perform a test query
    const userCount = await prisma.user.count();
    console.log(`✅ Database is accessible (Users count: ${userCount})`);
    
    await prisma.$disconnect();
    console.log('✅ Successfully disconnected from MongoDB');
    
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return false;
  }
}

testConnection()
  .then((success) => {
    if (!success) {
      console.log('\nTroubleshooting steps:');
      console.log('1. Verify MongoDB Atlas cluster is running');
      console.log('2. Check if DATABASE_URL in .env is correct');
      console.log('3. Ensure network connectivity to MongoDB Atlas');
      console.log('4. Verify IP address is whitelisted in MongoDB Atlas');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });