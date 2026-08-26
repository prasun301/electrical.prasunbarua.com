/* =========================================================
   ELECTRICAL ENGINEERING — MAIN APP
   electrical.prasunbarua.com

   Responsibilities:
   - Mobile navigation
   - Site search
   - Dynamic article loading
   - Homepage latest articles
   - Safe DOM rendering
   - Basic error handling

   Keep specialized scripts separate:
   - related-articles.js
   - ohms-law.js
   - Other article-specific JavaScript
   ========================================================= */

"use strict";

/* =========================================================
   CONFIGURATION
   ========================================================= */

const APP_CONFIG = {
    articlesUrl: "/articles.json",
    articlesPage: "/articles/",
    homepageArticleLimit: 6
};


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initMobileSidebar();
    initSiteSearch();
    initArticleLoader();
});


/* =========================================================
   MOBILE SIDEBAR
   ========================================================= */

function initMobileSidebar() {
    const menuButton = document.getElementById("menu-button");
    const sidebar = document.getElementById("category-sidebar");
    const overlay = document.querySelector(".sidebar-overlay");

    if (!menuButton || !sidebar) {
        return;
    }

    const openSidebar = () => {
        sidebar.classList.add("active");

        if (overlay) {
            overlay.classList.add("active");
        }

        document.body.style.overflow = "hidden";

        menuButton.setAttribute("aria-expanded", "true");
        menuButton.setAttribute(
            "aria-label",
            "Close article categories"
        );

        const icon = menuButton.querySelector(
            ".material-symbols-rounded"
        );

        if (icon) {
            icon.textContent = "close";
        }
    };

    const closeSidebar = () => {
        sidebar.classList.remove("active");

        if (overlay) {
            overlay.classList.remove("active");
        }

        document.body.style.overflow = "";

        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute(
            "aria-label",
            "Open article categories"
        );

        const icon = menuButton.querySelector(
            ".material-symbols-rounded"
        );

        if (icon) {
            icon.textContent = "menu";
        }
    };

    const toggleSidebar = () => {
        if (sidebar.classList.contains("active")) {
            closeSidebar();
        } else {
            openSidebar();
        }
    };

    menuButton.addEventListener("click", toggleSidebar);

    if (overlay) {
        overlay.addEventListener("click", closeSidebar);
    }

    sidebar.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeSidebar);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeSidebar();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) {
            closeSidebar();
        }
    });
}


/* =========================================================
   SITE SEARCH
   ========================================================= */

function initSiteSearch() {
    const searchForm =
        document.getElementById("site-search-form");

    const searchInput =
        document.getElementById("site-search");

    const searchMessage =
        document.getElementById("search-message");

    if (!searchForm || !searchInput) {
        return;
    }

    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const query = searchInput.value.trim();

        if (!query) {
            if (searchMessage) {
                searchMessage.textContent =
                    "Enter a topic to search.";
            }

            searchInput.focus();
            return;
        }

        const searchURL =
            `${APP_CONFIG.articlesPage}?q=${encodeURIComponent(query)}`;

        window.location.href = searchURL;
    });

    searchInput.addEventListener("input", () => {
        if (searchMessage) {
            searchMessage.textContent = "";
        }
    });
}


/* =========================================================
   ARTICLE LOADER
   ========================================================= */

function initArticleLoader() {
    const articleList =
        document.getElementById("latest-articles");

    if (!articleList) {
        return;
    }

    loadArticles(articleList);
}


/* =========================================================
   FETCH ARTICLES
   ========================================================= */

async function loadArticles(container) {
    setArticleLoadingState(container);

    try {
        const response = await fetch(APP_CONFIG.articlesUrl, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            cache: "no-cache"
        });

        if (!response.ok) {
            throw new Error(
                `Unable to load articles: HTTP ${response.status}`
            );
        }

        const data = await response.json();

        const articles = normalizeArticles(data);

        if (!articles.length) {
            throw new Error("No valid articles found.");
        }

        const latestArticles =
            articles
                .sort(sortArticlesByDate)
                .slice(0, APP_CONFIG.homepageArticleLimit);

        renderArticles(container, latestArticles);

    } catch (error) {
        console.error(
            "Electrical Engineering article loader:",
            error
        );

        renderArticleError(container);
    }
}


/* =========================================================
   NORMALIZE ARTICLES
   Supports common JSON property names.
   ========================================================= */

function normalizeArticles(data) {
    let source = data;

    if (!Array.isArray(source)) {
        if (Array.isArray(data.articles)) {
            source = data.articles;
        } else if (Array.isArray(data.items)) {
            source = data.items;
        } else {
            source = [];
        }
    }

    return source
        .map((article) => normalizeArticle(article))
        .filter(Boolean);
}


