export const config = {
  port: Number(process.env.PORT || 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/aura',
  jwtSecret: process.env.JWT_SECRET || 'change_me',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  sepayApiKey: process.env.SEPAY_API_KEY || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  resendApiKey: process.env.RESEND_API_KEY || '',
  twilioApiKey: process.env.TWILIO_API_KEY || '',
  upstashRedisUrl: process.env.UPSTASH_REDIS_URL || ''
};


