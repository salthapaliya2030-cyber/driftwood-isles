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

Click the button, sign in to Vercel if prompted, connect GitHub if requested, and follow Vercel's deployment steps. It creates a separate deployment under the account of the person who clicks it; it cannot deploy to everyone else's accounts automatically. The game is a static site, so select **Other** if asked for a framework, leave the build command blank, and use `.` as the output directory if needed. The game loads Three.js from jsDelivr and requires an internet connection.

## Embed in Google Sites
After deploying, use **Insert → Embed → By URL** and paste your Vercel URL. If you want it embedded, keep the project public and test the published site, not just the Sites editor preview.

## Notes
- Static frontend only; no server or environment variables are needed.
- Starshards and island discovery are saved with `localStorage` in the player's browser.
- Three.js is loaded from a public CDN.
