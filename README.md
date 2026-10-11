# NEX+

Astro + React islands + Tailwind CSS. Node 22.12+ required.

```sh
npm ci
cp .env.example .env
npm run dev
```

Set `SITE_URL` in `.env` to the production origin, then rebuild. `.env` stays outside Git. `SITE_INDEXABLE=false` disables indexing. Vercel previews always disable indexing.

```sh
npm run check
npm run build
npm run preview
```
