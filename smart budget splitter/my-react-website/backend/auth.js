import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import dotenv from 'dotenv';
dotenv.config();


// Placeholder user storage
const users = [];

// Find or create user
const findOrCreateUser = ({ name, email, googleId }) => {
  let user = users.find((user) => user.googleId === googleId);

  if (!user) {
    user = { id: users.length + 1, name, email, googleId };
    users.push(user);
  }

  return user;
};

// Configure Passport
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,  // Use environment variable for clientID
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,  // Use environment variable for clientSecret
      callbackURL: process.env.GOOGLE_CALLBACK_URL,  // Use environment variable for callbackURL
      passReqToCallback: true,
    },
    (request, accessToken, refreshToken, profile, done) => {
      request.session.promptGoogleLogin = true; // Ensure the session is aware of forced login
      const user = findOrCreateUser({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
      });
      done(null, user);
    }
  )
);

passport.serializeUser((user, done) => done(null, user.googleId));
passport.deserializeUser((googleId, done) => {
  const user = users.find((user) => user.googleId === googleId);
  done(null, user || null);
});

export default passport;
