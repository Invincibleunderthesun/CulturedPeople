# Cultured People

Modern leaderboard with meme reactions and optional Firebase realtime sync.

## Setup

1. Place 4 Indian meme GIFs (or webp) inside `memes/`:
   - `indian1.gif`
   - `indian2.gif`
   - `indian3.gif`
   - `indian4.gif`

2. (Optional) Update Firebase credentials in `firebase-config.js` if needed.

3. Open `index.html` locally to test or push the repository to GitHub to deploy.

## Deploy to GitHub Pages
1. Push this repo to GitHub (branch `main`).
2. The included GitHub Actions workflow will publish the site to GitHub Pages automatically.
3. Your site will be available at `https://<yourusername>.github.io/<repo>`.

## Notes
- The app uses a simple "last write wins" strategy for sync. For production or high-collaboration scenarios, implement per-item timestamps and conflict merging.
- If you remove `firebase-config.js` the site will work locally with `localStorage` only.
