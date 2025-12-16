const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const { createClient } = require('redis');

const redisClient = createClient({
  url: 'redis://localhost:6379',
});

redisClient.connect();

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 100,                
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
});
const taskLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 100,           
});

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 5,            
  message: { message: 'Too many login attempts, please try again later.' },
});

module.exports = {
    limiter,
    taskLimiter,
    loginLimiter,
};