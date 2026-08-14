# Aaron Nobbe — Portfolio Website

A static, responsive portfolio built for GitHub Pages. No Node, React, build system, or backend is required.

## What's included

- Modern dark engineering-focused visual design
- Full-width sticky navigation
- Hero section with degree, professional positioning, GitHub + LinkedIn
- Featured Wind Tunnel LabVIEW project with the supplied interface and backend images
- Playable Hero Run browser demo adapted from the supplied embedded C++ game
- Explicit WebAssembly conversion note
- Tennis leadership section with photo placeholders
- Travel log rendered automatically from `script.js`
- Additional projects: Infrared Morse-Code Communicator + Website Summarizer
- Resume link placeholder
- Responsive mobile navigation
- GitHub Pages compatible

## 1. Your portrait

Already wired in — `index.html` points at `assets/profile.jpg`. To swap in
a different photo later, just overwrite that file (keep the same
filename) or update the `src` on the `<img>` inside `.hero-photo-card`.

## 2. Add your resume

Put your PDF here:

`assets/Aaron_Nobbe_Resume.pdf`

The Resume buttons already point to that filename.

## 3. Tennis photos

Already wired in — `tennis-1.jpg` through `tennis-4.jpg` in
`assets/gallery/` are displayed as real photo tiles in the Tennis
section. To swap a photo, overwrite the file (same name/number) or edit
the `src` on the matching `<img>` in `index.html`.

To add a 5th tennis photo: add the file to `assets/gallery/`, then add
another `<div class="photo-tile"><img src="..." alt="..."></div>` inside
`.tennis-grid` in `index.html`.

## 4. Travel photos

Already wired in — `travel-1.jpg` through `travel-7.jpg` are in
`assets/gallery/` and rendered by the `travelEntries` array at the top of
`script.js`. Cards fill the grid left-to-right, then wrap to the next row
(3 columns), in array order — so the array is currently ordered
`travel-7` (first / most recent) down to `travel-1` (last).

To add a new trip: drop the photo in `assets/gallery/`, then add a new
entry to the **top** of the `travelEntries` array in `script.js`:

```js
{
  year: "2027",
  location: "Rome, Italy",
  caption: "A short memory from the trip.",
  image: "assets/gallery/travel-8.jpg"
}
```

Update the `location` and `caption` fields for all entries — they're
currently placeholder text ("Add a destination").

## 5. Add movies / videos

Yes — you can add your own videos.

For a local MP4, place it in `assets/gallery/` and use:

```html
<video controls preload="metadata">
  <source src="assets/gallery/my-video.mp4" type="video/mp4">
</video>
```

For a YouTube video, you can also embed it with an `<iframe>`.

For a professional portfolio, short 10–30 second clips of the wind tunnel, tennis, or project hardware can work extremely well.

## 5b. Adding more projects later

The Projects section has two tiers, and both are set up to be copy-paste
extendable — look for the HTML comments in `index.html` right above
each one:

- **Full case study** (like Wind Tunnel / Hero Run): copy an existing
  `<article class="project-card">...</article>` block, replace the
  copy and images, and paste it after the existing ones.
- **Smaller project** (like the two currently listed under "Additional
  work"): copy a `<div class="mini-project">...</div>` block inside
  `.other-projects`, bump the number, and fill in the title/description/tags.

Both slot into the existing grid/layout automatically — no CSS changes
needed for a standard addition.

## 6. Optional: add your project repositories

When you have public repositories for the projects, add GitHub buttons to the relevant project cards.

## 7. Preview it on your computer

The site is intentionally simple. You can double-click `index.html` to inspect it.

For a more reliable local preview, if Python is installed:

```bash
cd aaron-nobbe-portfolio
python -m http.server 8000
```

Then visit:

`http://localhost:8000`

## 8. Publish to GitHub Pages

Your GitHub username is `aaronnobbe`.

### Easiest method: a user site

Create a new public GitHub repository named exactly:

`aaronnobbe.github.io`

Upload the contents of this folder so that `index.html` is in the repository root.

Do NOT upload the outer `aaron-nobbe-portfolio` folder itself as the only thing in the repository. The repository root should look like:

```text
index.html
styles.css
script.js
README.md
.nojekyll
assets/
```

Then:

1. Open the repository on GitHub.
2. Click **Settings**.
3. Click **Pages** under the Code and automation section.
4. Under the GitHub Pages publishing settings, select the branch containing your site (normally `main`) and the root (`/`) folder.
5. Save.
6. Wait for GitHub Pages to publish.
7. Your site should appear at:

`https://aaronnobbe.github.io`

GitHub's current Pages quickstart documents the `username.github.io` user-site approach.

## 9. If you use Git from your computer

From inside this folder:

```bash
git init
git add .
git commit -m "Create portfolio website"
git branch -M main
git remote add origin https://github.com/aaronnobbe/aaronnobbe.github.io.git
git push -u origin main
```

If Git says the remote already exists, do not run `git remote add` again.

## 10. Important before publishing

Because GitHub Pages is public, do not put passwords, API keys, private project files, or other secrets in this repository.

Your Website Summarizer project should NOT expose an OpenAI API key in browser JavaScript. If you later want that project to be live on the site, it should use a backend/serverless function rather than putting the API key in the public repository.

## Design notes

The site uses a dark navy technical palette with cyan/blue accents, glass-like panels, subtle grid texture, large typography, and restrained motion. The goal is to make the engineering work feel like the primary product while allowing tennis and travel to show personality.

The Hero Run browser demo is a JavaScript/canvas adaptation. The original embedded C++ code remains the source project. The site intentionally labels the WebAssembly conversion as an ongoing direction rather than claiming that the supplied C++ is already compiled to WASM.
