const announcementService = require('../services/announcement.service');

const getAllAnnouncements = async (req, res, next) => {
  try {
    const { type } = req.query;
    const announcements = await announcementService.getAllAnnouncements(type);
    res.json({
      success: true,
      data: announcements
    });
  } catch (error) {
    next(error);
  }
};

const getFeaturedAnnouncements = async (req, res, next) => {
  try {
    const announcements = await announcementService.getFeaturedAnnouncements();
    res.json({
      success: true,
      data: announcements
    });
  } catch (error) {
    next(error);
  }
};

const getAnnouncementById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const announcement = await announcementService.getAnnouncementById(id);
    res.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    next(error);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const announcement = await announcementService.createAnnouncement(req.body);
    res.status(201).json({
      success: true,
      data: announcement,
      message: 'Announcement created successfully'
    });
  } catch (error) {
    next(error);
  }
};

const updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const announcement = await announcementService.updateAnnouncement(id, req.body);
    res.json({
      success: true,
      data: announcement,
      message: 'Announcement updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    await announcementService.deleteAnnouncement(id);
    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAnnouncements,
  getFeaturedAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
};

