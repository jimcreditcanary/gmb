"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Facts = { name: string; href: string; amountMin: number; amountMax: number; aprMin: number; aprMax: number; termMaxMonths: number; rep: { apr: number; amount: number; termMonths: number; monthly: number; total: number } };
type Vehicle = { registration: string; make: string; year?: number; colour?: string; fuel?: string; engineCc?: number; co2?: number; motStatus?: string; taxStatus?: string };
type Valuation = { low: number; high: number; typical: number; basis: string };

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
const gbp2 = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2 });
/** UK APR is an annual effective rate: convert to a monthly rate, then the standard amortised payment. Matches the published representative example to within pence. */
const monthly = (amount: number, apr: number, months: number) => { const r = Math.pow(1 + apr / 100, 1 / 12) - 1; return r === 0 ? amount / months : (amount * r) / (1 - Math.pow(1 + r, -months)); };
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const round50 = (n: number) => Math.round(n / 50) * 50;

const field = "h-12 w-full rounded-field border border-border-strong bg-surface px-4 font-ui text-body text-ink focus:border-ink focus:outline-none";
const label = "block font-ui text-small font-semibold text-ink";
const stepCard = "grid gap-x-8 border-t border-border pt-6 sm:grid-cols-[4rem_minmax(0,1fr)]";
const stepNo = "font-display text-h2 leading-none text-brand";

