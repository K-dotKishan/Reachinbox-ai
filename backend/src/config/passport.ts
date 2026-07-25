import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { prisma } from "./prisma";
import { env } from "./env";
import { SessionUser } from "../types";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email found in Google profile"));
        }

        const user = await prisma.user.upsert({
          where: { googleId: profile.id },
          update: {
            name: profile.displayName,
            email,
            avatar: profile.photos?.[0]?.value ?? null,
          },
          create: {
            googleId: profile.id,
            name: profile.displayName,
            email,
            avatar: profile.photos?.[0]?.value ?? null,
          },
        });

        const sessionUser: SessionUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        };

        return done(null, sessionUser);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

// Serialize only the user id into the session
passport.serializeUser((user, done) => {
  done(null, (user as SessionUser).id);
});

// Deserialize by fetching full user from DB
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return done(null, false);

    const sessionUser: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    };
    done(null, sessionUser);
  } catch (err) {
    done(err);
  }
});

export default passport;
