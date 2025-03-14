// import passport from 'passport';
// import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// import AuthService from '../services/authService';
// import { IUser } from '../models/userModel';
// import dotenv from 'dotenv';
// dotenv.config();

// const authService = new AuthService();

// passport.use(
//     new GoogleStrategy(
//         {
//             clientID: process.env.GOOGLE_CLIENT_ID,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//             callbackURL: '/auth/google/callback',
//         },
//         async (accessToken, refreshToken, profile, done) => {
//             try {
//                 const user = await authService.findOrCreateUser(profile);
//                 done(null, user);
//             } catch (err) {
//                 done(err, null);
//             }
//         }
//     )
// );

// passport.serializeUser((user: IUser, done) => {
//     done(null, user._id.toString());
// });

// passport.deserializeUser(async (id: string, done: (err: any, user?: any) => void) => {
//   try {
//       const user = await authService.findUserById(id);
//       done(null, user);
//   } catch (error) {
//       done(error, null);
//   }
// });
