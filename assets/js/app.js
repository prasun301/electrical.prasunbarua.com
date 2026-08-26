/* =========================================================
   ELECTRICAL ENGINEERING
   MAIN SITE APPLICATION
   ---------------------------------------------------------
   Homepage:
   - Loads /articles.json
   - Displays latest published articles
   - Excludes future articles
   - Sorts newest first
   - Supports search
   - Supports mobile sidebar
   ========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
========================================================== */

const SITE_CONFIG = {

    articlesURL: "/articles.json",

    latestContainerID: "latest-articles",

    searchFormID: "site-search-form",

    searchInputID: "site-search",

    searchMessageID: "search-message",

    sidebarID: "category-sidebar",

    menuButtonID: "menu-button",

    overlaySelector: ".sidebar-overlay"

};


/* =========================================================
   INITIALIZE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeLatestArticles();

        initializeSearch();

        initializeMobileSidebar();

    }
);


/* =========================================================
   LOAD LATEST ARTICLES
========================================================== */

async function initializeLatestArticles() {

    const container =
        document.getElementById(
            SITE_CONFIG.latestContainerID
        );


    /*
     * This script may also be loaded on other pages.
     * If the homepage container does not exist,
     * simply stop.
     */

    if (!container) {

        return;

    }


    try {

        /*
         * Show loading state.
         */

        container.innerHTML = `
            <p class="article-empty">
                Loading articles...
            </p>
        `;


        /*
         * Fetch articles.json.
         */

        const response =
            await fetch(
                SITE_CONFIG.articlesURL,
                {
                    cache: "no-cache"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load articles.json. HTTP status: " +
                response.status
            );

        }


        /*
         * Convert response to JSON.
         */

        const data =
            await response.json();


        /*
         * IMPORTANT:
         *
         * Your articles.json is an object:
         *
         * {
         *     site: {},
         *     categories: [],
         *     articles: []
         * }
         *
         * Therefore we must use data.articles.
         */

        const articles =
            Array.isArray(data)
                ? data
                : Array.isArray(data.articles)
                    ? data.articles
                    : [];


        if (!articles.length) {

            throw new Error(
                "No articles were found in articles.json."
            );

        }


        /*
         * Get only published articles
         * whose publication date is not in
         * the future.
         */

        const now =
            new Date();


        const publishedArticles =
            articles
                .filter(
                    function (article) {

                        if (!article) {
                            return false;
                        }


                        /*
                         * Must have status = published.
                         */

                        if (
                            String(
                                article.status || ""
                            ).toLowerCase() !==
                            "published"
                        ) {

                            return false;

                        }


                        /*
                         * Must have a valid publication date.
                         */

                        if (!article.datePublished) {

                            return false;

                        }


                        const publishedDate =
                            parseArticleDate(
                                article.datePublished
                            );


                        if (!publishedDate) {

                            return false;

                        }


                        /*
                         * Don't display future articles.
                         */

                        if (
                            publishedDate >
                            now
                        ) {

                            return false;

                        }


                        /*
                         * Must have a URL.
                         */

                        if (
                            !article.url &&
                            !article.path
                        ) {

                            return false;

                        }


                        return true;

                    }
                );


        /*
         * Sort newest first.
         */

        publishedArticles.sort(
            function (articleA, articleB) {

                return (
                    getArticleTimestamp(
                        articleB
                    ) -
                    getArticleTimestamp(
                        articleA
                    )
                );

            }
        );


        /*
         * Display the latest articles.
         *
         * Change this number if you want
         * more or fewer homepage articles.
         */

        const latestArticles =
            publishedArticles.slice(
                0,
                6
            );


        /*
         * Render them.
         */

        renderLatestArticles(
            container,
            latestArticles
        );


    } catch (error) {

        console.error(
            "Latest articles failed to load:",
            error
        );


        /*
         * Display a useful error rather than
         * leaving "Loading articles..." forever.
         */

        container.innerHTML = `
            <p class="article-error">
                Unable to load the latest articles right now.
            </p>
        `;

    }

}


