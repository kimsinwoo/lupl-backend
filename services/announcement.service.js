const { prisma } = require('../config/database');

const getAllAnnouncements = async (type) => {
  const where = type ? { type } : {};
  
  return await prisma.announcement.findMany({
    where,
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const getFeaturedAnnouncements = async () => {
  return await prisma.announcement.findMany({
    where: { featured: true },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const getAnnouncementById = async (id) => {
  const announcement = await prisma.announcement.findUnique({
    where: { id }
  });

  if (!announcement) {
    throw new Error('Announcement not found');
  }

  return announcement;
};

const createAnnouncement = async (data) => {
  return await prisma.announcement.create({
    data
  });
};

const updateAnnouncement = async (id, data) => {
  const announcement = await prisma.announcement.findUnique({
    where: { id }
  });

  if (!announcement) {
    throw new Error('Announcement not found');
  }

  return await prisma.announcement.update({
    where: { id },
    data
  });
};

const deleteAnnouncement = async (id) => {
  const announcement = await prisma.announcement.findUnique({
    where: { id }
  });

  if (!announcement) {
    throw new Error('Announcement not found');
  }

  await prisma.announcement.delete({
    where: { id }
  });
};

module.exports = {
  getAllAnnouncements,
  getFeaturedAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
};

