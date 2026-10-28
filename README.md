# Driftwood Isles

A small original browser-based 3D exploration game made for static hosting on Vercel.

## Play
- Move with **WASD** or arrow keys.
- Hold **Shift** to run.
- Drag the mouse to orbit the camera.
- Collect five starshards, then press **BUILD** to wake the beacon.
- Keep exploring and find the little islands. Progress is saved in the browser on that device.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsalthapaliya2030-cyber%2Fdriftwood-isles)

Click the button to import this project into your Vercel account and deploy your own live copy. Vercel may ask you to sign in and authorize GitHub first. This creates a deployment for whoever clicks it; it does not publish to every visitor automatically.
1. Create a new GitHub repository named `driftwood-isles`.
2. Upload `index.html`, `style.css`, `game.js`, `package.json`, and `vercel.json` to the repository root.
3. In Vercel, choose **Add New → Project**, import the GitHub repository, and deploy.
4. Framework preset: **Other**. Build command: leave blank. Output directory: `.`.
5. Once deployed, open the Vercel URL. The game uses Three.js from jsDelivr, so it needs an internet connection.

## Embed in Google Sites
After deploying, use **Insert → Embed → By URL** and paste your Vercel URL. If you want it embedded, keep the project public and test the published site, not just the Sites editor preview.

## Notes
- Static frontend only; no server or environment variables are needed.
- Starshards and island discovery are saved with `localStorage` in the player's browser.
- Three.js is loaded from a public CDN.
