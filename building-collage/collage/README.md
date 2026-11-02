# Building Collage

An interactive collage of buildings. Visitors drag around a layered paper board, zoom in, pick up and move the pictures, and tap a building to open its story in a side panel.

## Files

| File | What it is |
|---|---|
| `index.html` | The page (no need to edit) |
| `data.js` | **Your content** – titles, facts, text, image paths, and a few settings |
| `style.css` | Colours and fonts are at the top under `:root` if you want to restyle |
| `script.js` | The behaviour (no need to edit) |
| `images/` | Put your photos here |

## Adding your images and text

1. Put your photos in `images/` named `01.jpg`, `02.jpg` … `10.jpg` (or any names – just match them in `data.js`). Around 1200–1600px wide is plenty; larger files load slowly.
2. Open `data.js` and fill in each building's `title`, `facts`, `text` and `credit`.
3. Add or remove entries as you like – the layout adapts. Missing images show a drawn placeholder.

Settings at the top of `data.js`:
- `title` – the cut-out title in the corner
- `seed` – change the number for a different starting arrangement
- `idleSeconds` – after this long untouched the work resets for the next visitor (0 = never)
- `attractMode` – while idle, the camera slowly tours the buildings

## Putting it on GitHub Pages

1. Create a new public repository on github.com.
2. Click **Add file → Upload files**, drag in everything in this folder (including the `images` folder), and commit.
3. Go to **Settings → Pages**, set *Source* to **Deploy from a branch**, branch **main**, folder **/ (root)**, and save.
4. After a minute your work is live at `https://<your-username>.github.io/<repo-name>/`.

Note: GitHub file names are case-sensitive – `01.JPG` and `01.jpg` are different.

## How visitors play

- **Drag the background** to wander (it glides when flung)
- **Scroll / pinch** to zoom
- **Tap a building** to open its panel; **drag a building** to pick it up and move it
- **◀ ▶** or arrow keys step through the buildings like a carousel
- **⤢** shows the whole collage, **✂ shuffle** re-scatters everything
- `Esc` closes the panel

## Exhibition tips

- Run the browser full screen (F11), or in Chrome kiosk mode: `chrome --kiosk https://<your-url>`
- Works with mouse, trackpad and touchscreens. On a portrait screen the panel becomes a bottom sheet.
- Test once on the exhibition machine with the venue's wifi – or download the folder and open `index.html` locally as a backup (fonts need internet; it falls back gracefully without).
