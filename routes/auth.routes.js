const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/kakao', authController.kakaoLogin);
router.post('/google', authController.googleLogin);
router.post('/naver', authController.naverLogin);

// Email verification endpoints
router.post('/find-id/send-code', authController.sendFindIdVerification);
router.post('/find-id/verify', authController.findUserId);
router.post('/reset-password/send-code', authController.sendResetPasswordVerification);
router.post('/reset-password/verify', authController.resetPasswordWithVerification);

module.exports = router;

