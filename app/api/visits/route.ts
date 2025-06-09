import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const VISITS_FILE = path.join(process.cwd(), "data", "visits.json");

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(VISITS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Read visit count from file
async function getVisitCount(): Promise<number> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(VISITS_FILE, "utf-8");
    const parsed = JSON.parse(data);
    return parsed.visits || 0;
  } catch {
    // File doesn't exist or is invalid, start with 0
    return 0;
  }
}

// Write visit count to file
async function saveVisitCount(count: number): Promise<void> {
  try {
    await ensureDataDir();
    await fs.writeFile(
      VISITS_FILE,
      JSON.stringify({ visits: count, lastUpdated: new Date().toISOString() })
    );
  } catch (error) {
    console.error("Failed to save visit count:", error);
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
