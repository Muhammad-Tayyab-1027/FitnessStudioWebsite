"""Generate one-page sample websites for local Dublin businesses.

Run: python3 sample-sites/build.py  -> writes sample-sites/<slug>/index.html
"""
import html
import json
import pathlib

ROOT = pathlib.Path(__file__).parent
BUSINESSES = json.loads((ROOT / "businesses.json").read_text())

TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>{name} | {area}</title>
<meta name="description" content="{tagline}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family={font_url}&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root {{
  --bg: {bg}; --surface: {surface}; --ink: {ink}; --muted: {muted};
  --accent: {accent}; --accent-ink: {accent_ink}; --line: {line};
}}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
html {{ scroll-behavior: smooth; }}
body {{ background: var(--bg); color: var(--ink); font: 16px/1.6 Inter, system-ui, sans-serif; }}
a {{ color: inherit; }}
.wrap {{ max-width: 1080px; margin: 0 auto; padding: 0 20px; }}
h1, h2, h3, .brand {{ font-family: "{font}", Georgia, serif; font-weight: 600; line-height: 1.15; }}
header {{ position: sticky; top: 0; z-index: 10; background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(8px); border-bottom: 1px solid var(--line); }}
header .wrap {{ display: flex; align-items: center; justify-content: space-between; height: 64px; gap: 16px; }}
.brand {{ font-size: 1.35rem; text-decoration: none; }}
nav a {{ text-decoration: none; color: var(--muted); margin-left: 22px; font-size: .95rem; }}
nav a:hover {{ color: var(--ink); }}
.btn {{ display: inline-block; background: var(--accent); color: var(--accent-ink); text-decoration: none;
  padding: 13px 26px; border-radius: 999px; font-weight: 600; transition: transform .15s; }}
.btn:hover {{ transform: translateY(-2px); }}
.btn.ghost {{ background: transparent; color: var(--ink); border: 1.5px solid var(--line); }}
.hero {{ padding: 96px 0 88px; background: {hero_bg}; }}
.eyebrow {{ text-transform: uppercase; letter-spacing: .16em; font-size: .78rem; color: var(--accent); font-weight: 600; }}
.hero h1 {{ font-size: clamp(2.4rem, 6vw, 4.4rem); margin: 14px 0 18px; max-width: 14ch; }}
.hero p {{ color: var(--muted); font-size: 1.15rem; max-width: 46ch; margin-bottom: 32px; }}
.hero .actions {{ display: flex; gap: 12px; flex-wrap: wrap; }}
section {{ padding: 80px 0; }}
section h2 {{ font-size: clamp(1.8rem, 4vw, 2.6rem); margin: 10px 0 36px; }}
.grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 18px; }}
.card {{ background: var(--surface); border: 1px solid var(--line); border-radius: 18px; padding: 26px; }}
.card .icon {{ font-size: 1.6rem; margin-bottom: 14px; }}
.card h3 {{ font-size: 1.2rem; margin-bottom: 6px; }}
.card p {{ color: var(--muted); font-size: .95rem; }}
.about {{ background: var(--surface); border-block: 1px solid var(--line); }}
.about .wrap {{ display: grid; grid-template-columns: 1.1fr 1fr; gap: 48px; align-items: center; }}
.about p {{ color: var(--muted); margin-bottom: 14px; }}
.badge {{ aspect-ratio: 1; border-radius: 28px; background: {badge_bg}; display: grid; place-items: center;
  color: var(--accent-ink); text-align: center; padding: 30px; }}
