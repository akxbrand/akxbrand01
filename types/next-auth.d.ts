import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    phoneNumber: string;
    role: 'admin' | 'client';
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      phoneNumber: string;
      role: 'admin' | 'client';
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    phoneNumber: string;
    role: 'admin' | 'client';
  }
}
