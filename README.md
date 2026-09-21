# Evelyn — Restaurant Video, New York City

A four-page portfolio site for GitHub Pages. Black, white and chrome.
No build step, no framework, no server.

```
index.html              About me
work.html               Video showcase
rates.html              Rates & services
contact.html            Contact form
assets/css/styles.css   all styling (light + dark)
assets/js/main.js       shared behaviour for every page
assets/videos/          your three clips
assets/img/             your photos go here
.nojekyll               tells GitHub Pages to serve the files as-is
```

Every page shares the same header, footer and stylesheet, so a change to the nav
means editing the same four lines in each of the four HTML files.

---

## 1. Put it on GitHub Pages

The site is published from the `Evelyn` repo on the `Crossur` account:

**https://crossur.github.io/Evelyn/**

Repo settings: **Settings → Pages → Source: Deploy from a branch →
Branch `main` / `(root)`.**

To publish a change:

```bash
git add -A
git commit -m "Describe what changed"
git push
```

It goes live about a minute later.

> If the site ever moves to a different URL or a custom domain, change `BASE`
> at the top of the page generator and re-export, or hand-edit the
> `og:url`, `og:image` and `<link rel="canonical">` tags in all four HTML
> files. Those must be absolute URLs or link previews break.

### Preview locally first

```bash
python3 -m http.server 8000
```
…then open <http://localhost:8000>.

---

## 2. The contact form

The form is frontend-only — there is no server. It posts straight to Formspree
over AJAX, so the visitor never leaves the page.

**It is already connected** to form `mgavaygo`. The settings live in the
`CONFIG` block at the top of [`assets/js/main.js`](assets/js/main.js):

```js
PROVIDER: "formspree",
ENDPOINT: "https://formspree.io/f/mgavaygo",
EMAIL:    "rinawydmgmt@gmail.com",   // shown on the page, and the fallback inbox
```

Each submission arrives with the restaurant name, service, desired date, email,
phone and optional message, a subject line naming the restaurant, and
`Reply-To` set to the sender — so hitting **Reply** in Gmail answers the
restaurant directly.

Things worth knowing:

- **The free tier is 50 submissions a month.** Formspree emails you when you
  approach it. Past that, submissions are held rather than delivered.
- **Formspree asks you to confirm the form the first time it receives a
  submission.** Send one test enquiry through the live site and click the
  confirmation link, or real enquiries may sit unconfirmed.
- **Spam.** The form has a hidden honeypot field that silently drops bots
  before anything is sent. Formspree has its own filtering on top.
- **The endpoint is public**, visible in the JavaScript. That is normal and
  safe — it is submit-only and cannot read your submissions.

If the network call fails, the form keeps what the visitor typed, shows an
error, and points them at `rinawydmgmt@gmail.com` so the enquiry is not lost.

### Switching providers

`PROVIDER` accepts three values. `"formspree"` is live. `"web3forms"` uses
`ACCESS_KEY` instead of `ENDPOINT`. `"mailto"` needs no account at all — it
opens the visitor's email app pre-filled and addressed to `EMAIL`, which always
works but relies on them pressing send. The code for all three is already
written; only `CONFIG` changes.

## 3. Swap in your own content

| What | Where |
|---|---|
| Name, bio, city | `index.html` (city is set to New York City) |
| Stats (videos delivered, kitchens) | `index.html` — the `.stats` list |
| Social links | `index.html` — search for `YOUR_HANDLE` |
| Site icon / favicon | `assets/img/icon/` — see Photos below |
| Package names & prices | `rates.html` — the two `.rate-row` blocks |
| Intro-offer badges, how-it-works steps | `rates.html` |
| Email & phone on the page | `contact.html`, plus `CONFIG.EMAIL` in `main.js` |
| Dropdown options | `contact.html` — the `<select id="service">` |
| Footer email | all four files — the last footer link |
| Colours & type | `assets/css/styles.css` — the `:root` block |

If you change a package name in `rates.html`, change the matching `<option>` in
`contact.html` too — the "Enquire" buttons pass the name across in the URL
(`contact.html?service=Social+Media+Management`) and the form pre-selects it
on arrival.

### Photos & icons

There is no portrait on the About page — it is text only, by design.

There are two separate icons, on purpose:

