const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { prisma } = require('../config/database');
const emailService = require('./email.service');

const register = async (email, password, name, phone) => {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // Create user with error handling for unique constraint violations
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    return user;
  } catch (error) {
    // Handle Prisma unique constraint violation
    if (error.code === 'P2002') {
      // Unique constraint failed
      throw new Error('Email already registered');
    }
    // Re-throw if it's already a custom error
    if (error.message === 'Email already registered') {
      throw error;
    }
    // Handle other Prisma errors
    console.error('Registration error:', error);
    throw new Error('Failed to register user');
  }
};

const login = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.password) {
    throw new Error('Please register first');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set in environment variables');
  }
  if (!process.env.JWT_EXPIRES_IN) {
    throw new Error('JWT_EXPIRES_IN is not set in environment variables');
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token
  };
};

const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return true;
};

const resetPassword = async (token, password) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set in environment variables');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword }
    });

    return true;
  } catch (error) {
    throw new Error('Invalid or expired reset token');
  }
};

const getKakaoAccessTokenFromCode = async (code, state, redirectUri) => {
  try {
    const axios = require('axios');
    const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;
    const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET;
    
    if (!KAKAO_REST_API_KEY) {
      throw new Error('KAKAO_REST_API_KEY is not set in environment variables');
    }
    if (!KAKAO_CLIENT_SECRET) {
      throw new Error('KAKAO_CLIENT_SECRET is not set in environment variables');
    }
    
    // redirectUri가 제공되면 사용, 없으면 환경 변수 사용
    const KAKAO_REDIRECT_URI = redirectUri || process.env.KAKAO_REDIRECT_URI;
    if (!KAKAO_REDIRECT_URI) {
      throw new Error('KAKAO_REDIRECT_URI is not set in environment variables and redirectUri parameter is not provided');
    }

    console.log('🔑 Kakao Token Exchange:', {
      hasRedirectUri: !!redirectUri,
      redirectUri: KAKAO_REDIRECT_URI,
      hasCode: !!code,
      hasState: !!state,
      clientId: KAKAO_REST_API_KEY.substring(0, 10) + '...'
    });

    // 카카오 토큰 교환 파라미터 (client_secret 포함)
    const tokenParams = {
      grant_type: 'authorization_code',
      client_id: KAKAO_REST_API_KEY,
      redirect_uri: KAKAO_REDIRECT_URI,
      code: code
    };

    // client_secret 추가 (카카오는 선택사항이지만 일부 설정에서는 필요)
    if (KAKAO_CLIENT_SECRET) {
      tokenParams.client_secret = KAKAO_CLIENT_SECRET;
    }

    const response = await axios.post('https://kauth.kakao.com/oauth/token', null, {
      params: tokenParams,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    });

    if (response.data.access_token) {
      console.log('✅ Kakao: Access token received successfully');
      return response.data.access_token;
    } else {
      throw new Error(response.data.error_description || 'Failed to get access token');
    }
  } catch (error) {
    console.error('❌ Kakao Token Exchange Error:', {
      message: error.message,
      responseData: error.response?.data,
      redirectUri: redirectUri || process.env.KAKAO_REDIRECT_URI
    });
    throw new Error('카카오 Access Token 가져오기 실패: ' + (error.response?.data?.error_description || error.message));
  }
};

