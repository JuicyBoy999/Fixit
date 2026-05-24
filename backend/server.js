import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import cors from 'cors';
import dotenv from 'dotenv';
import technicianRoute from './route/technicianAvaibilityRoute.js';

dotenv.config();
const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use(session({ 
  secret: 'fixit-secret', 
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => done(null, profile)));

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'email']
}, (accessToken, refreshToken, profile, done) => done(null, profile)));

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: 'http://localhost:5173/dashboard',
  failureRedirect: 'http://localhost:5173/login'
}));

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: 'http://localhost:5173/dashboard',
  failureRedirect: 'http://localhost:5173/login'
}));

app.get('/auth/user', (req, res) => {
  if (req.user) {
    res.json({
      name: req.user.displayName,
      email: req.user.emails?.[0]?.value,
      photo: req.user._json?.picture
    });
  } else {
    res.json(null);
  }
});

app.get('/auth/logout', (req, res) => {
  req.logout(() => res.redirect('http://localhost:5173/login'));
});

app.listen(5000, () => console.log('Backend running on http://localhost:5000'));

app.use('/api/technician', technicianRoute);