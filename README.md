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

## AI Room Visualizer (Python backend)

The `/visualizer` page can call the FastAPI service in `../Visualizer` to apply real material textures onto a user-uploaded room photo.

1. **Start the Python service** (in a separate terminal):

   ```bash
   cd ../Visualizer
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```

   The first run downloads the segmentation model (~500MB).

2. **Set `VISUALIZER_API_URL`** in `.env.local` (defaults to `http://localhost:8000`).

3. On the `/visualizer` page, click **Upload your room photo**, then pick any product swatch — the rendered AI preview replaces the CSS scene. The proxy lives at `app/api/visualize/route.ts` and forwards the request to `POST /api/v1/render` on the FastAPI service.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
