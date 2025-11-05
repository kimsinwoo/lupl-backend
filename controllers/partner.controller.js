const partnerService = require('../services/partner.service');

const getAllPartners = async (req, res, next) => {
  try {
    const partners = await partnerService.getAllPartners();
    res.json({
      success: true,
      data: partners
    });
  } catch (error) {
    next(error);
  }
};

const getPartnerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const partner = await partnerService.getPartnerById(id);
    res.json({
      success: true,
      data: partner
    });
  } catch (error) {
    next(error);
  }
};

const createPartner = async (req, res, next) => {
  try {
    const partner = await partnerService.createPartner(req.body);
    res.status(201).json({
      success: true,
      data: partner,
      message: 'Partner created successfully'
    });
  } catch (error) {
    next(error);
  }
};

const updatePartner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const partner = await partnerService.updatePartner(id, req.body);
    res.json({
      success: true,
      data: partner,
      message: 'Partner updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const deletePartner = async (req, res, next) => {
  try {
    const { id } = req.params;
    await partnerService.deletePartner(id);
    res.json({
      success: true,
      message: 'Partner deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner
};

