"use strict";

document.addEventListener("DOMContentLoaded", function () {

    loadLatestArticles();
    initializeSearch();
    initializeMobileSidebar();

});


/* =========================================================
   CONFIG
========================================================= */

const ARTICLES_URL = "/articles.json";
const LATEST_CONTAINER = "latest-articles";
const MAX_LATEST_ARTICLES = 6;


/* =========================================================
   LOAD LATEST ARTICLES
========================================================= */

async function loadLatestArticles() {
    const container = document.getElementById(LATEST_CONTAINER);

    if (!container) {
        console.warn("Latest articles container not found.");
        return;
    }

    container.innerHTML = '<p class="article-empty">Loading articles...</p>';

    try {
        const response = await fetch(ARTICLES_URL, {
            method: "GET",
            cache: "no-store",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        const data = await response.json();

        // Support root array, data.articles, or data.posts
        const articles = Array.isArray(data)
            ? data
            : Array.isArray(data.articles)
                ? data.articles
                : Array.isArray(data.posts)
                    ? data.posts
                    : [];

        if (!articles.length) {
            throw new Error("No valid articles array found in JSON.");
        }

        const now = new Date();

        const publishedArticles = articles
            .filter(function (article) {
                if (!article || typeof article !== "object") return false;

                // 1. Optional status check (only filter out if explicitly set to draft/hidden)
                if (article.status) {
                    const status = String(article.status).toLowerCase();
                    if (status !== "published" && status !== "active") return false;
                }

                // 2. Fallback resolution for date property
                const rawDate = article.datePublished || article.date || article.pubDate || article.created_at;
                if (!rawDate) return false;

                const date = new Date(rawDate);
                if (Number.isNaN(date.getTime())) return false;

                // 3. Allow dates up to 1 day in future to prevent timezone offset filtering
                const futureThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                if (date > futureThreshold) return false;

                // 4. Fallback resolution for URL/link property
                const articleUrl = article.url || article.link || article.path || article.permalink;
                if (!articleUrl) return false;

                // Normalize resolved properties back onto the object for rendering
                article.url = articleUrl;
                article.datePublished = rawDate;

                return true;
            })
            .sort(function (a, b) {
                return new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime();
            });

        const latestArticles = publishedArticles.slice(0, MAX_LATEST_ARTICLES);

        renderLatestArticles(container, latestArticles);

    } catch (error) {
        console.error("Latest articles error:", error);

        container.innerHTML = "";
        const errorMessage = document.createElement("p");
        errorMessage.className = "article-error";
        errorMessage.textContent = "Unable to load latest articles.";
        container.appendChild(errorMessage);
    }
}
/* =========================================================
   RENDER
========================================================= */

function renderLatestArticles(
    container,
    articles
) {

    container.innerHTML = "";


    if (!articles.length) {

        const message =
            document.createElement("p");

        message.className =
            "article-empty";

        message.textContent =
            "No published articles available.";


        container.appendChild(
            message
        );

        return;
    }


    articles.forEach(function (article) {

        const item =
            document.createElement("article");

        item.className =
            "article-item";


        /* TEXT */

        const content =
            document.createElement("div");


        const title =
            document.createElement("h3");


        const titleLink =
            document.createElement("a");


        titleLink.href =
            article.url;

        titleLink.textContent =
            article.title ||
            "Electrical Engineering Article";


        title.appendChild(
            titleLink
        );


        const excerpt =
            document.createElement("p");

        excerpt.className =
            "article-excerpt";

        excerpt.textContent =
            article.excerpt ||
            article.description ||
            "";


        const meta =
            document.createElement("div");

        meta.className =
            "article-meta";


        const category =
            document.createElement("span");

        category.className =
            "article-category";

        category.textContent =
            article.categoryName ||
            article.category ||
            "Electrical Engineering";


        const separator =
            document.createElement("span");

        separator.textContent =
            "·";


        meta.appendChild(
            category
        );


        if (article.readingTime) {

            meta.appendChild(
                separator
            );


            const reading =
                document.createElement("span");

            reading.textContent =
                article.readingTime;

            meta.appendChild(
                reading
            );

        }


        if (article.datePublished) {

            const dateSeparator =
                document.createElement("span");

            dateSeparator.textContent =
                "·";

            meta.appendChild(
                dateSeparator
            );


            const date =
                document.createElement("time");

            date.dateTime =
                article.datePublished;

            date.textContent =
                formatDate(
                    article.datePublished
                );

            meta.appendChild(
                date
            );

        }


        content.appendChild(
            title
        );


        if (excerpt.textContent) {

            content.appendChild(
                excerpt
            );

        }


        content.appendChild(
            meta
        );


        /* THUMBNAIL */

        const imageLink =
            document.createElement("a");

        imageLink.className =
            "article-thumb-link";

        imageLink.href =
            article.url;


        const thumbnail =
            document.createElement("div");

        thumbnail.className =
            "article-thumb";


        if (article.image) {

            const image =
                document.createElement("img");

            image.src =
                article.image;

            image.alt =
                article.title ||
                "";

            image.loading =
                "lazy";

            image.decoding =
                "async";


            image.addEventListener(
                "error",
                function () {

                    thumbnail.innerHTML = "";

                    addFallbackIcon(
                        thumbnail,
                        article.icon
                    );

                }
            );


            thumbnail.appendChild(
                image
            );

        } else {

            addFallbackIcon(
                thumbnail,
                article.icon
            );

        }


        imageLink.appendChild(
            thumbnail
        );


        item.appendChild(
            content
        );


        item.appendChild(
            imageLink
        );


        container.appendChild(
            item
        );

    });

}


/* =========================================================
   FALLBACK ICON
========================================================= */

function addFallbackIcon(
    container,
    iconName
) {

    const icon =
        document.createElement(
            "span"
        );


    icon.className =
        "material-symbols-rounded";


    icon.setAttribute(
        "aria-hidden",
        "true"
    );


    icon.textContent =
        iconName ||
        "article";


    container.appendChild(
        icon
    );

}


/* =========================================================
   DATE
========================================================= */

function formatDate(
    value
) {

    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }


    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}


/* =========================================================
   SEARCH
========================================================= */

function initializeSearch() {

    const form =
        document.getElementById(
            "site-search-form"
        );

    const input =
        document.getElementById(
            "site-search"
        );


    if (
        !form ||
        !input
    ) {
        return;
    }


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const query =
                input.value.trim();


            if (!query) {
                return;
            }


            window.location.href =
                "/articles/?q=" +
                encodeURIComponent(query);

        }
    );

}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function initializeMobileSidebar() {

    const button =
        document.getElementById(
            "menu-button"
        );

    const sidebar =
        document.getElementById(
            "category-sidebar"
        );

    const overlay =
        document.querySelector(
            ".sidebar-overlay"
        );


    if (
        !button ||
        !sidebar ||
        !overlay
    ) {
        return;
    }


    function openSidebar() {

        sidebar.classList.add(
            "active"
        );

        overlay.classList.add(
            "active"
        );

        document.body.classList.add(
            "sidebar-open"
        );

        button.setAttribute(
            "aria-expanded",
            "true"
        );

    }


    function closeSidebar() {

        sidebar.classList.remove(
            "active"
        );

        overlay.classList.remove(
            "active"
        );

        document.body.classList.remove(
            "sidebar-open"
        );

        button.setAttribute(
            "aria-expanded",
            "false"
        );

    }


    button.addEventListener(
        "click",
        function () {

            if (
                sidebar.classList.contains(
                    "active"
                )
            ) {

                closeSidebar();

            } else {

                openSidebar();

            }

        }
    );


    overlay.addEventListener(
        "click",
        closeSidebar
    );


    sidebar
        .querySelectorAll("a")
        .forEach(function (link) {

            link.addEventListener(
                "click",
                closeSidebar
            );

        });


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {
                closeSidebar();
            }

        }
    );

}
