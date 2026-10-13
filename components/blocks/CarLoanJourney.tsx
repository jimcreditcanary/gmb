import { getPage } from "@/lib/content";
import { Section } from "@/components/ui/section";
import { CarLoanJourneyClient } from "./CarLoanJourneyClient";

/**
 * Car loan journey (Jim, 2026-10-13): found a car? → yes: registration → DVLA lookup → estimated value → loan amount;
 * no: loan calculator (amount, term) → through to the apply journey. Loan facts (amounts, APR range, representative example)
 * come from the product page they already live on, so nothing is retyped here.
 */
export function CarLoanJourney({ product = "/loans/member-loan/", apply }: { product?: string; apply: string }) {
  const page = getPage(product);
  const p = page?.frontmatter.product;
  if (!p || !p.representative) return null;
  const facts = { name: page!.frontmatter.h1 || page!.frontmatter.title.replace(/ \| .*$/, ""), href: product, amountMin: p.amountMin ?? 0, amountMax: p.amountMax ?? 0, aprMin: p.aprMin ?? 0, aprMax: p.aprMax ?? 0, termMaxMonths: p.termMaxMonths ?? 60, repApr: p.representative.apr };
  return (
    <Section tight>
      <CarLoanJourneyClient facts={facts} apply={apply} />
    </Section>
  );
}
