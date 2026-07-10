import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { findOrCreateOAuthUser } from './models/userModel.js';

import userRoute from './routes/userRoute.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import './models/serviceAreaModel.js';
import serviceAreaRoute from './routes/serviceAreaRoute.js';
import availabilityRoutes from './routes/availabilityRoutes.js';
import './models/repairRequestModel.js';
import repairRequestRoute from './routes/repairRequestRoute.js';
import './models/notificationModel.js';
import notificationRoute from './routes/notificationRoute.js';
import repairRoutes from './routes/repairRoutes.js';
import technicianRoutes from './routes/technicianRoutes.js';
import pricingRoutes from './routes/pricingRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

app.use(session({
  secret: process.env.SESSION_SECRET || "fixit-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,       
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  "/auth/google/callback",
    passReqToCallback: true,
  }, async (req, _accessToken, _refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) return done(new Error('Google account has no public email'));
      const nameParts = (profile.displayName || '').trim().split(/\s+/);
      const role = req.query.state === 'technician' ? 'technician' : 'user';
      const user = await findOrCreateOAuthUser({
        firstName: profile.name?.givenName || nameParts[0] || 'Google',
        lastName:  profile.name?.familyName || nameParts.slice(1).join(' ') || 'User',
        email,
        role,
      });
      done(null, user);
    } catch (err) {
      done(err);
    }
  }));
}

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID:     process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL:  "/auth/facebook/callback",
    profileFields: ["id", "displayName", "email"],
  }, (_accessToken, _refreshToken, profile, done) => done(null, profile)));
}

app.get("/", (_req, res) => {
  res.send("The Fixit backend is running");
});

app.use("/api/auth", authRoutes);
app.use("/api", userRoute);
app.use("/api/repair-requests", repairRequestRoute);
app.use("/api/admin", adminRoutes);
app.use("/api/service-area", serviceAreaRoute);
app.use("/api/availability", availabilityRoutes);
app.use("/api/notifications", notificationRoute);
app.use("/api/repair", repairRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/auth/google", (req, res, next) => {
  const role = req.query.role === 'technician' ? 'technician' : 'user';
  passport.authenticate("google", { scope: ["profile", "email"], state: role })(req, res, next);
});

app.get("/auth/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user) => {
    if (err || !user) {
      console.error('Google OAuth failed:', err?.message);
      return res.redirect("http://localhost:5173/login?error=google");
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    const params = new URLSearchParams({
      token,
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role || 'user',
    });
    res.redirect(`http://localhost:5173/oauth-callback?${params.toString()}`);
  })(req, res, next);
});

app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));
app.get("/auth/facebook/callback", passport.authenticate("facebook", {
  successRedirect: "http://localhost:5173/dashboard",
  failureRedirect:  "http://localhost:5173/login",
}));

app.get("/auth/user", (req, res) => {
  if (req.user) {
    res.json({
      name:  req.user.displayName,
      email: req.user.emails?.[0]?.value,
      photo: req.user._json?.picture,
    });
  } else {
    res.json(null);
  }
});

app.get("/auth/logout", (req, res) => {
  req.logout(() => res.redirect("http://localhost:5173/login"));
});

import pool from './config/db.js';
pool.query(`
  ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_booking_id_fkey;
  ALTER TABLE reviews ADD CONSTRAINT reviews_booking_id_fkey
    FOREIGN KEY (booking_id) REFERENCES repair_requests(id) ON DELETE CASCADE;
`).then(() => console.log('Reviews FK migration OK')).catch(() => {});

pool.query(`
  ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;
  ALTER TABLE users ALTER COLUMN city DROP NOT NULL;
`).then(() => console.log('Users OAuth-nullable migration OK')).catch(() => {});

pool.query(`
  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    repair_id INTEGER,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`).then(() => console.log('Messages table OK')).catch(() => {});
pool.query(`
  DO $$
  DECLARE r RECORD;
  BEGIN
    FOR r IN SELECT constraint_name FROM information_schema.table_constraints
             WHERE table_name='messages' AND constraint_type='FOREIGN KEY'
               AND constraint_name LIKE '%repair_id%'
    LOOP
      EXECUTE 'ALTER TABLE messages DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
    END LOOP;
  END $$;
`).then(() => console.log('Messages FK migration OK')).catch(() => {});

import { generateDueReminders } from './controllers/repairRequestController.js';
const runReminders = () =>
  generateDueReminders()
    .then(n => { if (n) console.log(`Appointment reminders sent: ${n}`); })
    .catch(err => console.error('Reminder job failed:', err.message));
setTimeout(runReminders, 5000);
setInterval(runReminders, 60 * 60 * 1000);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
