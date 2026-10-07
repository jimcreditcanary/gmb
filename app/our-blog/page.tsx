import { archiveSchema } from "@/lib/archives";
import { ArchivePage } from "@/components/templates/ArchivePage";
import { archiveMetadata } from "@/lib/seo";
import { ARCHIVES, blog } from "@/lib/archives";
const meta = ARCHIVES["/our-blog/"];
export const metadata = archiveMetadata(meta.title, meta.description, "/our-blog/");
export default function Blog() { const a = blog(1); return <ArchivePage title={meta.h1} intro={meta.intro} image={meta.image} label={meta.label} {...a} yoast={archiveSchema(meta, a.slug, a.base)} />; }