const kakaoLogin = async (accessToken) => {
  try {
    console.log('🔄 Kakao: Fetching user info from Kakao API...');
    
    // 카카오 사용자 정보 가져오기
    const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const kakaoUser = response.data;
    console.log('📦 Kakao User Data:', { 
      id: kakaoUser.id, 
      hasEmail: !!kakaoUser.kakao_account?.email,
      hasNickname: !!kakaoUser.kakao_account?.profile?.nickname 
    });
    
    const providerId = kakaoUser.id?.toString();
    // 카카오는 profile_nickname만 동의하는 경우 이메일이 없을 수 있음
    const email = kakaoUser.kakao_account?.email;
    const nickname = kakaoUser.kakao_account?.profile?.nickname || kakaoUser.properties?.nickname;
    const profileImage = kakaoUser.kakao_account?.profile?.profile_image_url;

    if (!providerId) {
      throw new Error('카카오 사용자 ID를 가져올 수 없습니다');
    }

    // 이메일이 없으면 providerId 기반 임시 이메일 생성
    // 카카오는 이메일 동의가 필수가 아니므로 임시 이메일 사용
    const userEmail = email || `kakao_${providerId}@temp.kakao`;
    console.log('📧 Kakao User Email:', userEmail);

    // provider와 providerId로 기존 사용자 찾기
    // 이메일이 있으면 email로, 없으면 providerId로만 검색
    let user = await prisma.user.findFirst({
      where: {
        OR: email 
          ? [
              { email: userEmail },
              { provider: 'kakao', providerId }
            ]
          : [
              { provider: 'kakao', providerId }
            ]
      }
    });

    if (!user) {
      try {
        console.log('📝 Kakao: Creating new user in database...');
        user = await prisma.user.create({
          data: {
            email: userEmail,
            name: nickname,
            password: null,
            phone: null,
            provider: 'kakao',
            providerId,
            profileImage
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            provider: true,
            providerId: true,
            profileImage: true,
            createdAt: true
          }
        });
        console.log('✅ Kakao: User created successfully:', user.id, user.email);
      } catch (createError) {
        console.error('❌ Kakao: User creation error:', createError.message);
        console.error('❌ Kakao: User creation error code:', createError.code);
        // Handle race condition: user might have been created between findUnique and create
        if (createError.code === 'P2002') {
          // Unique constraint violation - user was created by another request
          user = await prisma.user.findFirst({
            where: {
              OR: email
                ? [
                    { email: userEmail },
                    { provider: 'kakao', providerId }
                  ]
                : [
                    { provider: 'kakao', providerId }
                  ]
            },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              provider: true,
              providerId: true,
              profileImage: true,
              createdAt: true
            }
          });
        } else {
          throw createError;
        }
      }
    } else {
      // 기존 사용자 정보 업데이트 (소셜 정보가 최신화되었을 수 있음)
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          provider: 'kakao',
          providerId,
          name: nickname || user.name,
          profileImage: profileImage || user.profileImage
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          provider: true,
          providerId: true,
          profileImage: true,
          createdAt: true
        }
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set in environment variables');
    }
    if (!process.env.JWT_EXPIRES_IN) {
      throw new Error('JWT_EXPIRES_IN is not set in environment variables');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return {
      user,
      token
    };
  } catch (error) {
    throw new Error('카카오 로그인 실패: ' + error.message);
  }
};

const googleLogin = async (idToken) => {
  try {
    // Google 클라이언트 정보 (환경 변수에서 가져오기)
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    if (!GOOGLE_CLIENT_ID) {
      throw new Error('GOOGLE_CLIENT_ID is not set in environment variables');
    }
    
    // Google ID Token 검증 및 사용자 정보 추출
    // 클라이언트 ID를 쿼리 파라미터로 전달하여 검증 (선택사항)
    const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    const googleUser = response.data;
    
    // 클라이언트 ID 검증 (보안 강화)
    if (googleUser.aud !== GOOGLE_CLIENT_ID) {
      throw new Error('Invalid Google client ID');
    }

    const providerId = googleUser.sub;
    const email = googleUser.email;
    const name = googleUser.name;
    const profileImage = googleUser.picture;

    if (!email) {
      throw new Error('이메일 정보가 없습니다');
    }

    if (!providerId) {
      throw new Error('구글 사용자 ID를 가져올 수 없습니다');
    }

    // provider와 providerId로 기존 사용자 찾기
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { provider: 'google', providerId }
        ]
      }
    });

    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            email,
            name: name,
            password: null,
            phone: null,
            provider: 'google',
            providerId,
            profileImage
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            provider: true,
            providerId: true,
            profileImage: true,
            createdAt: true
          }
        });
      } catch (createError) {
        if (createError.code === 'P2002') {
          user = await prisma.user.findFirst({
            where: {
              OR: [
                { email },
                { provider: 'google', providerId }
              ]
            },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              provider: true,
              providerId: true,
              profileImage: true,
              createdAt: true
            }
          });
        } else {
          throw createError;
        }
      }
    } else {
      // 기존 사용자 정보 업데이트
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          provider: 'google',
          providerId,
          name: name || user.name,
          profileImage: profileImage || user.profileImage
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          provider: true,
          providerId: true,
          profileImage: true,
          createdAt: true
        }
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set in environment variables');
    }
    if (!process.env.JWT_EXPIRES_IN) {
      throw new Error('JWT_EXPIRES_IN is not set in environment variables');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return {
      user,
      token
    };
  } catch (error) {
    throw new Error('구글 로그인 실패: ' + error.message);
  }
};

