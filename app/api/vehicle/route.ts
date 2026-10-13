import { NextRequest, NextResponse } from "next/server";

/**
 * Registration → vehicle facts, via the DVLA Vehicle Enquiry Service (DVLA_API_KEY).
 * Returns only what the car-loan journey shows; the key never leaves the server. Without a key the route says so and the page falls back to a price field.
 */
const VES = "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles";
const hits = new Map<string, number[]>();
const limited = (ip: string, n = 10, windowMs = 60_000) => { const now = Date.now(); const arr = (hits.get(ip) || []).filter((t) => now - t < windowMs); arr.push(now); hits.set(ip, arr); return arr.length > n; };

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (limited(ip)) return NextResponse.json({ error: "Too many lookups. Please wait a minute and try again." }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const registration = String(body.registration || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!/^[A-Z0-9]{2,7}$/.test(registration)) return NextResponse.json({ error: "Please enter a valid UK registration." }, { status: 400 });
  const key = process.env.DVLA_API_KEY;
  if (!key) return NextResponse.json({ error: "Vehicle lookup isn’t available right now. Enter the price of the car instead.", unavailable: true }, { status: 503 });
  const r = await fetch(VES, { method: "POST", headers: { "x-api-key": key, "Content-Type": "application/json" }, body: JSON.stringify({ registrationNumber: registration }), cache: "no-store" }).catch(() => null);
  if (!r) return NextResponse.json({ error: "Vehicle lookup isn’t available right now. Enter the price of the car instead.", unavailable: true }, { status: 503 });
  if (r.status === 404) return NextResponse.json({ error: "We couldn’t find a vehicle with that registration. Check it and try again." }, { status: 404 });
  if (!r.ok) return NextResponse.json({ error: "Vehicle lookup isn’t available right now. Enter the price of the car instead.", unavailable: true }, { status: 503 });
  const v = await r.json();
  const vehicle = { registration, make: titleCase(v.make || ""), year: v.yearOfManufacture, colour: titleCase(v.colour || ""), fuel: titleCase(v.fuelType || ""), engineCc: v.engineCapacity, co2: v.co2Emissions, motStatus: v.motStatus, taxStatus: v.taxStatus, firstRegistered: v.monthOfFirstRegistration };
  return NextResponse.json({ vehicle });
}

const titleCase = (s: string) => s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
