import { getPage } from "@/lib/content";
import { Section } from "@/components/ui/section";
import { CarLoanJourneyClient, type Facts } from "./CarLoanJourneyClient";

/**
 * Car loan journey (Jim, 2026-10-13): found a car? → yes: registration → DVLA lookup → estimated value → loan amount;
 * no: loan calculator (amount, term) → through to the apply journey. Loan facts (amounts, APR range, representative example)
 * come from the product page they already live on, so nothing is retyped here.
 * Layout after the bank-page review (Barclays, TSB, HSBC, Nationwide, Lloyds, 2026-10-13): inputs on the left, a live
 * "Your estimate" panel on the right with the apply button in it, the representative example directly underneath.
 */
export function CarLoanJourney({ product = "/loans/member-loan/", apply }: { product?: string; apply: string }) {
  const page = getPage(product);
  const p = page?.frontmatter.product;
  if (!p || !p.representative) return null;
  const r = p.representative;
  const facts: Facts = { name: page!.frontmatter.h1 || page!.frontmatter.title.replace(/ \| .*$/, ""), href: product, amountMin: p.amountMin ?? 0, amountMax: p.amountMax ?? 0, aprMin: p.aprMin ?? 0, aprMax: p.aprMax ?? 0, termMaxMonths: p.termMaxMonths ?? 60, rep: { apr: r.apr, amount: r.amount ?? 0, termMonths: r.termMonths ?? 0, monthly: r.monthly ?? 0, total: r.total ?? 0 } };
  return (
    <Section id="cost" tight className="scroll-mt-24">
      <CarLoanJourneyClient facts={facts} apply={apply} />
    </Section>
  );
}