export function CarLoanJourneyClient({ facts, apply }: { facts: Facts; apply: string }) {
  const [found, setFound] = useState<boolean | null>(null);
  const [reg, setReg] = useState("");
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [valuation, setValuation] = useState<Valuation | null>(null);
  const [price, setPrice] = useState<number | "">("");
  const [deposit, setDeposit] = useState<number | "">("");
  const [busy, setBusy] = useState<"lookup" | "value" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState(false);
  const [amount, setAmount] = useState(facts.rep.amount || 5000);
  const [term, setTerm] = useState(facts.rep.termMonths || 48);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const carPrice = price !== "" ? Number(price) : valuation?.typical ?? 0;
  const borrow = Math.max(0, carPrice - (deposit === "" ? 0 : Number(deposit)));
  /** The estimate follows the car: any change to the valuation, price or deposit re-sets the amount (clamped to the product's range). */
  const follow = (nextPrice: number | "", nextDeposit: number | "", nextValuation: Valuation | null) => {
    const cp = nextPrice !== "" ? Number(nextPrice) : nextValuation?.typical ?? 0;
    const b = Math.max(0, cp - (nextDeposit === "" ? 0 : Number(nextDeposit)));
    if (b > 0) setAmount(round50(clamp(b, facts.amountMin, facts.amountMax)));
  };
  const toCalculator = () => { follow(price, deposit, valuation); setStep(3); };

  const pay = useMemo(() => monthly(amount, facts.rep.apr, term), [amount, facts.rep.apr, term]);
  const payLow = useMemo(() => monthly(amount, facts.aprMin, term), [amount, facts.aprMin, term]);
  const payHigh = useMemo(() => monthly(amount, facts.aprMax, term), [amount, facts.aprMax, term]);
  const outOfRange = amount < facts.amountMin || amount > facts.amountMax;
  const total = pay * term;
  const totalSteps = found === false ? 2 : 3;
  const calcStep = found === false ? 2 : 3;

  async function lookup() {
    setError(null); setVehicle(null); setValuation(null); setBusy("lookup");
    try {
      const r = await fetch("/api/vehicle", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ registration: reg }) });
      const j = await r.json();
      if (!r.ok) { setError(j.error || "We couldn’t look that registration up."); if (j.unavailable) setManual(true); return; }
      setVehicle(j.vehicle);
      setBusy("value");
      const v = await fetch("/api/valuation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ vehicle: j.vehicle }) });
      const vj = await v.json();
      if (!v.ok) { setManual(true); setError(vj.error || "We couldn’t estimate a value for this vehicle. Enter the price instead."); return; }
      setValuation(vj.valuation); follow(price, deposit, vj.valuation);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setBusy(null); }
  }

  return (
    <div>
      <header className="mb-block max-w-measure">
        <h2>See what your <u>car loan</u> could cost</h2>
        <p className="mt-stack text-lead text-ink-muted">Three quick steps. Nothing here affects your credit score, and nothing is submitted until you choose to apply.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start">
        <div className="grid gap-8">
          {/* Step 1 */}
          <fieldset className={stepCard}>
            <legend className="sr-only-text">Step 1 of {totalSteps}</legend>
            <p className={stepNo} aria-hidden="true">1</p>
            <div><h3>Have you found a car you’d like to buy?</h3>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant={found === true ? "dark" : "secondary"} aria-pressed={found === true} onClick={() => { setFound(true); setStep(2); }}>Yes, I’ve found one</Button>
              <Button variant={found === false ? "dark" : "secondary"} aria-pressed={found === false} onClick={() => { setFound(false); setStep(3); }}>No, not yet</Button>
            </div></div>
          </fieldset>

          {/* Step 2: the car */}
          {found && (
            <fieldset className={stepCard}>
              <legend className="sr-only-text">Step 2 of 3</legend>
              <p className={stepNo} aria-hidden="true">2</p>
              <div><h3>Tell us about the car</h3>
              <p className="mt-2 text-small text-ink-muted">Enter the registration and we’ll look the car up and estimate what it’s worth, so you know roughly how much to borrow.</p>
              {!manual && (
                <form className="mt-5 flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); if (reg.trim()) lookup(); }}>
                  <div className="grow basis-48">
                    <label htmlFor="car-reg" className={label}>Vehicle registration</label>
                    <input id="car-reg" name="registration" value={reg} onChange={(e) => setReg(e.target.value.toUpperCase())} autoComplete="off" autoCapitalize="characters" maxLength={8} placeholder="AB12 CDE" className={cn(field, "mt-1 bg-yellow font-display text-h4 uppercase tracking-widest placeholder:text-ink/50")} />
                  </div>
                  <Button type="submit" disabled={busy !== null || !reg.trim()}>{busy === "lookup" ? "Looking up…" : busy === "value" ? "Estimating value…" : "Look up vehicle"}</Button>
                </form>
              )}
              {error && <p role="alert" className="mt-4 text-small text-error">{error}</p>}
              {vehicle && (
                <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 rounded-card bg-surface-subtle p-5 text-small sm:grid-cols-3">
                  <div><dt className="text-ink-muted">Vehicle</dt><dd className="font-semibold">{vehicle.year ? `${vehicle.year} ` : ""}{vehicle.make}</dd></div>
                  {vehicle.colour && <div><dt className="text-ink-muted">Colour</dt><dd className="font-semibold">{vehicle.colour}</dd></div>}
                  {vehicle.fuel && <div><dt className="text-ink-muted">Fuel</dt><dd className="font-semibold">{vehicle.fuel}</dd></div>}
                  {vehicle.engineCc && <div><dt className="text-ink-muted">Engine</dt><dd className="font-semibold">{(vehicle.engineCc / 1000).toFixed(1)} L</dd></div>}
                  {vehicle.motStatus && <div><dt className="text-ink-muted">MOT</dt><dd className="font-semibold">{vehicle.motStatus}</dd></div>}
                  {vehicle.taxStatus && <div><dt className="text-ink-muted">Tax</dt><dd className="font-semibold">{vehicle.taxStatus}</dd></div>}
                </dl>
              )}
              {valuation && (
                <div className="mt-5">
                  <p className="font-ui text-small font-semibold">Estimated value</p>
                  <p className="mt-1 font-display text-h2 leading-none">{gbp.format(valuation.typical)}</p>
                  <p className="mt-2 text-small text-ink-muted">Likely range {gbp.format(valuation.low)} – {gbp.format(valuation.high)}. {valuation.basis}</p>
                  <p className="mt-2 text-caption text-ink-muted">This estimate is generated automatically from the vehicle’s DVLA record and is a guide only. It is not a valuation or an offer. If you know the price, enter it below.</p>
                </div>
              )}
              {(valuation || manual || vehicle) && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="car-price" className={label}>{valuation ? "Price (if different)" : "Price of the car"}</label>
                    <input id="car-price" type="number" inputMode="numeric" min={0} step={50} value={price} onChange={(e) => { const v = e.target.value === "" ? "" : Number(e.target.value); setPrice(v); follow(v, deposit, valuation); }} placeholder={valuation ? String(valuation.typical) : "e.g. 8500"} className={cn(field, "mt-1")} />
                  </div>
                  <div>
                    <label htmlFor="car-deposit" className={label}>Your deposit (optional)</label>
                    <input id="car-deposit" type="number" inputMode="numeric" min={0} step={50} value={deposit} onChange={(e) => { const v = e.target.value === "" ? "" : Number(e.target.value); setDeposit(v); follow(price, v, valuation); }} placeholder="0" className={cn(field, "mt-1")} />
                  </div>
                </div>
              )}
              {(valuation || manual || vehicle) && (
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Button onClick={toCalculator} disabled={borrow <= 0}>Borrow {borrow > 0 ? gbp.format(borrow) : "this amount"}</Button>
                  {!manual && <button type="button" className="font-ui text-small font-semibold text-link underline" onClick={() => { setManual(true); setError(null); }}>I’d rather enter the price</button>}
                </div>
              )}
              </div>
            </fieldset>
          )}

          {/* Step 3: calculator */}
          {(step === 3 || found === false) && (
            <fieldset className={stepCard}>
              <legend className="sr-only-text">Step {calcStep} of {totalSteps}</legend>
              <p className={stepNo} aria-hidden="true">{calcStep}</p>
              <div><h3>Adjust the amount and term</h3>
              <p className="mt-2 text-small text-ink-muted">Move the sliders and your estimate updates on the right.</p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="loan-amount" className={label}>Amount to borrow</label>
                  <input id="loan-amount" type="number" inputMode="numeric" min={facts.amountMin} max={facts.amountMax} step={50} value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)} className={cn(field, "mt-1")} />
                  <input aria-label="Amount to borrow slider" type="range" min={facts.amountMin} max={facts.amountMax} step={50} value={clamp(amount, facts.amountMin, facts.amountMax)} onChange={(e) => setAmount(Number(e.target.value))} className="mt-3 w-full accent-(--color-brand-strong)" />
                  <p className="mt-1 flex justify-between text-caption text-ink-muted"><span>{gbp.format(facts.amountMin)}</span><span>{gbp.format(facts.amountMax)}</span></p>
                </div>
                <div>
                  <label htmlFor="loan-term" className={label}>Repay over</label>
                  <div className="mt-1 flex items-center gap-3">
                    <input id="loan-term" type="number" inputMode="numeric" min={12} max={facts.termMaxMonths} step={1} value={term} onChange={(e) => setTerm(clamp(Number(e.target.value) || 12, 12, facts.termMaxMonths))} className={cn(field, "w-28")} />
                    <span className="font-ui text-small font-semibold">months</span>
                  </div>
                  <input aria-label="Repayment term slider" type="range" min={12} max={facts.termMaxMonths} step={6} value={term} onChange={(e) => setTerm(Number(e.target.value))} className="mt-3 w-full accent-(--color-brand-strong)" />
                  <p className="mt-1 flex justify-between text-caption text-ink-muted"><span>12 months</span><span>{facts.termMaxMonths} months</span></p>
                </div>
              </div>
              {outOfRange && <p role="status" className="mt-6 rounded-card bg-surface-subtle p-5 text-small">{facts.name}s are from {gbp.format(facts.amountMin)} to {gbp.format(facts.amountMax)}. For smaller amounts, see our <Link href="/loans/">other loans</Link>.</p>}
              {found && <p className="mt-6"><Button variant="secondary" size="sm" onClick={() => setStep(2)}>Back to the car</Button></p>}
              </div>
            </fieldset>
          )}
        </div>

        {/* Your estimate */}
        <aside className="tone-navy on-inverse rounded-panel p-(--panel-padding) text-ink-inverse lg:sticky lg:top-24" aria-live="polite">
          <p className="font-ui text-small font-semibold">Your estimate</p>
          <p className="mt-1 font-display text-display leading-none">{outOfRange ? "—" : gbp2.format(pay)}</p>
          <p className="mt-1 text-small text-ink-inverse-muted">a month at {facts.rep.apr}% APR{found && borrow > 0 ? ` · ${gbp.format(carPrice)} car${deposit !== "" && Number(deposit) > 0 ? `, ${gbp.format(Number(deposit))} deposit` : ""}` : ""}</p>
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-ink-inverse/20 pt-5 text-small">
            <div><dt className="text-ink-inverse-muted">Loan amount</dt><dd className="font-ui text-h4 font-bold">{gbp.format(amount)}</dd></div>
            <div><dt className="text-ink-inverse-muted">Repay over</dt><dd className="font-ui text-h4 font-bold">{term} months</dd></div>
            <div><dt className="text-ink-inverse-muted">Total repayable</dt><dd className="font-ui text-h4 font-bold">{outOfRange ? "—" : gbp2.format(total)}</dd></div>
            <div><dt className="text-ink-inverse-muted">Interest to pay</dt><dd className="font-ui text-h4 font-bold">{outOfRange ? "—" : gbp2.format(total - amount)}</dd></div>
          </dl>
          <p className="mt-5 text-caption text-ink-inverse-muted">Rates are {facts.aprMin}% to {facts.aprMax}% APR depending on your circumstances{outOfRange ? "." : `, which would make it ${gbp2.format(payLow)} to ${gbp2.format(payHigh)} a month.`} The figures above are for illustrative purposes only the actual repayment amounts will vary subject to loan amount and term.</p>
          <div className="mt-6 grid gap-3">
            <Button href={apply} target="_blank" variant="inverse" size="lg" block>Apply now</Button>
            <p className="text-caption text-ink-inverse-muted">Applying opens our secure application journey. You’ll need to be a member of GMB Credit Union, 18 or over, and able to provide proof of ID and regular income. Subject to a credit search and Open Banking.</p>
          </div>
        </aside>
      </div>

      {/* Representative example, verbatim from the product page */}
      <div className="mt-12 grid gap-6 border-t border-border pt-8 text-ink md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <h3>{facts.name} representative example</h3>
        <div>
          <ul className="grid gap-2 font-ui text-small font-bold sm:grid-cols-2">
            <li>Loan Value: {gbp.format(facts.rep.amount)}</li>
            <li>Repayment Term: {facts.rep.termMonths} months</li>
            <li>Monthly Repayment: {gbp2.format(facts.rep.monthly)}</li>
            <li>Interest: {facts.rep.apr}% APR</li>
            <li>Total amount: {gbp2.format(facts.rep.total)}</li>
          </ul>
          <p className="mt-3 text-caption text-ink-muted">The figures above are for illustrative purposes only the actual repayment amounts will vary subject to loan amount and term.</p>
        </div>
      </div>
    </div>
  );
}
