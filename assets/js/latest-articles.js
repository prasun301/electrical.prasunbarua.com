/* =========================================================
   ELECTRICAL ENGINEERING - LATEST ARTICLES
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", initLatestArticles);

const LATEST_ARTICLES_CONFIG = {
    dataURL: "./articles.json",
    containerID: "latest-articles",
    statusID: "latest-articles-status",
    maxArticles: 6
};

async function initLatestArticles() {
    const container = document.getElementById(LATEST_ARTICLES_CONFIG.containerID);
    if (!container) return;

    try {
        setStatus("Loading latest articles...");

        const response = await fetch(LATEST_ARTICLES_CONFIG.dataURL, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const articles = Array.isArray(data) ? data : (data.articles || []);

        const publishedArticles = getPublishedArticles(articles);
        publishedArticles.sort((a, b) => getDateValue(b) - getDateValue(a));

        const latestArticles = publishedArticles.slice(0, LATEST_ARTICLES_CONFIG.maxArticles);
        renderLatestArticles(container, latestArticles);
        setStatus("");
    } catch (error) {
        console.error("Failed to load articles:", error);
        container.innerHTML = '<p class="article-error">Unable to load latest articles.</p>';
        setStatus("Latest articles are temporarily unavailable.");
    }
}

function getPublishedArticles(articles) {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    return articles.filter(article => {
        if (!article || typeof article !== "object") return false;
        if (String(article.status || "").toLowerCase() !== "published") return false;
        if (!String(article.url || "").trim()) return false;

        const date = parseArticleDate(article.datePublished);
        return date && date <= now;
    });
}

function parseArticleDate(value) {
    if (!value) return null;
    const parts = String(value).trim().split("-");
    const date = parts.length === 3 
        ? new Date(parts[0], parts[1] - 1, parts[2]) 
        : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function getDateValue(article) {
    const date = parseArticleDate(article.datePublished || article.dateModified);
    return date ? date.getTime() : 0;
}

function renderLatestArticles(container, articles) {
    container.innerHTML = "";
    if (!articles.length) {
        container.innerHTML = '<p class="article-empty">No published articles yet.</p>';
        return;
    }

    const fragment = document.createDocumentFragment();
    articles.forEach(article => {
        const item = createArticleItem(article);
        if (item) fragment.appendChild(item);
    });
    container.appendChild(fragment);
}

function createArticleItem(article) {
    const url = String(article.url || "").trim();
    if (!url) return null;

    const item = document.createElement("article");
    item.className = "article-item";

    const contentDiv = document.createElement("div");

    const titleHeader = document.createElement("h3");
    const titleLink = document.createElement("a");
    titleLink.href = url;
    titleLink.textContent = article.title || "Electrical Engineering Article";
    titleHeader.appendChild(titleLink);
    contentDiv.appendChild(titleHeader);

    const excerpt = article.excerpt || article.description || "";
    if (excerpt) {
        const excerptP = document.createElement("p");
        excerptP.className = "article-excerpt";
        excerptP.textContent = excerpt;
        contentDiv.appendChild(excerptP);
    }

    const metaDiv = document.createElement("div");
    metaDiv.className = "article-meta";

    const categorySpan = document.createElement("span");
    categorySpan.className = "article-category";
    categorySpan.textContent = article.categoryName || article.category || "Electrical Engineering";
    metaDiv.appendChild(categorySpan);

    const date = parseArticleDate(article.datePublished);
    if (date) {
        const dotSpan = document.createElement("span");
        dotSpan.textContent = " • ";
        metaDiv.appendChild(dotSpan);

        const timeElem = document.createElement("time");
        timeElem.setAttribute("datetime", article.datePublished);
        timeElem.textContent = date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
        metaDiv.appendChild(timeElem);
    }

    contentDiv.appendChild(metaDiv);
    item.appendChild(contentDiv);

    if (article.image && String(article.image).trim()) {
        const thumbLink = document.createElement("a");
        thumbLink.href = url;
        thumbLink.className = "article-thumb-link";

        const thumbDiv = document.createElement("div");
        thumbDiv.className = "article-thumb";

        const img = document.createElement("img");
        img.src = article.image;
        img.alt = article.title || "Article thumbnail";
        img.loading = "lazy";

        thumbDiv.appendChild(img);
        thumbLink.appendChild(thumbDiv);
        item.appendChild(thumbLink);
    }

    return item;
}

function setStatus(message) {
    const status = document.getElementById(LATEST_ARTICLES_CONFIG.statusID);
    if (status) status.textContent = message;
}
