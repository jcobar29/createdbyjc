"""Builds dist-artifact/index.html for Claude Artifact hosting.
The Artifact host wraps the main page in its own <!doctype><html><head><body>, so this strips
those wrappers and keeps the head tags (title, meta, fonts, CSS, JSON-LD) at the top of the page."""
import re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
src = (root / "index.html").read_text()
head = re.search(r"<head>(.*?)</head>", src, re.S).group(1)
body = re.search(r"<body>(.*?)</body>", src, re.S).group(1)
head = re.sub(r'\s*<meta (charset|name="viewport")[^>]*>', "", head)
out = root / "dist-artifact"; out.mkdir(exist_ok=True)
(out / "index.html").write_text(head.strip() + "\n" + body.strip() + "\n")
print("wrote", out / "index.html")
# Claude Artifact hosting blocks requests to other sites (Google included), so the hosted preview gets a
# config with no lead endpoint; its form then says honestly that details weren't saved.
cfg = (root / "assets" / "config.js").read_text()
cfg = re.sub(r'leadEndpoint: "[^"]*"', 'leadEndpoint: ""', cfg)
(out / "assets").mkdir(exist_ok=True)
(out / "assets" / "config.js").write_text(cfg)
print("wrote", out / "assets" / "config.js", "(preview: no lead endpoint)")
