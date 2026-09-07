// pages/api/auth/[...nextauth].ts

import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/lib/models/User";

import bcrypt from "bcryptjs";

import {
  generateUniqueSuiteId as generateSuiteId,
} from "@/lib/suite";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (
          !credentials?.email ||
          !credentials.password
        ) {
          throw new Error(
            "Missing email or password"
          );
        }

        await dbConnect();

        const normalizedEmail =
          credentials.email
            .trim()
            .toLowerCase();

        const user =
          await UserModel.findOne({
            email: normalizedEmail,
          });

        if (!user) {
          throw new Error(
            "Invalid email or password"
          );
        }

        const passwordMatches =
          await bcrypt.compare(
            credentials.password,
            user.password
          );

        if (!passwordMatches) {
          throw new Error(
            "Invalid email or password"
          );
        }

        // Block login until email is verified
        if (!user.emailVerified) {
          throw new Error(
            "EMAIL_NOT_VERIFIED"
          );
        }

        // Auto-assign suite ID if missing
        if (!user.suiteId) {
          for (let i = 0; i < 5; i++) {
            const candidate =
              generateSuiteId();

            const exists =
              await UserModel.exists({
                suiteId: candidate,
              });

            if (!exists) {
              user.suiteId =
                candidate;

              await user.save();

              break;
            }
          }
        }

        return {
          id: user._id.toString(),

          email: user.email,

          name: user.name,

          role: user.role,

          suiteId:
            user.suiteId ?? null,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id =
          (user as any).id;

        token.email =
          (user as any).email;

        token.name =
          (user as any).name;

        token.role =
          (user as any).role;

        token.suiteId =
          (user as any).suiteId;
      }

      return token;
    },

    async session({
      session,
      token,
    }) {
      if (session.user && token) {
        (session.user as any).id =
          token.id as string;

        session.user.email =
          token.email as string;

        session.user.name =
          token.name as string;

        (session.user as any).role =
          token.role as string;

        (session.user as any).suiteId =
          token.suiteId as
            | string
            | null;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret:
    process.env.NEXTAUTH_SECRET,
};

export default NextAuth(
  authOptions
);