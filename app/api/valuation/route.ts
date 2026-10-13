import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

/**
 * Vehicle facts → a likely UK private-sale price range, estimated by Claude (ANTHROPIC_API_KEY).
 * A guide for sizing the loan, never a valuation or an offer: the page says so. Without a key the page asks for the price.
 */
const Valuation = z.object({
  low: z.number().describe("Lower end of a likely UK private-sale price in GBP"),
  high: z.number().describe("Upper end of a likely UK private-sale price in GBP"),
  typical: z.number().describe("Most likely UK private-sale price in GBP"),
  basis: z.string().describe("One short sentence on what the estimate assumes, e.g. average mileage and condition for its age"),
});

const hits = new Map<string, number[]>();
const limited = (ip: string, n = 10, windowMs = 60_000) => { const now = Date.now(); const arr = (hits.get(ip) || []).filter((t) => now - t < windowMs); arr.push(now); hits.set(ip, arr); return arr.length > n; };

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (limited(ip)) return NextResponse.json({ error: "Too many requests. Please wait a minute and try again." }, { status: 429 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "Value estimates aren’t available right now. Enter the price of the car instead." }, { status: 503 });
  const body = await req.json().catch(() => ({}));
  const v = body.vehicle || {};
  if (!v.make) return NextResponse.json({ error: "No vehicle to estimate." }, { status: 400 });
  const facts = [`Make: ${v.make}`, v.year && `Year of manufacture: ${v.year}`, v.fuel && `Fuel: ${v.fuel}`, v.engineCc && `Engine: ${v.engineCc} cc`, v.co2 && `CO2: ${v.co2} g/km`, v.colour && `Colour: ${v.colour}`, v.motStatus && `MOT: ${v.motStatus}`].filter(Boolean).join("\n");
  try {
    const client = new Anthropic();
    const res = await client.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 2000,
      output_config: { effort: "low", format: zodOutputFormat(Valuation) },
      system: "You estimate used-car prices for a UK credit union's car-loan calculator. Given the DVLA record of a vehicle (make, year, fuel, engine size; the model is not provided), estimate a likely private-sale price range in GBP today, assuming average mileage and condition for its age and a mid-range model for that make and engine. Round to the nearest £50. Be realistic and conservative. The estimate is a guide for sizing a loan, not a valuation.",
      messages: [{ role: "user", content: `Estimate the price of this vehicle:\n${facts}` }],
    });
    if (res.stop_reason === "refusal" || !res.parsed_output) return NextResponse.json({ error: "We couldn’t estimate a value for this vehicle. Enter the price instead." }, { status: 502 });
    const out = res.parsed_output;
    const valuation = { low: Math.round(out.low), high: Math.round(out.high), typical: Math.round(out.typical), basis: out.basis };
    if (!(valuation.low > 0 && valuation.high >= valuation.typical && valuation.typical >= valuation.low)) return NextResponse.json({ error: "We couldn’t estimate a value for this vehicle. Enter the price instead." }, { status: 502 });
    return NextResponse.json({ valuation });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return NextResponse.json({ error: "Value estimates are busy right now. Enter the price of the car instead." }, { status: 503 });
    if (e instanceof Anthropic.APIError) console.error("[valuation] API error", e.status, e.message);
    else console.error("[valuation]", e);
    return NextResponse.json({ error: "Value estimates aren’t available right now. Enter the price of the car instead." }, { status: 503 });
  }
}
