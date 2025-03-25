import prisma from '@/lib/prisma';

export async function checkAndUpdateDeals() {
  try {
    const now = new Date();

    // Update product-level deals
    await prisma.product.updateMany({
      where: {
        isLimitedTimeDeal: true,
        OR: [
          { dealEndTime: { lte: now } },
          {
            AND: [
              { dealQuantityLimit: { not: null } },
              { stock: { lte: 0 } }
            ]
          }
        ]
      },
      data: {
        isLimitedTimeDeal: false,
        dealStartTime: null,
        dealEndTime: null,
        dealQuantityLimit: null
      }
    });

    // Update size-level deals
    await prisma.productSize.updateMany({
      where: {
        isLimitedTimeDeal: true,
        OR: [
          { dealEndTime: { lte: now } },
          {
            AND: [
              { dealQuantityLimit: { not: null } },
              { stock: { lte: 0 } }
            ]
          }
        ]
      },
      data: {
        isLimitedTimeDeal: false,
        dealStartTime: null,
        dealEndTime: null,
        dealQuantityLimit: null
      }
    });

    console.log('Limited time deals updated successfully');
  } catch (error) {
    console.error('Error updating limited time deals:', error);
  }
}

export async function startDealMonitoring(intervalMinutes = 1) {
  // Initial check
  await checkAndUpdateDeals();

  // Set up periodic monitoring
  const interval = setInterval(checkAndUpdateDeals, intervalMinutes * 60 * 1000);

  return interval;
}