/* =========================================================
   PARSE ARTICLE DATE
========================================================== */

function parseArticleDate(
    value
) {

    if (!value) {

        return null;

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

}


/* =========================================================
   GET ARTICLE TIMESTAMP
========================================================== */

function getArticleTimestamp(
    article
) {

    const date =
        parseArticleDate(
            article.datePublished ||
            article.dateModified
        );


    return date
        ? date.getTime()
        : 0;

}


/* =========================================================
   RENDER LATEST ARTICLES
========================================================== */

function renderLatestArticles(
    container,
    articles
) {

    /*
     * Clear loading message.
     */

    container.innerHTML = "";


    /*
     * No articles available.
     */

    if (
        !articles ||
        !articles.length
    ) {

        const empty =
            document.createElement("p");


        empty.className =
            "article-empty";


        empty.textContent =
            "No published articles are available yet.";


        container.appendChild(
            empty
        );


        return;

    }


    /*
     * Create each article.
     */

    articles.forEach(
        function (article) {

            const item =
                createArticleItem(
                    article
                );


            if (item) {

                container.appendChild(
                    item
                );

            }

        }
    );

}


/* =========================================================
   CREATE ARTICLE ITEM
========================================================== */

function createArticleItem(
    article
) {

    const articleURL =
        normalizeURL(
            article.url ||
            article.path ||
            ""
        );


    if (
        !articleURL ||
        articleURL === "/"
    ) {

        return null;

    }


    /*
     * Main article wrapper.
     */

    const item =
        document.createElement("article");


    item.className =
        "article-item";


    /*
     * Text column.
     */

    const text =
        document.createElement("div");


    /*
     * Title.
     */

    const title =
        document.createElement("h3");


    const titleLink =
        document.createElement("a");


    titleLink.href =
        articleURL;


    titleLink.textContent =
        article.title ||
        "Electrical Engineering Article";


    title.appendChild(
        titleLink
    );


    /*
     * Excerpt.
     */

    const excerpt =
        document.createElement("p");


    excerpt.className =
        "article-excerpt";


    excerpt.textContent =
        article.excerpt ||
        article.description ||
        "";


    /*
     * Metadata.
     */

    const meta =
        document.createElement("div");


    meta.className =
        "article-meta";


    /*
     * Category.
     */

    const category =
        document.createElement("span");


    category.className =
        "article-category";


    category.textContent =
        article.categoryName ||
        article.category ||
        "Electrical Engineering";


    meta.appendChild(
        category
    );


    /*
     * Separator.
     */

    const separator =
        document.createElement("span");


    separator.textContent =
        "•";


    separator.setAttribute(
        "aria-hidden",
        "true"
    );


    meta.appendChild(
        separator
    );


    /*
     * Date.
     */

    const date =
        parseArticleDate(
            article.datePublished
        );


    const dateElement =
        document.createElement("time");


    if (date) {

        dateElement.dateTime =
            article.datePublished;

        dateElement.textContent =
            formatArticleDate(
                date
            );

    } else {

        dateElement.textContent =
            "Published";

    }


    meta.appendChild(
        dateElement
    );


    /*
     * Separator before reading time.
     */

    if (article.readingTime) {

        const separator2 =
            document.createElement("span");


        separator2.textContent =
            "•";


        separator2.setAttribute(
            "aria-hidden",
            "true"
        );


        meta.appendChild(
            separator2
        );


        const readingTime =
            document.createElement("span");


        readingTime.textContent =
            article.readingTime;


        meta.appendChild(
            readingTime
        );

    }


    /*
     * Assemble text area.
     */

    text.appendChild(
        title
    );


    if (
        excerpt.textContent.trim()
    ) {

        text.appendChild(
            excerpt
        );

    }


    text.appendChild(
        meta
    );


    /*
     * Thumbnail.
     */

    const thumbnailLink =
        document.createElement("a");


    thumbnailLink.className =
        "article-thumb-link";


    thumbnailLink.href =
        articleURL;


    thumbnailLink.setAttribute(
        "aria-label",
        "Read " +
        (
            article.title ||
            "article"
        )
    );


    const thumbnail =
        document.createElement("div");


    thumbnail.className =
        "article-thumb";


    /*
     * Use article image when available.
     */

    if (
        article.image
    ) {

        const image =
            document.createElement("img");


        image.src =
            article.image;


        image.alt =
            article.title ||
            "Electrical engineering article";


        image.loading =
            "lazy";


        image.decoding =
            "async";


        thumbnail.appendChild(
            image
        );

    } else {

        /*
         * Fall back to Material Symbol.
         */

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
            article.icon ||
            "article";


        thumbnail.appendChild(
            icon
        );

    }


    thumbnailLink.appendChild(
        thumbnail
    );


    /*
     * Build article.
     */

    item.appendChild(
        text
    );


    item.appendChild(
        thumbnailLink
    );


    return item;

}


/* =========================================================
   FORMAT ARTICLE DATE
========================================================== */

function formatArticleDate(
    date
) {

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
   NORMALIZE URL
========================================================== */

function normalizeURL(
    url
) {

    if (!url) {

        return "/";

    }


    let cleanURL =
        String(url);


    /*
     * Remove query string.
     */

    cleanURL =
        cleanURL.split("?")[0];


    /*
     * Remove hash.
     */

    cleanURL =
        cleanURL.split("#")[0];


    /*
     * Convert backslashes.
     */

    cleanURL =
        cleanURL.replace(
            /\\/g,
            "/"
        );


    /*
     * Ensure leading slash.
     */

    if (
        !cleanURL.startsWith("/")
    ) {

        cleanURL =
            "/" +
            cleanURL;

    }


    /*
     * Remove duplicate slashes.
     */

    cleanURL =
        cleanURL.replace(
            /\/+/g,
            "/"
        );


    /*
     * Normalize trailing slash.
     */

    if (
        cleanURL.length > 1 &&
        !cleanURL.endsWith("/")
    ) {

        cleanURL += "/";

    }


    return cleanURL;

}


/* =========================================================
   SEARCH
========================================================== */

function initializeSearch() {

    const form =
        document.getElementById(
            SITE_CONFIG.searchFormID
        );


    const input =
        document.getElementById(
            SITE_CONFIG.searchInputID
        );


    const message =
        document.getElementById(
            SITE_CONFIG.searchMessageID
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

            performSiteSearch(
                input.value,
                message
            );

        }
    );

}


/* =========================================================
   PERFORM SEARCH
========================================================== */

function performSiteSearch(
    query,
    message
) {

    const trimmed =
        String(query || "")
            .trim();


    if (!trimmed) {

        if (message) {

            message.textContent =
                "";

        }

        return;

    }


    /*
     * Redirect to the articles page
     * with the search query.
     */

    const searchURL =
        "/articles/?q=" +
        encodeURIComponent(
            trimmed
        );


    window.location.href =
        searchURL;

}


/* =========================================================
   MOBILE SIDEBAR
========================================================== */

function initializeMobileSidebar() {

    const sidebar =
        document.getElementById(
            SITE_CONFIG.sidebarID
        );


    const menuButton =
        document.getElementById(
            SITE_CONFIG.menuButtonID
        );


    const overlay =
        document.querySelector(
            SITE_CONFIG.overlaySelector
        );


    if (
        !sidebar ||
        !menuButton ||
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


        menuButton.setAttribute(
            "aria-expanded",
            "true"
        );


        menuButton.setAttribute(
            "aria-label",
            "Close article categories"
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


        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );


        menuButton.setAttribute(
            "aria-label",
            "Open article categories"
        );

    }


    menuButton.addEventListener(
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


    /*
     * Close drawer when a sidebar
     * link is clicked.
     */

    sidebar
        .querySelectorAll("a")
        .forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    closeSidebar
                );

            }
        );


    /*
     * Escape key closes drawer.
     */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                closeSidebar();

            }

        }
    );

}
