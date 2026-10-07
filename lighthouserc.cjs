/** Lighthouse CI budget: every template must score ≥95 on all four categories, mobile and desktop (decision 3). */
const pages = ["/", "/loans/", "/loans/member-loan/", "/savings/member-saver/", "/about-us/", "/contact-us/", "/faqs/", "/privacy-policy/", "/our-blog/", "/2026-agm-summary/", "/resources/member-helper/budget-planner/", "/gmb-credit-union-prize-draw/"];
const base = process.env.LHCI_BASE_URL || "http://localhost:3000";
const assertions = { "categories:performance": ["error", { minScore: 0.95 }], "categories:accessibility": ["error", { minScore: 0.95 }], "categories:best-practices": ["error", { minScore: 0.95 }], "categories:seo": ["error", { minScore: 0.95 }] };
module.exports = {
  ci: {
    collect: { url: pages.map((p) => base + p), numberOfRuns: 1, startServerCommand: process.env.LHCI_BASE_URL ? undefined : "pnpm start", startServerReadyPattern: "Ready", settings: { preset: process.env.LHCI_PRESET || undefined, chromeFlags: "--no-sandbox" } },
    assert: { assertions },
    upload: { target: "temporary-public-storage" },
  },
};
