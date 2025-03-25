import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

// Ensure the database connection is established
prisma.$connect()
  .then(() => {
    console.log('Database connection established successfully');
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    // Instead of exiting, we'll keep the process running but log the error
    // This allows the API to return proper JSON responses even when DB is down
    console.error('Database is unavailable, API will return error responses');
  });

export default prisma;
