import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

const whatsappEventSchema = z.object({
  product_id: z.string().uuid().nullable().optional(),
  event_type: z.enum(["product_question", "checkout_question", "support_question"]),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const payload = whatsappEventSchema.parse(await request.json());
    const { error } = await supabase.from("marketplace_click_events").insert({
      product_id: payload.product_id ?? null,
      event_type: "source_click",
      source: `whatsapp_${payload.event_type}`,
      metadata: {},
    });
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, event: "logged" });
  } catch (error) {
    return apiError(error);
  }
}

export async function GET() {
  return NextResponse.json({
    whatsapp_number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    country: "UY",
    currency: "UYU",
  });
}
