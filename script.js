// ---------- theme toggle (light / dark) ----------
(function themeToggle() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  const label = btn.querySelector("[data-theme-label]");
  const LABELS = { light: "Light", dark: "Dark" };

  function apply(mode) {
    document.documentElement.setAttribute("data-theme", mode);
    localStorage.setItem("theme", mode);
    label.textContent = LABELS[mode];
    btn.setAttribute("aria-label", `Color theme: ${LABELS[mode]}. Click to switch.`);
  }

  let current = localStorage.getItem("theme");
  if (current !== "light" && current !== "dark") {
    current = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  label.textContent = LABELS[current];
  btn.setAttribute("aria-label", `Color theme: ${LABELS[current]}. Click to switch.`);

  btn.addEventListener("click", () => {
    current = current === "light" ? "dark" : "light";
    apply(current);
  });
})();

// ---------- scroll fade-in for entry blocks ----------
(function fadeInOnScroll() {
  const entries = document.querySelectorAll(".entry");
  if (!("IntersectionObserver" in window) || entries.length === 0) {
    entries.forEach((el) => el.classList.add("in-view"));
    return;
  }
  const observer = new IntersectionObserver(
    (records) => {
      records.forEach((record) => {
        if (record.isIntersecting) {
          record.target.classList.add("in-view");
          observer.unobserve(record.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  entries.forEach((el) => observer.observe(el));
})();

// ---------- live GitHub repos, with graceful fallback ----------
(function loadRepos() {
  const grid = document.getElementById("repositories-grid");
  const GITHUB_USER = "SohamNigh";
  const EXCLUDE = new Set(["sohamnigh.github.io", "personal_website", GITHUB_USER.toLowerCase()]);

  function lastUpdated(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
  }

  function renderRepos(repos) {
    grid.innerHTML = "";
    repos.forEach((repo) => {
      const card = document.createElement("div");
      card.className = "repo-card";
      card.innerHTML = `
        <h3><a href="${repo.html_url}" target="_blank" rel="noopener">${escapeHtml(repo.name)}</a></h3>
        <p>${repo.description ? escapeHtml(repo.description) : "No description provided."}</p>
        <div class="repo-meta">
          ${repo.language ? `<span>${escapeHtml(repo.language)}</span>` : ""}
          <span>${repo.stargazers_count} stars</span>
          <span>updated ${lastUpdated(repo.pushed_at)}</span>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderFallback() {
    grid.innerHTML = `
      <p class="repo-status">
        Live repository data is unavailable right now (rate limit or offline).
        Browse everything at <a href="https://github.com/${GITHUB_USER}" target="_blank" rel="noopener">github.com/${GITHUB_USER}</a>.
      </p>
    `;
  }

  fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=pushed&per_page=30`)
    .then((res) => {
      if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);
      return res.json();
    })
    .then((repos) => {
      const filtered = repos
        .filter((r) => !r.fork && !EXCLUDE.has(r.name.toLowerCase()))
        .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at))
        .slice(0, 6);

      if (filtered.length === 0) {
        renderFallback();
        return;
      }
      renderRepos(filtered);
    })
    .catch(renderFallback);
})();
