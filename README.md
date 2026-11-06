# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## GitHub Pages

The static app is published at [https://thetinywisdom.github.io/blog-to-carousel/](https://thetinywisdom.github.io/blog-to-carousel/).

Vite's `base` is `/blog-to-carousel/`, so scripts, styles, bundled icons, and files in `public/` (including `favicon.ico`) resolve under that path. React Router uses the same base. The production build also writes `dist/404.html` (a copy of `index.html`) and `dist/.nojekyll` so GitHub Pages can load the single-page app for unknown paths.

`.github/workflows/pages.yml` installs dependencies with `npm ci` on the runner, builds, and deploys `dist/` when `main` is updated. Dependencies and build output stay out of git. The workflow does not create repository secrets and does not set a custom domain.

### What static hosting cannot do

Paste Text, slide editing, cover icons, and PNG/ZIP export run entirely in the browser.

**From URL** does not. It calls the external Supabase edge function `parse-article`, which fetches the article server-side. GitHub Pages cannot host that function. The client uses the existing publishable values `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from `.env` when they are present (anon key only; no service-role secret is added). If those values are removed or the Supabase project is gone, the rest of the app still loads and Paste Text still works. `proxy-image` is a second external function and is not called by the current UI.

This does not change the Lovable project or the custom domain `slides.thetinywisdom.com`.

### Enabling Pages

Pages is not turned on from this repository's workflow. In the repository, open **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**. Do not add a custom domain there.

This repository is private. GitHub Free can publish Pages only from a public repository. A private repository needs GitHub Pro, GitHub Team, or GitHub Enterprise, and the published site is still public on the internet. A truly private site requires GitHub Enterprise Cloud on an organization. The workflow also uses GitHub Actions minutes, which are billed on private repositories after the plan's included amount.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
