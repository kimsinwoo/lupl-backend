const { prisma } = require('../config/database');

const getAllPartners = async () => {
  return await prisma.partner.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const getPartnerById = async (id) => {
  const partner = await prisma.partner.findUnique({
    where: { id }
  });

  if (!partner) {
    throw new Error('Partner not found');
  }

  return partner;
};

const createPartner = async (data) => {
  return await prisma.partner.create({
    data
  });
};

const updatePartner = async (id, data) => {
  const partner = await prisma.partner.findUnique({
    where: { id }
  });

  if (!partner) {
    throw new Error('Partner not found');
  }

  return await prisma.partner.update({
    where: { id },
    data
  });
};

const deletePartner = async (id) => {
  const partner = await prisma.partner.findUnique({
    where: { id }
  });

  if (!partner) {
    throw new Error('Partner not found');
  }

  await prisma.partner.delete({
    where: { id }
  });
};

module.exports = {
  getAllPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner
};

