const contactService = require('../services/contact.service');

const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await contactService.getAllContacts();
    res.json({
      success: true,
      data: contacts
    });
  } catch (error) {
    next(error);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await contactService.getContactById(id);
    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

const createContact = async (req, res, next) => {
  try {
    const contact = await contactService.createContact(req.body);
    res.status(201).json({
      success: true,
      data: contact,
      message: 'Contact message sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

const updateContactStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const contact = await contactService.updateContactStatus(id, status);
    res.json({
      success: true,
      data: contact,
      message: 'Contact status updated'
    });
  } catch (error) {
    next(error);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    await contactService.deleteContact(id);
    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContactStatus,
  deleteContact
};

