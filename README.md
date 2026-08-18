# Vanta Hollow

Dark fantasy wall art storefront/funnel for `vanta-hollow.com`, built as a Vite + React static site and ready for Vercel's free hosting tier.

## Local Preview

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

The ordinary Vite server does not execute the Vercel function in `api/etsy-newest.js`, so the New Relics section keeps its four manual fallback cards during `npm run dev`.

To test the live Etsy integration locally, configure the server-only `ETSY_API_KEY` and `ETSY_SHOP_ID` variables in the Vercel project, pull them into the ignored `.env.local`, and run:

```bash
npx vercel env pull .env.local
npx vercel dev
```

`ETSY_API_KEY` must contain the approved Etsy Seller App keystring and shared secret in Etsy's required `keystring:shared_secret` format. `ETSY_SHOP_ID` must contain the shop's numeric ID. Never prefix either variable with `VITE_`.

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
