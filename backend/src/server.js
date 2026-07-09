import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';

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
    secure: false,       // set true in production (HTTPS)
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
  }, (_accessToken, _refreshToken, profile, done) => done(null, profile)));
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

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
app.get("/auth/google/callback", passport.authenticate("google", {
  successRedirect: "http://localhost:5173/dashboard",
  failureRedirect:  "http://localhost:5173/login",
}));

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

// Run DB migrations on startup
import pool from './config/db.js';
pool.query(`
  ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_booking_id_fkey;
  ALTER TABLE reviews ADD CONSTRAINT reviews_booking_id_fkey
    FOREIGN KEY (booking_id) REFERENCES repair_requests(id) ON DELETE CASCADE;
`).then(() => console.log('Reviews FK migration OK')).catch(() => {});

// Ensure messages table exists with correct schema
pool.query(`
  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    repair_id INTEGER,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`).then(() => console.log('Messages table OK')).catch(() => {});
// Drop any FK on messages.repair_id that references repairs (old schema)
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

// Auto-generate appointment reminders for next-day bookings (once at startup, then hourly)
import { generateDueReminders } from './controllers/repairRequestController.js';
const runReminders = () =>
  generateDueReminders()
    .then(n => { if (n) console.log(`Appointment reminders sent: ${n}`); })
    .catch(err => console.error('Reminder job failed:', err.message));
setTimeout(runReminders, 5000);
setInterval(runReminders, 60 * 60 * 1000);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