**The tab icon** (browser tab, bookmarks, phone home screen) is a drawn
fork-and-knife mark, not a photo. The master is
`assets/img/icon/favicon.svg` — edit that file to change it. Modern browsers
use the SVG directly; the PNGs beside it are fallbacks for Safari, iOS and
Android, so re-export them at 32, 180 and 512 px if you change the drawing.

**The round photo beside the name in the header** is `assets/img/icon/brand.png`,
scaled down from `Evelyn circle icon.png`. To change it, drop in a new
circle-cropped square image and re-run:

```bash
ffmpeg -y -i "assets/img/icon/your-circle.png" \
  -vf "scale=128:128:flags=lanczos" assets/img/icon/brand.png
```

Keep it a square PNG with the circle touching all four edges — the header
applies its own round mask and a thin ring, and they line up only if the
circle fills the square. It's desaturated by CSS to fit the monochrome palette
and turns full colour on hover; remove the `filter: grayscale(1)` line from
`.brand-mark` in `styles.css` if you'd rather it always be in colour.

`og-image.jpg` is the 1200×630 image shown when someone shares a link to the
site. That one *is* the photo — replace it if you'd rather it were something else.

### Videos

The three clips on `work.html` live in `assets/videos/`, each with a poster
image in `assets/img/posters/`. The grid shows only the poster (about 90 KB),
so the page loads fast; the video file is fetched when someone presses play.

Your untouched camera masters are in `assets/videos/originals/`. That folder is
in `.gitignore`, so it stays on your machine and never gets pushed — delete it
whenever you like.

**To add another video**, compress it first. Straight-from-camera exports are
far too heavy for the web:

```bash
# 1. the video: 1080x1920, 30fps, ~5 Mbps, starts playing immediately
ffmpeg -i "my-clip-original.mp4" \
  -vf "fps=30,scale=1080:1920:flags=lanczos" \
  -c:v libx264 -profile:v high -level 4.0 -crf 26 -preset slow \
  -maxrate 6M -bufsize 12M -pix_fmt yuv420p -g 60 \
  -c:a aac -b:a 128k -ac 2 -ar 44100 -movflags +faststart \
  assets/videos/my-clip.mp4

# 2. the poster frame, grabbed at 0.8 seconds
ffmpeg -ss 0.8 -i "my-clip-original.mp4" -frames:v 1 \
  -vf "scale=640:-2:flags=lanczos" -q:v 5 \
  assets/img/posters/my-clip.jpg
```

That keeps the sound, re-encoded to 128 kb/s AAC stereo, which every browser
plays. Only add `-an` if you deliberately want a silent clip &mdash; it strips
the audio track entirely. Then copy one block in `work.html`:

```html
<article class="video-card reveal"
         data-file="assets/videos/my-clip.mp4"
         data-poster="assets/img/posters/my-clip.jpg">
  <div class="video-thumb">
    <img src="assets/img/posters/my-clip.jpg" alt="Still from My Clip"
         width="640" height="1138" loading="lazy" decoding="async">
    <span class="play-badge" aria-hidden="true"></span>
  </div>
  <div class="video-meta">
    <h2>My Clip</h2>
    <span class="dur">0:12</span>
  </div>
  <p>Restaurant feature &middot; Reel</p>
</article>
```

Rules of thumb:

- **Keep each file under about 8 MB.** A 10&ndash;15 second vertical reel at
  30fps should land between 3 and 8 MB. If yours is 30 MB+, it came straight off
  a camera or phone and needs the command above.
- **30fps, not 60.** 1080&times;1920 at 60fps is twice the decoding work and is
  what makes playback stutter on laptops and mid-range phones.
- Avoid spaces in filenames.
- Widescreen clip? Add `data-orientation="landscape"` to the `<article>`.
- Hosting on YouTube or Vimeo instead? Replace `data-file` with
  `data-youtube="VIDEO_ID"` or `data-vimeo="123456789"` &mdash; both already work,
  and then file size stops being your problem at all.

> GitHub Pages allows 100 MB per file and 1 GB per repo, and it does serve
> videos in chunks (HTTP range requests) automatically &mdash; the browser only
> pulls the part it is playing. Chunking is not the bottleneck; bitrate is.

## Notes

- Dark and light themes: follows the visitor's system setting, and the ○/☾ button
  in the header overrides it. The choice is remembered per browser.
- Keyboard accessible throughout — skip link, focus rings, Escape closes the video.
- Animations switch off automatically for visitors who prefer reduced motion, and
  content still renders with JavaScript disabled.
