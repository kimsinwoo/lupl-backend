const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const { email, password, name, phone } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    const user = await authService.register(email, password, name, phone);
    res.status(201).json({
      success: true,
      data: { user },
      message: 'User registered successfully'
    });
  } catch (error) {
    // Handle known errors with appropriate status codes
    if (error.message === 'Email already registered') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    // Handle validation errors
    if (error.message.includes('required') || error.message.includes('Failed to register')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    // Pass other errors to error handling middleware
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login request for email:', email);
    const result = await authService.login(email, password);
    
    console.log('✅ Login successful - Response data:', {
      userId: result.user?.id,
      email: result.user?.email,
      name: result.user?.name,
      phone: result.user?.phone,
      hasAddress: !!result.user?.address,
      address: result.user?.address
    });
    
    res.json({
      success: true,
      data: result,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    next(error);
  }
};

const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    res.json({
      success: true,
      message: 'Password reset link sent to your email'
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);
    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

const kakaoLogin = async (req, res, next) => {
  try {
    const { accessToken, code, state, redirectUri } = req.body;
    
    console.log('🔵 Kakao Login Request:', { hasCode: !!code, hasState: !!state, hasAccessToken: !!accessToken, hasRedirectUri: !!redirectUri });
    
    // OAuth 코드로부터 access token을 받는 경우 (백엔드에서 처리)
    if (code && state) {
      console.log('🔄 Kakao: Exchanging code for access token...');
      const accessTokenFromCode = await authService.getKakaoAccessTokenFromCode(code, state, redirectUri);
      console.log('✅ Kakao: Access token received, getting user info...');
      const result = await authService.kakaoLogin(accessTokenFromCode);
      console.log('✅ Kakao login successful - Response data:', {
        userId: result.user?.id,
        email: result.user?.email,
        name: result.user?.name,
        phone: result.user?.phone,
        hasAddress: !!result.user?.address,
        address: result.user?.address
      });
      res.json({
        success: true,
        data: result,
        message: 'Kakao login successful'
      });
      return;
    }
    
    // 직접 access token을 받는 경우
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Access token or code is required'
      });
    }
    
    console.log('🔄 Kakao: Using direct access token...');
    const result = await authService.kakaoLogin(accessToken);
    console.log('✅ Kakao login successful - Response data:', {
      userId: result.user?.id,
      email: result.user?.email,
      name: result.user?.name,
      phone: result.user?.phone,
      hasAddress: !!result.user?.address,
      address: result.user?.address
    });
    res.json({
      success: true,
      data: result,
      message: 'Kakao login successful'
    });
  } catch (error) {
    console.error('❌ Kakao login error:', error.message);
    console.error('❌ Kakao login error stack:', error.stack);
    next(error);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'ID token is required'
      });
    }
    const result = await authService.googleLogin(idToken);
    console.log('✅ Google login successful - Response data:', {
      userId: result.user?.id,
      email: result.user?.email,
      name: result.user?.name,
      phone: result.user?.phone,
      hasAddress: !!result.user?.address,
      address: result.user?.address
    });
    res.json({
      success: true,
      data: result,
      message: 'Google login successful'
    });
  } catch (error) {
    next(error);
  }
};

const naverLogin = async (req, res, next) => {
  try {
    const { accessToken, code, state, redirectUri } = req.body;
    
    console.log('🟢 Naver Login Request:', { hasCode: !!code, hasState: !!state, hasAccessToken: !!accessToken, hasRedirectUri: !!redirectUri });
    
    // OAuth 코드로부터 access token을 받는 경우 (백엔드에서 처리)
    if (code && state) {
      console.log('🔄 Naver: Exchanging code for access token...');
      const accessTokenFromCode = await authService.getNaverAccessTokenFromCode(code, state, redirectUri);
      console.log('✅ Naver: Access token received, getting user info...');
      const result = await authService.naverLogin(accessTokenFromCode);
      console.log('✅ Naver login successful - Response data:', {
        userId: result.user?.id,
        email: result.user?.email,
        name: result.user?.name,
        phone: result.user?.phone,
        hasAddress: !!result.user?.address,
        address: result.user?.address
      });
      res.json({
        success: true,
        data: result,
        message: 'Naver login successful'
      });
      return;
    }
    
    // 직접 access token을 받는 경우
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Access token or code is required'
      });
    }
    
    console.log('🔄 Naver: Using direct access token...');
    const result = await authService.naverLogin(accessToken);
    console.log('✅ Naver login successful - Response data:', {
      userId: result.user?.id,
      email: result.user?.email,
      name: result.user?.name,
      phone: result.user?.phone,
      hasAddress: !!result.user?.address,
      address: result.user?.address
    });
    res.json({
      success: true,
      data: result,
      message: 'Naver login successful'
    });
  } catch (error) {
    console.error('❌ Naver login error:', error.message);
    console.error('❌ Naver login error stack:', error.stack);
    next(error);
  }
};

// Send verification code for finding user ID
const sendFindIdVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    await authService.sendFindIdVerification(email);
    res.json({
      success: true,
      message: 'Verification code sent to your email'
    });
  } catch (error) {
    console.error('❌ Error in sendFindIdVerification:', error);
    const statusCode = error.message.includes('migration') ? 503 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to send verification code'
    });
  }
};

// Find user ID after verification
const findUserId = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const result = await authService.findUserId(email, code);
    res.json({
      success: true,
      data: result,
      message: 'User ID found'
    });
  } catch (error) {
    next(error);
  }
};

// Send verification code for password reset
const sendResetPasswordVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.sendResetPasswordVerification(email);
    res.json({
      success: true,
      message: 'Verification code sent to your email'
    });
  } catch (error) {
    next(error);
  }
};

// Reset password after verification
const resetPasswordWithVerification = async (req, res, next) => {
  try {
    const { email, code, password } = req.body;
    await authService.resetPasswordWithVerification(email, code, password);
    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await authService.getProfile(userId);
    res.json({
      success: true,
      data: user,
      message: 'Profile retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log('📝 Update profile request:', {
      userId,
      body: req.body
    });
    
    const user = await authService.updateProfile(userId, req.body);
    
    console.log('✅ Profile updated successfully:', {
      userId: user.id,
      name: user.name,
      phone: user.phone
    });
    
    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('❌ Failed to update profile:', error);
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  kakaoLogin,
  googleLogin,
  naverLogin,
  sendFindIdVerification,
  findUserId,
  sendResetPasswordVerification,
  resetPasswordWithVerification,
  getProfile,
  updateProfile
};

