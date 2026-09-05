import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getUserProfile, getUserTokenBalance, getUserSubscription, ensureUserProfile } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    // 1. Pass request headers directly from the NextRequest instance
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    // 2. Handle unauthenticated state
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    // 3. Sync and fetch user data
    await ensureUserProfile(session.user);
    const profile = await getUserProfile(session.user.id);
    const tokenBalance = await getUserTokenBalance(session.user.id);
    const subscription = await getUserSubscription(session.user.id);

    return NextResponse.json({
      user: session.user,
      profile,
      tokenBalance,
      subscription,
    });
  } catch (error: any) {
    console.error("Profile API session error:", error);
    
    // 4. Return 500 for actual server/database execution errors
    return NextResponse.json(
      { error: error.message || "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}