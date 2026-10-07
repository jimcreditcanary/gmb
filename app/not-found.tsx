import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/blocks/PageHeader";

export const metadata: Metadata = { title: { absolute: "Page not found | GMBCU" }, robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <main className="main-layout" id="main">
      <PageHeader colour="yellow"><h1>Page not found</h1><p>Sorry, the page you are looking for could not be found.</p><p><Link className="button" href="/">Back to the homepage</Link></p></PageHeader>
    </main>
  );
}
