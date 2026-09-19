# Vercel deployment

SatQueryAI is configured as one Vercel project:

- Vite builds the frontend into `dist`.
- `api/index.py` exposes the FastAPI app as a Vercel Python Function.
- The browser uses same-origin `/api/*` requests, so no production API URL is required.

## 1. Import or deploy the repository

In Vercel, create a project from this repository. Vercel should detect **Vite**. Keep these settings:

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

Alternatively, from the repository root run:

```powershell
npx vercel --prod
```

## 2. Add the Supabase browser variables

In **Vercel → Project → Settings → Environment Variables**, add both values from `.env.local`:

```ini
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Select **Production**, **Preview**, and **Development**, then redeploy. These are browser-facing Supabase values; never add a Supabase service-role key to a `VITE_` variable.

## 3. Connect the deployed URL to Supabase Auth

After Vercel gives you a URL such as `https://satquery-ai.vercel.app`, open **Supabase → Authentication → URL Configuration**:

1. Set **Site URL** to the exact Vercel production URL.
2. Add these **Redirect URLs**:
   - `https://satquery-ai.vercel.app/**`
   - `http://127.0.0.1:5173/**`
   - `http://localhost:5173/**`

Replace the example Vercel hostname with the real hostname. Keep the local entries for development.

## 4. Update the Google OAuth client

In **Google Cloud Console → Google Auth Platform → Clients → your Web application client**:

1. Add `https://satquery-ai.vercel.app` to **Authorized JavaScript origins**.
2. Keep this Supabase URL in **Authorized redirect URIs**:
   `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

The Vercel hostname is an origin, not Google's callback URI. Supabase receives Google's callback and then sends the user back to the allowed app URL.

## 5. Verify production

Open the deployed site and check:

1. Email sign-up, confirmation, sign-in, and sign-out.
2. Google sign-in returns to the Vercel URL.
3. Two different accounts see different projects and query history.
4. `https://YOUR_VERCEL_DOMAIN/api/health` returns `{"status":"ok", ...}`.
5. `https://YOUR_VERCEL_DOMAIN/api/docs` opens the API documentation.
