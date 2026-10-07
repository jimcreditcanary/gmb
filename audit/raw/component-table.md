| Theme block | Pages | Instances | Proposed component | Props | Copy carried as MDX children |
|---|---|---|---|---|---|
| `section.header-page` | 133 | 133 | PageHeader | colour, image|lottie, trustpilot, buttons[] | h1 + intro + optional eyebrow |
| `section.postsingle` | 63 | 63 | PostBody | — (post template supplies header, date, featured image) | article HTML → markdown |
| `section.popout-block` | 31 | 65 | PopoutBlock | colour, image, imagePosition | h2 + body + CTA links |
| `section.content-rows` | 24 | 34 | ContentRow / Col / ColImage / IconList | colour, centred | optional header h2, 1–2 columns, icon list, buttons |
| `section.posts` | 18 | 18 | RelatedPosts (generated) | count | none — pulled from content tree |
| `section.panel-section` | 17 | 17 | PanelSection / Panel / PanelFooter | colour per panel, title | bullet lists (loan terms, eligibility, T&Cs) |
| `section.video-section` | 16 | 16 | VideoSection | video (YouTube embed, lazy facade) | h2 + body |
| `section.list-block` | 15 | 15 | ListBlock / ListItem | heading, icon per item | bold benefit lines |
| `section.contact-form` | 5 | 5 | ContactForm | formId, fields[], submit | — (CF7 → route handler) |
| `section.posts-overview` | 3 | 3 | PostsOverview (home) | trustpilot | h2 + intro; cards generated |
| `section.header` | 2 | 2 | PageHeader (home variant) | colour, image, trustpilot, buttons[] (icon tiles) | h1 + intro |
| `section.colour-panels` | 2 | 2 | ColourPanels / ColourPanel | colour, image per panel | h3 + body + link |
| `section.box-slider` | 2 | 2 | BoxSlider / Box | heading, intro, image per box | product teaser cards (slick carousel today) |
| `section.icon-block` | 2 | 2 | IconGrid / IconItem | colour, columns, heading | icon + text per item |
| `section.faq` | 2 | 2 | FAQGroup / FAQ | heading, colour, question | answer markdown; emits FAQPage schema |
| `section.header-title` | 1 | 1 | PageHeader (title-only) | — | h1 |
| `section.label-block` | 1 | 1 | StatBlock / Stat | figure, label | — |
| `section.block-icon-section` | 1 | 1 | IconGrid (values variant) | heading | icon + h3 + text |
| `section.info-block` | 1 | 1 | InfoBlock / InfoPanel | heading | intro + panels |
