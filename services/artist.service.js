const { prisma } = require('../config/database');

const getAllArtists = async () => {
  return await prisma.artist.findMany({
    include: {
      products: {
        where: { status: 'active' }
      },
      _count: {
        select: { products: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const getArtistById = async (id) => {
  const artist = await prisma.artist.findUnique({
    where: { id },
    include: {
      products: {
        include: {
          category: true,
          variants: true
        }
      }
    }
  });

  if (!artist) {
    throw new Error('Artist not found');
  }

  return artist;
};

const createArtist = async (data) => {
  return await prisma.artist.create({
    data
  });
};

const updateArtist = async (id, data) => {
  const artist = await prisma.artist.findUnique({
    where: { id }
  });

  if (!artist) {
    throw new Error('Artist not found');
  }

  return await prisma.artist.update({
    where: { id },
    data
  });
};

const deleteArtist = async (id) => {
  const artist = await prisma.artist.findUnique({
    where: { id }
  });

  if (!artist) {
    throw new Error('Artist not found');
  }

  await prisma.artist.delete({
    where: { id }
  });
};

module.exports = {
  getAllArtists,
  getArtistById,
  createArtist,
  updateArtist,
  deleteArtist
};

