import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    phoneNumber: string;
  }

  interface Session extends DefaultSession {
    user?: User;
  }
}