const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcement.controller');

router.get('/', announcementController.getAllAnnouncements);
router.get('/featured', announcementController.getFeaturedAnnouncements);
router.get('/:id', announcementController.getAnnouncementById);
router.post('/', announcementController.createAnnouncement);
router.put('/:id', announcementController.updateAnnouncement);
router.delete('/:id', announcementController.deleteAnnouncement);

module.exports = router;

