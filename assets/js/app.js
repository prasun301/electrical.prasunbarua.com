/* =========================================================
   SITE CONFIGURATION
   ========================================================= */
const SITE_CONFIG = {
    siteName: "Electrical Engineering by Prasun Barua",
    siteUrl: window.location.origin,
    articlesFile: "./articles.json", // Relative path to avoid root-domain 404 errors
    maxRelatedArticles: 4,
    maxLatestArticles: 4
};

/* =========================================================
   1. LATEST ARTICLES FETCHER
   ========================================================= */
async function initializeLatestArticles() {
    const container = document.getElementById("latest-articles");
    if (!container) return; // Exit if the container isn't present on this page

    try {
        const response = await fetch(SITE_CONFIG.articlesFile);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const articles = await response.json();

        // Filter for published articles and limit to the max configured
        const publishedArticles = articles
            .filter(article => article.status === "published")
            .slice(0, SITE_CONFIG.maxLatestArticles);

        if (publishedArticles.length === 0) {
            container.innerHTML = `<p style="color: var(--text-muted);">No published articles found.</p>`;
            return;
        }

        // Render articles into HTML
        container.innerHTML = publishedArticles.map(article => `
            <article class="article-item">
                <div class="article-content">
                    <h3>
                        <a href="${article.url}">${escapeHTML(article.title)}</a>
                    </h3>
                    <p class="article-excerpt">${escapeHTML(article.excerpt)}</p>
                    <div class="article-meta">
                        <span class="article-category">${escapeHTML(article.category)}</span>
                        <span>•</span>
                        <time datetime="${article.date}">${formatDate(article.date)}</time>
                        ${article.readTime ? `<span>•</span> <span>${escapeHTML(article.readTime)}</span>` : ''}
                    </div>
                </div>
                ${article.image ? `
                    <a href="${article.url}" class="article-thumb" aria-hidden="true" tabindex="-1">
                        <img src="${article.image}" alt="${escapeHTML(article.title)}" loading="lazy">
                    </a>
                ` : `
                    <div class="article-thumb" aria-hidden="true">
                        <span class="material-symbols-rounded">electric_bolt</span>
                    </div>
                `}
            </article>
        `).join("");

    } catch (error) {
        console.error("Error loading articles:", error);
        container.innerHTML = `
            <p style="color: var(--text-muted); font-size: 14px;">
                Unable to load latest articles at this time.
            </p>`;
    }
}

/* =========================================================
   2. UI & UTILITY FUNCTIONS
   ========================================================= */

// Escape HTML strings for security
function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Format dates (e.g. "2026-03-15" -> "Mar 15, 2026")
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function initializeMobileMenu() {
    // Handled in HTML inline script or extended here if needed
}

function initializeSidebar() {
    // Optional sidebar enhancements
}

function initializeSearch() {
    // Search form logic is handled inline or extended here
}

function initializeSocialSharing() {
    // Reserved for article page social share triggers
}

function initializeCopyLink() {
    // Copy link feature helper
}

function initializeNativeShare() {
    // Web Share API helper
}

function initializeReadingProgress() {
    // Progress bar for long articles
}

function initializeSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* =========================================================
   DOM READY (SAFE INITIALIZATION BLOCK)
   ========================================================= */
function initApp() {
    initializeMobileMenu();
    initializeSidebar();
    initializeSearch();
    initializeLatestArticles();
    initializeSocialSharing();
    initializeCopyLink();
    initializeNativeShare();
    initializeReadingProgress();
    initializeSmoothAnchors();
}

// Prevents DOMContentLoaded race conditions
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}
