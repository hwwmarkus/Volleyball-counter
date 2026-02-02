# Volleyball Scoreboard (Prototype)

A minimal, offline scoreboard for volleyball — two sides with add/subtract, editable team names, keyboard shortcuts, and persistence via localStorage.

## Quick Start

1. Open the folder `c:\Volleyball Counter`.
2. Double-click `index.html` to open it in your browser.
3. Edit team names by clicking them.
4. Use buttons or keyboard shortcuts.

## Use on iPhone

You have two easy options:

1) Local network (quick test)

- Connect your iPhone and Windows PC to the same Wi‑Fi.
- Start a simple local server on Windows in the project folder:

```powershell
cd "c:\Volleyball Counter"
python -m http.server 5500
```

If Python isn’t installed, use Node instead:

```powershell
cd "c:\Volleyball Counter"
npx http-server -p 5500
```

- On your Windows PC, find your local IP (e.g., `192.168.1.23`).
- On iPhone Safari, open `http://<your-ip>:5500` (e.g., `http://192.168.1.23:5500`).

2) Publish via GitHub Pages (recommended)

- Create a GitHub repository and push these files.
- In the repo Settings → Pages, enable Pages from the `main` branch root.
- Open the site over HTTPS (e.g., `https://<your-user>.github.io/<repo>/`).
- On iPhone, open the site in Safari.

### Your Repository

Repository (HTTPS): `https://github.com/hwwmarkus/Volleyball-counter.git`

Push steps from Windows PowerShell:

```powershell
cd "c:\Volleyball Counter"
git init
git add index.html script.js style.css manifest.webmanifest sw.js icons
git commit -m "Initial commit: Volleyball Scoreboard PWA"
git branch -M main
git remote add origin https://github.com/hwwmarkus/Volleyball-counter.git
git push -u origin main
```

Then enable GitHub Pages:

- GitHub → Repository → Settings → Pages.
- Source: Deploy from a branch → Branch: `main` → Folder: `/ (root)` → Save.
- Site URL: `https://hwwmarkus.github.io/Volleyball-counter/` (may take ~1 minute to go live).

### Add to Home Screen (PWA)

This project includes a basic web app manifest and service worker, so when hosted over HTTPS (GitHub Pages), you can install it to your iPhone Home Screen:

- In Safari, tap the Share button → Add to Home Screen.
- The app will open fullscreen and cache assets for offline use.

Optional: add icons for a nicer home screen appearance.

- Place PNG icons at `icons/icon-192.png` and `icons/icon-512.png`.
- Recommended sizes: 192×192 and 512×512.
- After adding icons, redeploy or refresh the page.

## Controls

- Use the on-screen buttons to add or subtract points for each side.
- Edit team names by tapping/clicking the name fields.
- Press the centered "Reset Match" button to clear points and sets.
- Use "Fullscreen" in the header for a display view.

## Notes

 - Scores cannot go below 0; points cap at 25 per set.
 - Team names, scores, and sets persist locally.
 - Sets: Each set is to 25 points. When a side reaches 25, the set is awarded automatically and points reset for the next set. The current set number is shown in the center.
 - Sets: Each set is to 25 points with a win-by-2 rule. If the score reaches 24–24 (Deuce), play continues beyond 25 until one team leads by 2 (e.g., 26–24, 27–25). The current set number is shown in the center, with a “Deuce” indicator when tied at or beyond 24.
- History: Below the scoreboard, a History panel shows the most recent events (point +/−, set awards, and match resets). Use the “Clear History” button to empty the list. History persists locally.
 - Final Score: Under the set label, the app shows the match sets summary as `TeamLeft X–Y TeamRight`. It updates automatically when sets are awarded and resets to `0–0` on match reset.
 - Reset: The centered “Reset Match” button resets both points and sets back to 0 (starts at Set 1).
- Future ideas: serve indicator, win-by-2 rule, final set to 15, timeouts, theme controls, and a dedicated "display-only" mode.
