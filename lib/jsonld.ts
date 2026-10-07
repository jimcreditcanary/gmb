import { SITE, SITE_URL, absolute } from "./site";
import type { Frontmatter } from "./frontmatter";

const r = SITE.regulatory;
const ORG_ID = `${SITE_URL}/#organization`;

/** Site-wide Organization + FinancialService (credit union), from the approved regulatory facts. */
export function organization() {
  return [
    { "@type": ["Organization", "FinancialService"], "@id": ORG_ID, name: r.tradingName, legalName: r.legalName, alternateName: SITE.shortName, url: SITE_URL + "/", logo: { "@type": "ImageObject", url: absolute(SITE.logo.header) }, telephone: r.telephone,
      identifier: [{ "@type": "PropertyValue", propertyID: "FCA Firm Reference Number", value: r.frn }, { "@type": "PropertyValue", propertyID: "Mutuals Public Register", value: r.mutualsNumber }],
      address: { "@type": "PostalAddress", ...r.registeredOffice }, areaServed: "GB", sameAs: SITE.footer.socials.map((s) => s.href).concat([r.fcaRegisterUrl, r.mutualsRegisterUrl]) },
  ];
}

export function breadcrumbs(slug: string, title: string) {
  const parts = slug.split("/").filter(Boolean);
  const items = [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL + "/" }];
  const names: Record<string, string> = { loans: "Loans", savings: "Savings", resources: "Resources", "member-helper": "Member Helper", "our-blog": "Our Blog", category: "Category", tag: "Tag" };
  parts.forEach((p, i) => {
    const last = i === parts.length - 1;
    items.push({ "@type": "ListItem", position: i + 2, name: last ? title.replace(/ \| .*$/, "") : names[p] || p, ...(last ? {} : { item: `${SITE_URL}/${parts.slice(0, i + 1).join("/")}/` }) } as never);
  });
  return { "@type": "BreadcrumbList", "@id": `${SITE_URL}${slug}#breadcrumb`, itemListElement: items };
}

/** LoanOrCredit / FinancialProduct from the product frontmatter (numbers extracted from the page copy at import time). */
export function product(fm: Frontmatter) {
  const p = fm.product; if (!p) return null;
  const url = SITE_URL + fm.slug; const name = fm.title.replace(/ \| .*$/, "");
  if (p.kind === "loan") {
    return { "@type": "LoanOrCredit", "@id": `${url}#product`, name, url, description: fm.description || undefined, provider: { "@id": ORG_ID }, currency: "GBP", areaServed: "GB",
      ...(p.amountMin || p.amountMax ? { amount: { "@type": "MonetaryAmount", currency: "GBP", minValue: p.amountMin, maxValue: p.amountMax } } : {}),
      ...(p.aprMin ? { annualPercentageRate: p.aprMin === p.aprMax ? p.aprMin : { "@type": "QuantitativeValue", minValue: p.aprMin, maxValue: p.aprMax, unitText: "APR" } } : {}),
      ...(p.termMaxMonths ? { loanTerm: { "@type": "QuantitativeValue", maxValue: p.termMaxMonths, unitCode: "MON" } } : {}),
      ...(p.representative ? { loanRepaymentForm: { "@type": "RepaymentSpecification", loanPaymentAmount: p.representative.monthly ? { "@type": "MonetaryAmount", currency: "GBP", value: p.representative.monthly } : undefined, numberOfLoanPayments: p.representative.termMonths, loanPaymentFrequency: 12 } } : {}) };
  }
  return { "@type": ["FinancialProduct", "DepositAccount"], "@id": `${url}#product`, name, url, description: fm.description || undefined, provider: { "@id": ORG_ID }, areaServed: "GB", ...(p.dividendRate ? { interestRate: p.dividendRate } : {}) };
}

export function article(fm: Frontmatter, wordCount: number) {
  const url = SITE_URL + fm.slug;
  return { "@type": "Article", "@id": `${url}#article`, headline: fm.title.replace(/ \| .*$/, ""), description: fm.description || undefined, url, mainEntityOfPage: url, datePublished: fm.publishedAt, dateModified: fm.updatedAt || fm.publishedAt, author: { "@type": "Organization", "@id": ORG_ID }, publisher: { "@id": ORG_ID }, image: fm.featuredImage ? absolute(fm.featuredImage) : undefined, wordCount, inLanguage: "en-GB", keywords: fm.tags.length ? fm.tags.join(", ") : undefined };
}

/** FAQPage from <FAQ question="…"> components in the MDX body (answers as plain text). */
export function faqPage(body: string, slug: string) {
  const qs = [...body.matchAll(/<FAQ question="([^"]+)">([\s\S]*?)<\/FAQ>/g)].map((m) => ({ q: m[1].replace(/&quot;/g, '"'), a: m[2].replace(/<[^>]+>/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_`#]+/g, "").replace(/\s+/g, " ").trim() }));
  if (!qs.length) return null;
  return { "@type": "FAQPage", "@id": `${SITE_URL}${slug}#faq`, mainEntity: qs.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) };
}

export function webPage(fm: Frontmatter) {
  const url = SITE_URL + fm.slug;
  return { "@type": fm.template === "post" ? "WebPage" : fm.template === "home" ? "WebPage" : "WebPage", "@id": url, url, name: fm.title, description: fm.description || undefined, isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": ORG_ID }, datePublished: fm.publishedAt, dateModified: fm.updatedAt, inLanguage: "en-GB", breadcrumb: { "@id": `${url}#breadcrumb` } };
}

export function website() {
  return { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL + "/", name: SITE.shortName, publisher: { "@id": ORG_ID }, inLanguage: "en-GB" };
}

/** The graph we add. The original Yoast graph from frontmatter.schema is emitted separately and verbatim. */
export function pageGraph(fm: Frontmatter, body: string, wordCount: number) {
  const nodes: unknown[] = [...organization(), website(), webPage(fm), breadcrumbs(fm.slug, fm.title)];
  const p = product(fm); if (p) nodes.push(p);
  if (fm.template === "post") nodes.push(article(fm, wordCount));
  const f = faqPage(body, fm.slug); if (f) nodes.push(f);
  return { "@context": "https://schema.org", "@graph": JSON.parse(JSON.stringify(nodes)) };
}
