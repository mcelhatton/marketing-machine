#!/usr/bin/env python3
"""Convert the 7 use-case articles (txt) into styled HubSpot blog post drafts."""
import os, re, json, glob, urllib.request

TOKEN = os.environ["HUBSPOT_ACCESS_TOKEN"]
BLOG_ID = "2954378491"
AUTHOR_ID = "66310716550"
SRC = "/tmp/mdd-articles"

# Per-article SEO + slug, keyed by a substring of the filename.
META = {
    "Built for the Lot": dict(
        slug="built-for-the-lot-not-the-highway",
        htmlTitle="Built for the Lot: Why Dealers Needed More Than GPS",
        meta="Why GPS fails on a dealership lot and how MDD built a real-time location system at the world's largest dealership. See it in a demo.",
    ),
    "Every Car, Every Key": dict(
        slug="every-car-every-key-lot-visibility",
        htmlTitle="Every Car, Every Key: Lot Visibility That Wins Sales",
        meta="Find any vehicle and key in seconds, end lot rot, and breeze through floor-plan audits with MDD real-time tracking. Schedule a demo.",
    ),
    "Readiness at the Door": dict(
        slug="readiness-at-the-door-wins-the-sale",
        htmlTitle="Readiness at the Door: How Prep Decides the Sale",
        meta="Today's buyers arrive for one specific car. MDD returns about 45 minutes per sale so your team looks fast and prepared. See a demo.",
    ),
    "FTC and Dealer Addendums": dict(
        slug="ftc-addendums-dealer-pricing-playbook",
        htmlTitle="Addendums, the FTC & the Dealer Pricing Playbook",
        meta="New FTC scrutiny is reshaping dealer addendums. See what a compliant, profitable package looks like and how MDD fits. Book a demo.",
    ),
    "Future of Automotive Reinsurance": dict(
        slug="future-of-automotive-reinsurance-wisetrak",
        htmlTitle="The Future of Automotive Reinsurance Income",
        meta="VSC margins are compressing. See how Wisetrak adds high-volume, low-loss products to your reinsurance book. Schedule a demo with MDD.",
    ),
    "Margin Is Made in Recon": dict(
        slug="the-margin-is-made-in-recon",
        htmlTitle="The Margin Is Made in Recon | Mobile Dealer Data",
        meta="Every day in recon is money off the hood. See how RTLS-driven recon gives you Time-to-Line data you can trust. Schedule a demo.",
    ),
    "Three Departments, One Platform": dict(
        slug="three-departments-one-platform",
        htmlTitle="Three Departments, One Platform | Mobile Dealer Data",
        meta="One platform, three profit centers: service, used cars, and F&I. See how MDD turns real-time location into margin. Schedule a demo.",
    ),
}

def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def is_heading(line):
    if len(line) > 70: return False
    if line.endswith((".", "?", "!", ":", ",", ";")): return False
    if len(line.split()) < 2: return False
    return line[0].isupper()

