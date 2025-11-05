const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    // JWT 토큰 확인
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    // 세션 기반 인증도 지원 (KITAE 스타일)
    if (req.session && req.session.isAuthenticated && req.session.userId) {
      const user = await prisma.user.findUnique({
        where: { id: req.session.userId }
      });
      if (user) {
        req.user = user;
        return next();
      }
    }
    
    // JWT 토큰이 있으면 확인
    if (token) {
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({
          success: false,
          message: 'JWT_SECRET is not configured'
        });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      req.user = user;
      return next();
    }
    
    // 둘 다 없으면 에러
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please login.'
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    next(error);
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware
};

