import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const VISITS_KEY = "tennis-angle-theory:visits";

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Read visit count from Upstash Redis
async function getVisitCount(): Promise<number> {
  try {
    const visits = await redis.get<number>(VISITS_KEY);
    return visits || 0;
  } catch (error) {
    console.error("Failed to get visit count from Redis:", error);
    return 0;
  }
}

// Write visit count to Upstash Redis
async function saveVisitCount(count: number): Promise<void> {
  try {
    await redis.set(VISITS_KEY, count);
  } catch (error) {
    console.error("Failed to save visit count to Redis:", error);
  }
}

export async function GET() {
  try {
    const visits = await getVisitCount();
    return NextResponse.json({ visits });
  } catch (error) {
    console.error("Failed to get visit count:", error);
    return NextResponse.json({ visits: 0 });
  }
}

export async function POST() {
  try {
    const currentVisits = await getVisitCount();
    const newVisits = currentVisits + 1;
    await saveVisitCount(newVisits);
    return NextResponse.json({ visits: newVisits });
  } catch (error) {
    console.error("Failed to increment visit count:", error);
    return NextResponse.json({ visits: 0 });
  }
}
