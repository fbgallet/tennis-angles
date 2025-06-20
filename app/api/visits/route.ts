import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const VISITS_KEY = "tennis-angles-theory:visits";

// Initialize Upstash Redis client using environment variables
const redis = Redis.fromEnv();

export async function GET() {
  try {
    const visits = await redis.get<number>(VISITS_KEY);
    return NextResponse.json({ visits: visits || 0 });
  } catch (error) {
    console.error("Failed to get visit count:", error);
    return NextResponse.json({ visits: 0 });
  }
}

export async function POST() {
  try {
    // Use Redis INCR for atomic increment operation
    const newVisits = await redis.incr(VISITS_KEY);
    return NextResponse.json({ visits: newVisits });
  } catch (error) {
    console.error("Failed to increment visit count:", error);
    return NextResponse.json({ visits: 0 });
  }
}
