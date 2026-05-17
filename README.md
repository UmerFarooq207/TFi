This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## AI Room Visualizer (Runware)

The `/visualizer` page calls Runware's image inference API (FLUX.2 [klein] 9B Base by default) to replace the floor of an uploaded room photo with a chosen tile/plank material.

1. **Set `RUNWARE_API_KEY`** in `.env.local`. Get a key from <https://my.runware.ai/keys>. Optionally override `RUNWARE_VISUALIZER_MODEL` (defaults to `runware:400@3`, the FLUX.2 [klein] 9B Base AIR string).

2. On `/visualizer`, click **Upload your room photo**, pick a flooring swatch, then click **Visualize**. The route at `app/api/visualize/route.ts` sends the room + tile to Runware as reference images and stores the result.

3. Renders are cached on disk under `public/visualizer-cache/_<roomHash>_<flooringId>.png` (room hash = first 16 hex of SHA-256 of the uploaded bytes). Re-requesting the same combination serves from disk and skips Runware.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
