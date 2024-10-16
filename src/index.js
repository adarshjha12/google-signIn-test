require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

app.set('view engine', 'hbs')
// app.use(express.static())
// Setup session middleware
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 3,  
    secure: false,
    httpOnly: true  
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Google OAuth strategy

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));


// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/auth/google',
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      prompt: 'consent'  // Forces the consent screen each time
    })
  );
  

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to the desired page.
    res.redirect('/profile');
  }
);

app.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    res.render(`profile`);
  } else {
    res.redirect('/');
  }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send('Error logging out');
      }
  
      // Clear the cookie manually (if required)
      res.clearCookie('connect.sid');  // The name of the cookie (default is `connect.sid`)
      res.redirect('/');  // Redirect to the home or login page
    });
  });
  
  
// Start the server
app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
