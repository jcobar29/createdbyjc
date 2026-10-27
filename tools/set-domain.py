"""Run once you have the production domain:  python3 tools/set-domain.py https://www.example.com
Adds absolute canonical + og:url + og:image to the landing page, and writes sitemap.xml and robots.txt.
The thank-you page stays noindex and is left out of the sitemap on purpose."""
import sys, re, pathlib, datetime
if len(sys.argv) != 2 or not sys.argv[1].startswith("https://"):
    sys.exit("usage: python3 tools/set-domain.py https://your-domain.com")
base = sys.argv[1].rstrip("/")
root = pathlib.Path(__file__).resolve().parent.parent
p = root / "index.html"; s = p.read_text()
s = re.sub(r'\s*<link rel="canonical"[^>]*>|\s*<meta property="og:(url|image)"[^>]*>', "", s)
tags = (f'<link rel="canonical" href="{base}/">\n'
        f'<meta property="og:url" content="{base}/">\n'
        f'<meta property="og:image" content="{base}/assets/og-image.jpg">')
s = s.replace("<!-- CANONICAL: added by tools/set-domain.py once the production domain is known -->",
              "<!-- CANONICAL: added by tools/set-domain.py once the production domain is known -->\n" + tags)
s = s.replace('"name": "createdbyjc",', f'"name": "createdbyjc",\n  "url": "{base}/",', 1) if '"url":' not in s else s
p.write_text(s)
today = datetime.date.today().isoformat()
(root / "sitemap.xml").write_text(f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>{base}/</loc><lastmod>{today}</lastmod></url>
</urlset>
''')
(root / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {base}/sitemap.xml\n")
print("canonical, og:url, og:image, sitemap.xml, robots.txt set for", base)
