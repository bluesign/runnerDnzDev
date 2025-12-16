# Sidebar with Supabase Authentication - Setup Guide

This implementation adds a left sidebar with user authentication and snippet collection management using Supabase.

## Features Implemented

- ✅ Hamburger menu toggle for sidebar (open/close state persists)
- ✅ Default tree structure (Mainnet/Testnet with Scripts/Transactions folders)
- ✅ Create new script/transaction files with templates
- ✅ Supabase authentication UI (login/logout)
- ✅ User snippet collection management (CRUD operations)
- ✅ Sidebar state persistence across page reloads

## Supabase Setup

### Known Issue with Build

Due to a known issue with Supabase.js v2 and Next.js static exports, the Supabase library cannot be bundled during build time. The implementation uses runtime-only loading via dynamic imports.

**Current Status**: Supabase is installed and the integration code is complete, but to successfully build without Supabase, you need to either:

1. **Option A**: Remove Supabase from package.json for builds (recommended for now):
   ```bash
   npm uninstall @supabase/supabase-js
   npm run build
   ```

2. **Option B**: Configure Supabase and it will work at runtime (for development):
   ```bash
   npm install @supabase/supabase-js
   npm run dev  # Works fine in development mode
   ```

### Setting up Supabase (Optional - for authentication features)

1. Create a Supabase project at [https://supabase.com](https://supabase.com)

2. Create a `.env.local` file in the project root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Run the SQL schema in your Supabase SQL editor:
   ```bash
   # The schema file is located at:
   supabase/schema.sql
   ```

4. Configure GitHub OAuth in Supabase:
   - Go to Authentication > Providers
   - Enable GitHub provider
   - Add your GitHub OAuth credentials
   - Set redirect URL to your app's domain

## Usage

### Without Authentication

The sidebar works without Supabase configuration. Users can:
- Toggle sidebar open/close (state persists)
- Expand/collapse folders
- Create new scripts and transactions with templates
- Templates are loaded into the editor but not saved

### With Supabase Authentication

When Supabase is configured, users can:
- Log in with GitHub
- Save snippets to their personal collection
- Load their saved snippets across sessions
- Organize snippets in Mainnet/Testnet folders
- CRUD operations on their snippets

## File Structure

```
src/
├── components/core/
│   ├── Sidebar.tsx          # Main sidebar component
│   └── Sidebar.css          # Sidebar styles
├── services/
│   └── snippetService.ts    # Supabase CRUD operations
├── state/
│   └── index.ts            # App state (includes sidebar.isOpen)
└── pages/
    └── _app.tsx            # Includes Sidebar.css import

supabase/
└── schema.sql              # Database schema for user snippets
```

## Templates

Default templates are provided for:

### Script Template
```cadence
// New Script
pub fun main() {
  // Your code here
}
```

### Transaction Template
```cadence
// New Transaction
transaction {
  prepare(signer: AuthAccount) {
    // Your code here
  }
  execute {
  }
}
```

## Development

```bash
# Install dependencies (without Supabase for successful builds)
npm install

# Run development server (Supabase works here if installed)
npm run dev

# Build for production
npm run build
```

## Future Improvements

- Custom folder creation
- Rename files/folders
- Delete snippets
- Export/import snippet collections
- Share snippets with other users
- Resolve Supabase build issue with webpack configuration
