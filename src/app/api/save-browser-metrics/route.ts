import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Only available in development" }, { status: 403 });
  }

  const data: Record<string, number> = await req.json();
  const outputPath = path.join(process.cwd(), "scripts/measured-browser-metrics.json");
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

  return NextResponse.json({ ok: true, count: Object.keys(data).length });
}
