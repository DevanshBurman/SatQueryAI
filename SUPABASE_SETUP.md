# Supabase setup

The workspace includes passwordless email authentication and a protected profile form. Profile records contain a user's full name and organisation and are readable and writable only by that signed-in user.

1. Create a Supabase project.
2. Open the project's SQL Editor and run `supabase/migrations/202609190001_create_profiles.sql`.
3. Copy `.env.example` to `.env.local`.
4. In the Supabase **Connect** dialog, copy the project URL and publishable key into `.env.local`:

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key
```

5. In **Authentication > URL Configuration**, add `http://127.0.0.1:5173` as a redirect URL for local development.
6. Restart `npm run dev`, open the workspace, and select **Sign in** in the left navigation.

The publishable key is intentionally used in the browser. The migration enables Row Level Security and scopes every profile operation to `auth.uid()`. Never place a Supabase secret key or legacy `service_role` key in a `VITE_` variable.
