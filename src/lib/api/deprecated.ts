import { NextResponse } from "next/server";

export function legacyApiDeprecated(replacement: string) {
  return NextResponse.json(
    {
      error: "LEGACY_API_DEPRECATED",
      replacement,
      message: "Use the canonical marketplace API. Legacy tables are outside the MVP path.",
    },
    { status: 410 },
  );
}
