import rateLimit from "express-rate-limit";


export const minuteLimiter = rateLimit({
  windowMs: 1000 * 60,
  max: 15,
  message: "Too many requests, please try again after some time",
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

export const hourlyLimiter = rateLimit({
  windowMs: 60 * 1000 * 60,
  max: 250,
  message: "Too many requests, please try again after some time",
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

export const dailyLimiter = rateLimit({
  windowMs: 24 * 60 * 1000 * 60,
  max: 500,
  message: "Too many requests, please try again after some time",
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