.badge strong {{ font-family: "{font}", serif; font-size: clamp(2.2rem, 5vw, 3.4rem); display: block; line-height: 1.05; }}
.visit .wrap {{ display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }}
.visit dl {{ display: grid; grid-template-columns: auto 1fr; gap: 10px 24px; }}
.visit dt {{ color: var(--muted); }}
.cta {{ text-align: center; background: var(--accent); color: var(--accent-ink); border-radius: 28px; padding: 64px 24px; margin: 0 20px 80px; }}
.cta h2 {{ margin: 0 0 12px; }}
.cta p {{ opacity: .85; margin-bottom: 28px; }}
.cta .btn {{ background: var(--accent-ink); color: var(--accent); }}
footer {{ border-top: 1px solid var(--line); padding: 28px 0; color: var(--muted); font-size: .85rem; }}
footer .wrap {{ display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; }}
@media (max-width: 760px) {{
  nav {{ display: none; }}
  .about .wrap, .visit .wrap {{ grid-template-columns: 1fr; }}
  .hero {{ padding: 64px 0; }}
  section {{ padding: 60px 0; }}
}}
</style>
</head>
<body>
<div style="background:#111;color:#fff;font:13px/1.4 Inter,system-ui,sans-serif;text-align:center;padding:8px 16px">Unofficial design preview made by Muhammad Tayyab. Not the official website of {name} and not affiliated with it.</div>
<header>
  <div class="wrap">
    <a class="brand" href="#">{name}</a>
    <nav><a href="#services">Services</a><a href="#about">About</a><a href="#visit">Visit</a></nav>
    <a class="btn" href="{book_href}">{book_label}</a>
  </div>
</header>

<div class="hero">
  <div class="wrap">
    <div class="eyebrow">{area}</div>
    <h1>{headline}</h1>
    <p>{tagline}</p>
    <div class="actions">
      <a class="btn" href="{book_href}">{book_label}</a>
      <a class="btn ghost" href="#services">See services</a>
    </div>
  </div>
</div>

<section id="services">
  <div class="wrap">
    <div class="eyebrow">What we do</div>
    <h2>{services_title}</h2>
    <div class="grid">{services}</div>
  </div>
</section>

<section id="about" class="about">
  <div class="wrap">
    <div>
      <div class="eyebrow">About us</div>
      <h2>{about_title}</h2>
      {about}
    </div>
    <div class="badge"><div><strong>{badge_big}</strong>{badge_small}</div></div>
  </div>
</section>

<section id="visit" class="visit">
  <div class="wrap">
    <div>
      <div class="eyebrow">Visit</div>
      <h2>Find us</h2>
      <dl>
        <dt>Address</dt><dd>{address}</dd>
        {phone_row}
        <dt>Email</dt><dd><a href="mailto:{email}">{email}</a></dd>
      </dl>
    </div>
    <div class="card">
      <h3>Opening hours</h3>
      <p>{hours}</p>
    </div>
  </div>
</section>

<div class="cta">
  <h2>{cta_title}</h2>
  <p>{cta_text}</p>
  <a class="btn" href="{book_href}">{book_label}</a>
</div>

<footer>
  <div class="wrap">
    <span>&copy; {name}, {area}</span>
    <span>Unofficial concept by Muhammad Tayyab (vibecoders.ie@gmail.com). Removed on request.</span>
  </div>
</footer>
</body>
</html>
"""


def card(icon, title, text):
    return (f'<div class="card"><div class="icon">{icon}</div>'
            f'<h3>{html.escape(title)}</h3><p>{html.escape(text)}</p></div>')


def render(b):
    e = {k: html.escape(v) if isinstance(v, str) else v for k, v in b.items()}
    e["services"] = "".join(card(*s) for s in b["services"])
    e["about"] = "".join(f"<p>{html.escape(p)}</p>" for p in b["about"])
    e["font_url"] = b["font"].replace(" ", "+") + ":wght@500;600"
    if b["phone"].startswith("+"):
        tel = b["phone"].replace(" ", "")
        e["phone_row"] = f'<dt>Phone</dt><dd><a href="tel:{tel}">{e["phone"]}</a></dd>'
        e["book_href"] = f"tel:{tel}"
    else:
        e["phone_row"] = ""
        e["book_href"] = f"mailto:{e['email']}"
    return TEMPLATE.format(**e)


for b in BUSINESSES:
    out = ROOT / b["slug"] / "index.html"
    out.parent.mkdir(exist_ok=True)
    out.write_text(render(b))
    print("wrote", out)