const getNaverAccessTokenFromCode = async (code, state, redirectUri) => {
  try {
    const axios = require('axios');
    // 네이버 클라이언트 정보 (환경 변수에서 가져오기)
    const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
    const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;
    
    if (!NAVER_CLIENT_ID) {
      throw new Error('NAVER_CLIENT_ID is not set in environment variables');
    }
    if (!NAVER_CLIENT_SECRET) {
      throw new Error('NAVER_CLIENT_SECRET is not set in environment variables');
    }
    
    // redirectUri가 제공되면 사용, 없으면 환경 변수 사용
    const NAVER_REDIRECT_URI = redirectUri || process.env.NAVER_REDIRECT_URI;
    if (!NAVER_REDIRECT_URI) {
      throw new Error('NAVER_REDIRECT_URI is not set in environment variables and redirectUri parameter is not provided');
    }

    console.log('🔑 Naver Token Exchange:', {
      hasRedirectUri: !!redirectUri,
      redirectUri: NAVER_REDIRECT_URI,
      hasCode: !!code,
      hasState: !!state
    });

    const response = await axios.post('https://nid.naver.com/oauth2.0/token', null, {
      params: {
        grant_type: 'authorization_code',
        client_id: NAVER_CLIENT_ID,
        client_secret: NAVER_CLIENT_SECRET,
        code: code,
        state: state
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.data.access_token) {
      console.log('✅ Naver: Access token received successfully');
      return response.data.access_token;
    } else {
      throw new Error(response.data.error_description || 'Failed to get access token');
    }
  } catch (error) {
    console.error('❌ Naver Token Exchange Error:', {
      message: error.message,
      responseData: error.response?.data,
      redirectUri: redirectUri || process.env.NAVER_REDIRECT_URI
    });
    throw new Error('네이버 Access Token 가져오기 실패: ' + (error.response?.data?.error_description || error.message));
  }
};

const naverLogin = async (accessToken) => {
  try {
    console.log('🔄 Naver: Fetching user info from Naver API...');
    
    // Naver 사용자 정보 가져오기
    const response = await axios.get('https://openapi.naver.com/v1/nid/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const naverUser = response.data.response;
    console.log('📦 Naver User Data:', { 
      id: naverUser.id, 
      email: naverUser.email,
      name: naverUser.name 
    });
    
    const providerId = naverUser.id;
    const email = naverUser.email;
    const name = naverUser.name;
    const phone = naverUser.mobile?.replace(/-/g, '');
    const profileImage = naverUser.profile_image;

    if (!email) {
      throw new Error('이메일 정보가 없습니다');
    }

    if (!providerId) {
      throw new Error('네이버 사용자 ID를 가져올 수 없습니다');
    }

    // provider와 providerId로 기존 사용자 찾기
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { provider: 'naver', providerId }
        ]
      }
    });

    if (!user) {
      try {
        console.log('📝 Naver: Creating new user in database...');
        user = await prisma.user.create({
          data: {
            email,
            name: name,
            password: null,
            phone: phone,
            provider: 'naver',
            providerId,
            profileImage
          },
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            provider: true,
            providerId: true,
            profileImage: true,
            createdAt: true
          }
        });
        console.log('✅ Naver: User created successfully:', user.id, user.email);
      } catch (createError) {
        console.error('❌ Naver: User creation error:', createError.message);
        console.error('❌ Naver: User creation error code:', createError.code);
        if (createError.code === 'P2002') {
          user = await prisma.user.findFirst({
            where: {
              OR: [
                { email },
                { provider: 'naver', providerId }
              ]
            },
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              role: true,
              provider: true,
              providerId: true,
              profileImage: true,
              createdAt: true
            }
          });
        } else {
          throw createError;
        }
      }
    } else {
      // 기존 사용자 정보 업데이트
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          provider: 'naver',
          providerId,
          name: name || user.name,
          phone: phone || user.phone,
          profileImage: profileImage || user.profileImage
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          provider: true,
          providerId: true,
          profileImage: true,
          createdAt: true
        }
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set in environment variables');
    }
    if (!process.env.JWT_EXPIRES_IN) {
      throw new Error('JWT_EXPIRES_IN is not set in environment variables');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return {
      user,
      token
    };
  } catch (error) {
    throw new Error('네이버 로그인 실패: ' + error.message);
  }
};

const sendFindIdVerification = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('User not found with this email');
  }

  await emailService.sendVerificationCode(email, 'findId');
  return true;
};

const findUserId = async (email, code) => {
  await emailService.verifyCode(email, code, 'findId');
  
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      email: true
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return { email: user.email };
};

const sendResetPasswordVerification = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('User not found with this email');
  }

  await emailService.sendVerificationCode(email, 'resetPassword');
  return true;
};

const resetPasswordWithVerification = async (email, code, newPassword) => {

  await emailService.verifyCode(email, code, 'resetPassword');
  
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword }
  });

  return true;
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  kakaoLogin,
  getKakaoAccessTokenFromCode,
  googleLogin,
  naverLogin,
  getNaverAccessTokenFromCode,
  sendFindIdVerification,
  findUserId,
  sendResetPasswordVerification,
  resetPasswordWithVerification
};

