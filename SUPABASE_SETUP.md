# Supabase setup

The workspace includes email/password and Google authentication plus a protected profile form. Profile records contain a user's full name and organisation and are readable and writable only by that signed-in user.

1. Create a Supabase project.
2. Open the project's SQL Editor and run all migrations in order:
   - `supabase/migrations/202609190001_create_profiles.sql`
   - `supabase/migrations/202609190002_create_user_workspaces.sql`
   - `supabase/migrations/202609190003_enforce_workspace_ownership.sql`
3. Copy `.env.example` to `.env.local`.
4. In the Supabase **Connect** dialog, copy the project URL and publishable key into `.env.local`:

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key
```

5. In **Authentication > URL Configuration**, add `http://127.0.0.1:5173` as a redirect URL for local development.
6. Restart `npm run dev`, open the workspace, and select **Sign in** in the left navigation.

## Enable Google sign-in

In Supabase, go to **Authentication → Providers → Google** and enable the provider. Create a Google OAuth **Web application** client, then enter its client ID and secret in Supabase. In Google Cloud, add the callback URL shown by the Supabase Google-provider page as an authorised redirect URI. Also add `http://127.0.0.1:5173` to Supabase **Authentication → URL Configuration → Redirect URLs**.

The second migration creates a private workspace for every account plus projects and query-history tables. The third ensures child records can only reference the signed-in user's own workspace and projects. Each table has Row Level Security policies that scope data to `auth.uid()`. The publishable key is intentionally used in the browser; never place a Supabase secret key or legacy `service_role` key in a `VITE_` variable.
