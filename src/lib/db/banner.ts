import prisma from '../prisma';

export const bannerDb = {
  create: async (data: {
    title: string;
    description?: string;
    imageUrl: string;
    link?: string;
    status?: string;
    displayOrder?: number;
  }) => {
    return prisma.Banner.create({
      data
    });
  },

  update: async (id: string, data: {
    title?: string;
    description?: string;
    imageUrl?: string;
    link?: string;
    status?: string;
    displayOrder?: number;
  }) => {
    return prisma.banner.update({
      where: { id },
      data
    });
  },

  delete: async (id: string) => {
    return prisma.banner.delete({
      where: { id }
    });
  },

  getAll: async () => {
    return prisma.banner.findMany({
      orderBy: {
        displayOrder: 'asc'
      }
    });
  },

  getById: async (id: string) => {
    return prisma.banner.findUnique({
      where: { id }
    });
  },

  getActive: async () => {
    return prisma.banner.findMany({
      where: {
        status: 'active'
      },
      orderBy: {
        displayOrder: 'asc'
      }
    });
  }
};