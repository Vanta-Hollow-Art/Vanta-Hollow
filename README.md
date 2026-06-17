# Vanta Hollow

Dark fantasy wall art storefront/funnel for `vanta-hollow.com`, built as a Vite + React static site and ready for Vercel's free hosting tier.

## Local Preview

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## Production Build

```bash
npm run build
```

Vercel will run this build and publish the `dist` folder.

## Deploy To Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, create a new project from that repository.
3. Use the Vite defaults:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add `vanta-hollow.com` in the Vercel project domain settings.
5. At your domain registrar, point DNS to the records Vercel shows for the project.
6. Keep `www.vanta-hollow.com` added too, then choose whether the apex domain or `www` should be primary.

The live site currently funnels shop, collection, cart, search, and shipping links to `https://vantahollow.etsy.com`.