def convert(lines):
    """lines: list after title (idx0 eyebrow, idx1 title already removed). idx0 here = deck."""
    html = []
    bullets = []
    def flush():
        nonlocal bullets
        if bullets:
            html.append("<ul>" + "".join(f"<li>{esc(b)}</li>" for b in bullets) + "</ul>")
            bullets = []
    # first remaining line is the deck
    if lines:
        html.append(f'<p><strong>{esc(lines[0])}</strong></p>')
    body = lines[1:]
    i = 0
    while i < len(body):
        ln = body[i].strip()
        if not ln:
            i += 1; continue
        # CTA block
        if ln.upper().startswith("THE PATH FORWARD"):
            flush()
            # gather rest until "Start the conversation" or disclaimer
            cta = []
            i += 1
            while i < len(body):
                t = body[i].strip()
                if t.startswith("Start the conversation") or t.startswith("This article") or t.startswith("Related MDD Insight") or t.startswith("Reinsurance structures") or t.startswith("Industry data"):
                    break
                if t: cta.append(t)
                i += 1
            inner = []
            cb = []
            for c in cta:
                if c.startswith("✓"):
                    cb.append(c.lstrip("✓ ").strip())
                else:
                    if cb:
                        inner.append("<ul>" + "".join(f"<li>{esc(x)}</li>" for x in cb) + "</ul>"); cb = []
                    inner.append(f"<p>{esc(c)}</p>")
            if cb:
                inner.append("<ul>" + "".join(f"<li>{esc(x)}</li>" for x in cb) + "</ul>")
            html.append('<div style="background:#1A1E24;border:1px solid #2D3239;border-radius:16px;padding:28px;margin:32px 0;color:#F5F6F4;">'
                        '<p style="color:#8AC833;font-weight:700;letter-spacing:2px;text-transform:uppercase;font-size:12px;margin:0 0 8px;">The Path Forward</p>'
                        + "".join(inner) +
                        '<p style="margin-top:16px;"><a href="https://mdd.io/preview-contact-us" style="display:inline-block;background:#8AC833;color:#1A1E24;font-weight:700;padding:12px 24px;border-radius:9999px;text-decoration:none;">Schedule a 15-Min Demo &rarr;</a></p>'
                        '</div>')
            continue
        if ln.startswith("Related MDD Insight"):
            flush()
            html.append(f'<p style="font-style:italic;color:#6B7280;border-top:1px solid #e5e5e5;padding-top:16px;">{esc(ln)}</p>')
            i += 1; continue
        if ln.startswith("This article") or ln.startswith("Reinsurance structures") or ln.startswith("Industry data"):
            flush()
            html.append(f'<p style="font-size:13px;color:#9CA3AF;">{esc(ln)}</p>')
            i += 1; continue
        if ln.startswith("Start the conversation"):
            i += 1; continue
        # pull quote (curly or straight quote at start AND end)
        if (ln[0] in "“\"") and (ln[-1] in "”\"" or ln[-2:] in ('."', '?"')):
            flush()
            q = ln.strip("“”\"")
            html.append(f'<blockquote style="border-left:4px solid #8AC833;padding-left:20px;margin:28px 0;font-size:20px;font-weight:500;color:#1A1E24;font-style:italic;">{esc(q)}</blockquote>')
            i += 1; continue
        # bullets
        if ln.startswith("•") or ln.startswith("•"):
            bullets.append(ln.lstrip("•• \t").strip()); i += 1; continue
        if ln.startswith("✓"):
            bullets.append(ln.lstrip("✓ ").strip()); i += 1; continue
        # heading
        if is_heading(ln):
            flush()
            html.append(f"<h2>{esc(ln)}</h2>")
            i += 1; continue
        # normal paragraph
        flush()
        html.append(f"<p>{esc(ln)}</p>")
        i += 1
    flush()
    return "\n".join(html)

def post(payload):
    req = urllib.request.Request(
        "https://api.hubapi.com/cms/v3/blogs/posts",
        data=json.dumps(payload).encode(),
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req) as r:
        return json.load(r)

for path in sorted(glob.glob(f"{SRC}/*.txt")):
    fname = os.path.basename(path)
    key = next((k for k in META if k in fname), None)
    if not key:
        print("NO META for", fname); continue
    m = META[key]
    raw = [l.rstrip() for l in open(path, encoding="utf-8")]
    raw = [l for l in raw if l.strip() != ""]
    title = raw[1]  # idx0 eyebrow, idx1 title
    body_lines = raw[2:]
    body_html = convert(body_lines)
    payload = dict(
        name=title,
        contentGroupId=BLOG_ID,
        slug=f"null/blog/{m['slug']}",
        blogAuthorId=AUTHOR_ID,
        htmlTitle=m["htmlTitle"],
        metaDescription=m["meta"],
        postBody=body_html,
        state="DRAFT",
    )
    try:
        res = post(payload)
        print("CREATED:", m["slug"], "| id:", res.get("id"), "| url:", res.get("url"))
    except urllib.error.HTTPError as e:
        print("ERROR", m["slug"], e.code, e.read().decode()[:300])
