import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import userRoute from './src/routes/userRoute.js'; 
import authRoutes from './src/routes/authRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

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
app.use("/api/admin", adminRoutes);

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

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
