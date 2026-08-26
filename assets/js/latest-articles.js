/* =========================================================
   ELECTRICAL ENGINEERING
   LATEST ARTICLES
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", initLatestArticles);

/* =========================================================
   CONFIGURATION
========================================================== */

const LATEST_ARTICLES_CONFIG = {
    // Uses relative path to prevent 404 errors on subpath deployments
    dataURL: "./articles.json",
    containerID: "latest-articles",
    statusID: "latest-articles-status",
    maxArticles: 6
};

/* =========================================================
   INITIALIZE
========================================================== */

async function initLatestArticles() {
    const container = document.getElementById(LATEST_ARTICLES_CONFIG.containerID);

    if (!container) {
        console.warn(`Container #${LATEST_ARTICLES_CONFIG.containerID} not found.`);
        return;
    }

    try {
        setStatus("Loading latest articles...");

        const response = await fetch(LATEST_ARTICLES_CONFIG.dataURL, {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to fetch ${LATEST_ARTICLES_CONFIG.dataURL}`);
        }

        const data = await response.json();

        const articles = Array.isArray(data)
            ? data
            : Array.isArray(data.articles)
                ? data.articles
                : [];

        if (!articles.length) {
            throw new Error("No articles array found in articles.json.");
        }

        const publishedArticles = getPublishedArticles(articles);

        // Sort newest first
        publishedArticles.sort(function (a, b) {
            return getDateValue(b) - getDateValue(a);
        });

        const latestArticles = publishedArticles.slice(
            0,
            LATEST_ARTICLES_CONFIG.maxArticles
        );

        renderLatestArticles(container, latestArticles);
        setStatus("");

        console.info("Latest articles loaded successfully:", latestArticles);

    } catch (error) {
        console.error("Latest articles could not be loaded:", error);
        container.innerHTML = "";
        setStatus("Latest articles are temporarily unavailable.");
    }
}

/* =========================================================
   FILTER PUBLISHED ARTICLES
========================================================== */

function getPublishedArticles(articles) {
    // Set timestamp to the end of today to prevent local timezone dropping
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    return articles.filter(function (article) {
        if (!article || typeof article !== "object") return false;

        // Status check
        if (String(article.status || "").toLowerCase() !== "published") {
            return false;
        }

        // URL check
        if (!String(article.url || "").trim()) {
            return false;
        }

        // Date check
        const date = parseArticleDate(article.datePublished);
        if (!date) return false;

        // Prevent future scheduled articles while keeping today's posts visible
        if (date > now) return false;

        return true;
    });
}

/* =========================================================
   DATE PARSER (LOCAL TIME SAFE)
========================================================== */

function parseArticleDate(value) {
    if (!value) return null;

    // Splits YYYY-MM-DD into local components to prevent UTC date shifting
    const parts = String(value).trim().split("-");
    const date = parts.length === 3
        ? new Date(parts[0], parts[1] - 1, parts[2])
        : new Date(value);

    if (Number.isNaN(date.getTime())) return null;

    return date;
}

/* =========================================================
   DATE VALUE
========================================================== */

function getDateValue(article) {
    const date = parseArticleDate(
        article.datePublished || article.dateModified
    );

    return date ? date.getTime() : 0;
}

/* =========================================================
   RENDER
========================================================== */

function renderLatestArticles(container, articles) {
    container.innerHTML = "";

    if (!articles.length) {
        container.innerHTML = `
            <div class="latest-empty">
                <h3>No published articles yet</h3>
                <p>New electrical engineering articles will appear here.</p>
            </div>
        `;
        return;
    }

    articles.forEach(function (article) {
        const card = createArticleCard(article);
        if (card) {
            container.appendChild(card);
        }
    });
}

/* =========================================================
   CREATE ARTICLE CARD
========================================================== */

function createArticleCard(article) {
    const url = String(article.url || "").trim();
    if (!url) return null;

    const card = document.createElement("a");
    card.className = "latest-article-card";
    card.href = url;
    card.setAttribute(
        "aria-label",
        "Read " + (article.title || "Electrical engineering article")
    );

    // Image section
    if (article.image && String(article.image).trim()) {
        const imageWrapper = document.createElement("div");
        imageWrapper.className = "latest-article-image";

        const image = document.createElement("img");
        image.src = article.image;
        image.alt = article.title || "Electrical engineering article";
        image.loading = "lazy";
        image.decoding = "async";

        imageWrapper.appendChild(image);
        card.appendChild(imageWrapper);
    }

    // Content section
    const content = document.createElement("div");
    content.className = "latest-article-content";

    const category = document.createElement("div");
    category.className = "latest-article-category";
    category.textContent =
        article.categoryName || article.category || "Electrical Engineering";

    const title = document.createElement("h3");
    title.textContent = article.title || "Electrical Engineering Article";

    const description = document.createElement("p");
    description.className = "latest-article-description";
    description.textContent = article.excerpt || article.description || "";

    const meta = document.createElement("div");
    meta.className = "latest-article-meta";

    const date = parseArticleDate(article.datePublished);
    if (date) {
        const dateSpan = document.createElement("span");
        dateSpan.textContent = formatDate(date);
        meta.appendChild(dateSpan);
    }

    if (article.readingTime) {
        const separator = document.createElement("span");
        separator.textContent = "•";
        separator.setAttribute("aria-hidden", "true");
        meta.appendChild(separator);

        const readingTime = document.createElement("span");
        readingTime.textContent = article.readingTime;
        meta.appendChild(readingTime);
    }

    content.appendChild(category);
    content.appendChild(title);

    if (description.textContent) {
        content.appendChild(description);
    }

    if (meta.children.length) {
        content.appendChild(meta);
    }

    card.appendChild(content);
    return card;
}

/* =========================================================
   FORMAT DATE & STATUS HELPERS
========================================================== */

function formatDate(date) {
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function setStatus(message) {
    const status = document.getElementById(LATEST_ARTICLES_CONFIG.statusID);
    if (!status) return;
    status.textContent = message;
}
