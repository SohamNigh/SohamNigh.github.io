// ---------- scroll fade-in for commit blocks ----------
(function fadeInOnScroll() {
  const commits = document.querySelectorAll(".commit");
  if (!("IntersectionObserver" in window) || commits.length === 0) {
    commits.forEach((c) => c.classList.add("in-view"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  commits.forEach((c) => observer.observe(c));
})();

// ---------- live GitHub repos, with graceful fallback ----------
(function loadProjects() {
  const grid = document.getElementById("projects-grid");
  const GITHUB_USER = "SohamNigh";
  const EXCLUDE = new Set(["sohamnigh.github.io", "personal_website", GITHUB_USER.toLowerCase()]);

  function timeAgo(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
  }

  function renderRepos(repos) {
    grid.innerHTML = "";
    repos.forEach((repo) => {
      const card = document.createElement("div");
      card.className = "project-card";
      card.innerHTML = `
        <h3><a href="${repo.html_url}" target="_blank" rel="noopener">${repo.name}</a></h3>
        <p>${repo.description ? escapeHtml(repo.description) : "No description provided."}</p>
        <div class="project-meta">
          ${repo.language ? `<span>${escapeHtml(repo.language)}</span>` : ""}
          <span>★ ${repo.stargazers_count}</span>
          <span>updated ${timeAgo(repo.pushed_at)}</span>
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
      <p class="projects-status">
        Live repo data is unavailable right now (rate limit or offline).
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
