# NEX+ design contract

## 1. Reference and brief

Reference: https://nex-plus-home.vercel.app, inspected October 11, 2026. Preserve its split infrastructure hero, asymmetric service cards, glass surfaces, red brand, monochrome logos, and content order. This is a framework migration with responsive polish. Source content and original SVG equipment drawings come from `../nexpluslanding`. No invented contacts, price, coverage, SLA or certifications.

## 2. People and tasks

Business visitors compare services, check a location, and prepare a consultation. Technical visitors inspect infrastructure, estimate bandwidth, test their connection, and explore a clearly labelled monitoring demo. Keyboard and screen reader visitors must complete the same flows; phone visitors get a single column and usable controls.

## 3. Tokens

Dark: canvas #080809, surface #101012, raised #18181b, ink #f5f5f6, muted #a6a6ad, rule #303034, glass rgb(16 16 18 / 88%). Light: canvas #fbfbfc, surface #f3f3f5, raised #e9e9ec, ink #101014, muted #5c5c64, rule #d0d0d6, glass rgb(255 255 255 / 88%). Brand #e62629; action #be2024; action hover #a91c20; action ink white. Small accent text #ef4a4d in dark, #be2024 in light. Focus follows ink. Glows use brand at 16% and 32%; grid uses ink at 4%; sheen at 5%; shadow black at 35%. Scrim black at 80%.

SVG metal materials remain dark in both themes: top #49494e, front #27272b, side #161619, edge #63636a, slot #0c0c0e, light #d9d9de. Monitoring: good #53ce99 / #16784d, warning #f1bd62 / #956014, error uses accent text; always paired with status text.

General Sans 500/700 for headings; Switzer 400/500/600 for body, self hosted WOFF2. Desktop hero clamp(3rem, 4.7vw, 4.625rem), line 1.07, tracking -.055em. Mobile hero clamp(2rem, 8.2vw, 2.5rem). Page title clamp(2rem, 3.25vw, 3.25rem). Section title clamp(2rem, 3.2vw, 3rem). Card title 1.375–1.6rem. Body 1rem–1.0625rem, secondary .875–.9375rem, labels .75rem. Body line height 1.7.

4px base spacing: 4/8/12/16/20/24/28/32/40/48/56/64/80/96/112. Max content 1344px, gutter clamp(16px, 4.45vw, 88px). Header 88px desktop, 72px mobile. Panel radius 24px; control 12px; smaller chips 8px. Panel border 1px neutral, inset sheen and 20px/60px/-35px shadow. Selected controls use raised neutral wash and a check; keyboard focus uses a 2px ring.

## 4. Layout and content

Home: Hero → Needs → Coverage teaser → Customers → Why NEX+ → three compact feature teasers → Journey → Partners → Closing → Footer. Desktop hero columns 1.2:1; four needs cards span 7/5 then 6/6 of twelve columns. Phone hero puts proof before artwork; secondary need illustrations shrink to 112px. Services page keeps all five cards and compatibility anchors. Detail pages share one template with breadcrumbs, original copy/use case/art/endpoints, related services and consultation CTA. Ordinary multipage links.

## 5. Component system

Atoms: Button/LinkButton variants, Icon, Brand, Kicker, Panel, input/select/textarea. Molecules: SectionHeading, ServiceCard, LogoStrip, MessageResult, Field, Breadcrumbs, Stat. Organisms: Header, Footer, Hero, HomeSections, consultation dialog, contact/coverage forms, calculator, speed test, monitoring dashboard, infrastructure explorer. Layout: SiteLayout owns metadata and shell; content stays static Astro HTML. Original equipment SVG components render on the server without hydration. React hydrates only interactive organisms. Radix Dialog and shadcn-style CVA Button provide accessible composition.

## 6. Interaction and motion

Header dropdowns use the shared 20px SVG chevron, pointing down when closed and up when open, with a 160ms transform transition. Native details keep keyboard activation and Escape dismissal.

Control feedback 160ms ease-out; arrival fade/translate 400ms; no layout animations. Source customer marquee keeps duplicate track and pauses on hover/focus, with a visible pause control. Reduced motion stops marquee, disables positional animation and smooth scrolling. Infrastructure replay is a finite 1.8s illustration, interrupted on hidden document. Native navigation and saved light/dark preference; initial theme script runs before paint. Consultation has visible close, Escape and focus restoration. Clipboard failure offers selectable text.

## 7. Responsive and accessibility

Breakpoints 640/768/1024px; inspect 320/390/768/1440/1920. No primary horizontal overflow. Header uses a collapsible mobile menu; menus close on Escape. Forms have visible labels, bounded inputs, associated errors and first-error focus. Operations report pending/error/success, speed test can be cancelled. Minimum 44px targets. One H1, landmarks and skip link. Color is never the only status cue.

## 8. Debt and verification

Contact details are approved samples; the site prepares a copyable message until official channels are configured. Monitoring is simulated, permanently noindex. Local speed test measures download from this host and HTTP response time, not upload or an ISP SLA. Production indexes only when enabled; previews do not. This functional scope is accepted in the plan. No additional design or accessibility debt accepted. Verify primitives before full pages, then all routes/themes/widths, real flows, source fidelity, build/check/unit tests and browser audits.