function normalizeArticle(article) {
    if (!article || typeof article !== "object") {
        return null;
    }

    const title = cleanText(
        article.title ||
        article.name
    );

    const url = cleanUrl(
        article.url ||
        article.link ||
        article.path
    );

    if (!title || !url) {
        return null;
    }

    return {
        title,
        url,

        excerpt: cleanText(
            article.excerpt ||
            article.description ||
            ""
        ),

        category: cleanText(
            article.category ||
            article.categoryName ||
            ""
        ),

        readTime: cleanText(
            article.readTime ||
            article.read_time ||
            ""
        ),

        icon: cleanIcon(
            article.icon ||
            "article"
        ),

        date: article.date ||
               article.published ||
               article.publishedAt ||
               ""
    };
}


/* =========================================================
   SORT ARTICLES
   Newest first.
   ========================================================= */

function sortArticlesByDate(a, b) {
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);

    return dateB - dateA;
}


function parseDate(value) {
    if (!value) {
        return 0;
    }

    const timestamp = Date.parse(value);

    return Number.isNaN(timestamp)
        ? 0
        : timestamp;
}


/* =========================================================
   RENDER ARTICLES
   ========================================================= */

function renderArticles(container, articles) {
    container.replaceChildren();

    const fragment = document.createDocumentFragment();

    articles.forEach((article) => {
        fragment.appendChild(
            createArticleElement(article)
        );
    });

    container.appendChild(fragment);
}


/* =========================================================
   CREATE ARTICLE ELEMENT
   Uses DOM APIs instead of innerHTML.
   ========================================================= */

function createArticleElement(article) {
    const item = document.createElement("article");

    item.className = "article-item";

    /* ---------------------------------------------
       ARTICLE CONTENT
       --------------------------------------------- */

    const content = document.createElement("div");

    const heading = document.createElement("h3");

    const articleLink = document.createElement("a");

    articleLink.href = article.url;
    articleLink.textContent = article.title;

    heading.appendChild(articleLink);

    content.appendChild(heading);


    /* ---------------------------------------------
       EXCERPT
       --------------------------------------------- */

    if (article.excerpt) {
        const excerpt = document.createElement("p");

        excerpt.className = "article-excerpt";
        excerpt.textContent = article.excerpt;

        content.appendChild(excerpt);
    }


    /* ---------------------------------------------
       META
       --------------------------------------------- */

    if (article.category || article.readTime) {
        const meta = document.createElement("div");

        meta.className = "article-meta";

        if (article.category) {
            const category =
                document.createElement("span");

            category.className = "article-category";
            category.textContent = article.category;

            meta.appendChild(category);
        }

        if (
            article.category &&
            article.readTime
        ) {
            const separator =
                document.createElement("span");

            separator.textContent = "·";

            meta.appendChild(separator);
        }

        if (article.readTime) {
            const readTime =
                document.createElement("span");

            readTime.textContent = article.readTime;

            meta.appendChild(readTime);
        }

        content.appendChild(meta);
    }


    /* ---------------------------------------------
       THUMBNAIL
       --------------------------------------------- */

    const thumb = document.createElement("a");

    thumb.className = "article-thumb";
    thumb.href = article.url;
    thumb.setAttribute(
        "aria-label",
        `Read ${article.title}`
    );

    const icon = document.createElement("span");

    icon.className = "material-symbols-rounded";
    icon.textContent = article.icon;

    thumb.appendChild(icon);


    /* ---------------------------------------------
       FINAL ARTICLE
       --------------------------------------------- */

    item.appendChild(content);
    item.appendChild(thumb);

    return item;
}


/* =========================================================
   LOADING STATE
   ========================================================= */

function setArticleLoadingState(container) {
    container.replaceChildren();

    const message = document.createElement("p");

    message.className = "article-loading";
    message.textContent = "Loading latest articles…";

    container.appendChild(message);
}


/* =========================================================
   ERROR STATE
   ========================================================= */

function renderArticleError(container) {
    container.replaceChildren();

    const message = document.createElement("p");

    message.className = "article-loading";

    message.textContent =
        "Articles are temporarily unavailable. Please try again later.";

    container.appendChild(message);
}


/* =========================================================
   TEXT SANITIZATION
   ========================================================= */

function cleanText(value) {
    if (
        typeof value !== "string" &&
        typeof value !== "number"
    ) {
        return "";
    }

    return String(value).trim();
}


/* =========================================================
   URL VALIDATION
   Only allow local article URLs.
   ========================================================= */

function cleanUrl(value) {
    const url = cleanText(value);

    if (!url) {
        return "";
    }

    /*
     * Allow:
     * /articles/...
     * https://electrical.prasunbarua.com/...
     */

    if (url.startsWith("/")) {
        return url;
    }

    try {
        const parsed = new URL(
            url,
            window.location.origin
        );

        if (
            parsed.origin === window.location.origin
        ) {
            return parsed.pathname +
                parsed.search +
                parsed.hash;
        }

        return "";
    } catch {
        return "";
    }
}


/* =========================================================
   ICON VALIDATION
   ========================================================= */

function cleanIcon(value) {
    const icon = cleanText(value);

    /*
     * Material Symbols names contain letters,
     * numbers and underscores.
     */

    if (
        /^[a-zA-Z0-9_]+$/.test(icon)
    ) {
        return icon;
    }

    return "article";
}
