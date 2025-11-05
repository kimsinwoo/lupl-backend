const { prisma } = require('../config/database');

const getAllContacts = async () => {
  return await prisma.contact.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const getContactById = async (id) => {
  const contact = await prisma.contact.findUnique({
    where: { id }
  });

  if (!contact) {
    throw new Error('Contact not found');
  }

  return contact;
};

const createContact = async (data) => {
  return await prisma.contact.create({
    data
  });
};

const updateContactStatus = async (id, status) => {
  const contact = await prisma.contact.findUnique({
    where: { id }
  });

  if (!contact) {
    throw new Error('Contact not found');
  }

  return await prisma.contact.update({
    where: { id },
    data: { status }
  });
};

const deleteContact = async (id) => {
  const contact = await prisma.contact.findUnique({
    where: { id }
  });

  if (!contact) {
    throw new Error('Contact not found');
  }

  await prisma.contact.delete({
    where: { id }
  });
};

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContactStatus,
  deleteContact
};

