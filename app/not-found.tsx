import type { Metadata } from "next";
import { PageHeader } from "@/components/blocks/PageHeader";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: { absolute: "Page not found | GMBCU" }, robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <main id="main">
      <PageHeader colour="yellow"><h1>Page not found</h1><p>Sorry, the page you are looking for could not be found.</p><p><Button href="/">Back to the homepage</Button></p></PageHeader>
    </main>
  );
}
