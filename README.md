# createdbyjc — 30-Day Content-to-Sales Roadmap funnel

Landing page → thank-you page. Plain HTML/CSS/JS, no build step. Upload this folder to any static host
(Netlify, Vercel, Cloudflare Pages, GitHub Pages, Hostinger) and it runs as-is.

## Files
- `index.html`: landing page (indexable)
- `thank-you.html`: thank-you page (`noindex, follow`, not in the sitemap)
- `assets/site.css`, `assets/site.js`: shared styles and behavior
- `assets/config.js`: **the only file you edit to connect things**
- `assets/*.webp`, `assets/og-image.jpg`: optimized from the supplied images
  - `jc-hero` ← your headphones reference photo, cut out with its white outline (hero)
  - `jc-focus` ← 8.png, cut out in the same grayscale + white-outline style (positioning section)
  - `jc-laptop` ← 7.png, same treatment (thank-you, done-for-you section)
  - 6.png is no longer used (it read as too heavy in the hero)
  - `content-formats` ← 10.png (slider slide 1, share image)
  - `workspace` ← 11.png, cropped to the desk scene (slider slide 2)
  - 9.png is not used because it is a faded copy of 11.png
- `tools/set-domain.py`: adds canonical, og:url, og:image, sitemap.xml and robots.txt for your real domain
- `tools/build-artifact.py`: rebuilds the Claude-hosted version in `dist-artifact/`

## Before going live on your domain
1. Leads → Google Sheet: follow the steps at the top of `tools/google-sheets-leads.gs`, then paste the Web app URL into `assets/config.js` as `leadEndpoint`. Until it's set, the form tells visitors their details were not saved.
   - The Notion roadmap link is already set in `assets/config.js` (`roadmapUrl`) and opens publicly.
2. Run `python3 tools/set-domain.py https://your-domain.com`, then upload the folder.

## Google Search Console checklist
- Add and verify the production domain (DNS TXT record).
- Submit `https://your-domain.com/sitemap.xml`.
- Use URL Inspection on the home page and request indexing.
- Check that `/thank-you.html` reports "Excluded by noindex".
These steps help Google find the page. They don't guarantee indexing or rankings.
