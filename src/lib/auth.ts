import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { collections, toObjectId, type Admin, type AdminRole } from "@/lib/db";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: AdminRole;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: AdminRole;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: AdminRole;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const admin = await collections.admins().findOne({ 
          email: credentials.email as string 
        }) as Admin | null;

        if (!admin) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          admin.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        // Update last login
        await collections.admins().updateOne(
          { _id: admin._id },
          { $set: { lastLogin: new Date() } }
        );

        return {
          id: admin._id.toString(),
          name: admin.name,
          email: admin.email,
          role: admin.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      // Always fetch the latest role from the database to handle role changes
      if (token.id) {
        try {
          const admin = await collections.admins().findOne({ _id: toObjectId(token.id) }) as Admin | null;
          if (admin) {
            token.role = admin.role;
          }
        } catch (error) {
          console.error("Failed to fetch admin role:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
});

// Helper to get current admin session
export async function getCurrentAdmin() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return session.user;
}

// Helper to require admin authentication
export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error("Unauthorized");
  }
  return admin;
}

// Helper to require super admin
export async function requireSuperAdmin() {
  const admin = await requireAdmin();
  console.log("[requireSuperAdmin] Admin role from session:", admin.role, "| Expected: SUPER_ADMIN");
  if (admin.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden: Super Admin access required");
  }
  return admin;
}
