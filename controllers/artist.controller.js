const artistService = require('../services/artist.service');

const getAllArtists = async (req, res, next) => {
  try {
    const artists = await artistService.getAllArtists();
    res.json({
      success: true,
      data: artists
    });
  } catch (error) {
    next(error);
  }
};

const getArtistById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const artist = await artistService.getArtistById(id);
    res.json({
      success: true,
      data: artist
    });
  } catch (error) {
    next(error);
  }
};

const createArtist = async (req, res, next) => {
  try {
    const artist = await artistService.createArtist(req.body);
    res.status(201).json({
      success: true,
      data: artist,
      message: 'Artist created successfully'
    });
  } catch (error) {
    next(error);
  }
};

const updateArtist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const artist = await artistService.updateArtist(id, req.body);
    res.json({
      success: true,
      data: artist,
      message: 'Artist updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const deleteArtist = async (req, res, next) => {
  try {
    const { id } = req.params;
    await artistService.deleteArtist(id);
    res.json({
      success: true,
      message: 'Artist deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllArtists,
  getArtistById,
  createArtist,
  updateArtist,
  deleteArtist
};

