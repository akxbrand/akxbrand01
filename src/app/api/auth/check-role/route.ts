import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized access" },
                { status: 401 }
            );
        }

        // @ts-ignore
        const userRole = session.user?.role;

        if (!userRole) {
            return NextResponse.json(
                { error: "User role not found" },
                { status: 403 }
            );
        }

        return NextResponse.json({ role: userRole });
    } catch (error) {
        console.error("Error checking role:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}