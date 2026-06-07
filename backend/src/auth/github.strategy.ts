import dotenv from 'dotenv';

dotenv.config();

import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.model';

console.log(
  'GITHUB_CLIENT_ID:',
  process.env.GITHUB_CLIENT_ID
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret:
        process.env.GITHUB_CLIENT_SECRET!,
      callbackURL:
        process.env.GITHUB_CALLBACK_URL!,
      scope: ['user:email'],
    },

    async (
        _accessToken: any,
        _refreshToken: any,
        profile: any,
        done: any
      ) => {
      try {

        const email =
          profile.emails?.[0]?.value;

        let user =
          await User.findOne({
            email,
          });

        if (!user) {

          user =
            await User.create({
              name:
                profile.displayName ||
                profile.username,

              email,

              avatar:
                profile.photos?.[0]?.value,

              role: 'user',
            });

        }

        return done(null, user);

      } catch (error) {

        return done(error as Error);

      }
    }
  )
);