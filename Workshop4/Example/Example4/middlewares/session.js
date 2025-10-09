const { getIronSession } = require('iron-session');
require('dotenv').config();
module.exports = async (req, res,next) => {
const session = await getIronSession(req, res, {
    cookieName: 'session',
    password: process.env.SESSION_SECRET || 'a-very-long-random-secret-key-change-this!',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production', // only over HTTPS in production
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 15 * 60,
    },
  })
  req.session = session; 
  next();
};