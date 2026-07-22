# soham.github.io

Personal site, built as a stylized `git log --stat` of my career — each job
and project rendered as a commit. Plain HTML/CSS/JS, no build step, deployed
via GitHub Actions to GitHub Pages.

Live at: https://sohamnigh.github.io

## Structure

- `index.html` — content
- `styles.css` — theme/layout
- `script.js` — commit fade-in on scroll + live GitHub repos fetch
- `assets/` — resume PDF
- `.github/workflows/deploy.yml` — Pages deploy on push to `main`
