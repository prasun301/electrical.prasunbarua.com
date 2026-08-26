"use strict";


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadLatestArticles();

        initializeSearch();

        initializeMobileSidebar();

    }
);


/* =========================================================
   CONFIGURATION
========================================================= */

const ARTICLES_URL =
    "/articles.json";

const LATEST_CONTAINER =
    "latest-articles";

const MAX_LATEST_ARTICLES =
    6;


/* =========================================================
   LOAD LATEST ARTICLES
========================================================= */

async function loadLatestArticles() {

    const container =
        document.getElementById(
            LATEST_CONTAINER
        );


    /*
     * Homepage may not contain the
     * latest-articles container.
     */

    if (!container) {

        return;

    }


    /*
     * Loading state.
     */

    container.innerHTML =
        '<p class="article-empty">Loading articles...</p>';


    try {

        const response =
            await fetch(
                ARTICLES_URL,
                {
                    method: "GET",
                    cache: "no-store",
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status +
                ": Unable to load " +
                ARTICLES_URL
            );

        }


        const data =
            await response.json();


        /*
         * Support both:
         *
         * [
         *   {...}
         * ]
         *
         * and:
         *
         * {
         *   "articles": [...]
         * }
         */

        const articles =
            Array.isArray(data)
                ? data
                : Array.isArray(data.articles)
                    ? data.articles
                    : [];


        if (!articles.length) {

            throw new Error(
                "No articles found in articles.json."
            );

        }


        /*
         * Filter and sort published articles.
         */

        const publishedArticles =
            articles
                .filter(
                    function (article) {

                        return isPublishedArticle(
                            article
                        );

                    }
                )
                .sort(
                    function (a, b) {

                        return (
                            getDateTimestamp(
                                b.datePublished
                            ) -
                            getDateTimestamp(
                                a.datePublished
                            )
                        );

                    }
                );


        /*
         * No published articles.
         */

        if (!publishedArticles.length) {

            renderArticleMessage(
                container,
                "No published articles are currently available."
            );

            return;

        }


        /*
         * Get latest articles.
         */

        const latestArticles =
            publishedArticles.slice(
                0,
                MAX_LATEST_ARTICLES
            );


        renderLatestArticles(
            container,
            latestArticles
        );


    } catch (error) {

        console.error(
            "Latest articles error:",
            error
        );


        renderArticleError(
            container
        );

    }

}


/* =========================================================
   CHECK PUBLISHED ARTICLE
========================================================= */

function isPublishedArticle(
    article
) {

    if (
        !article ||
        typeof article !== "object"
    ) {

        return false;

    }


    /*
     * Must be explicitly published.
     */

    if (
        String(
            article.status || ""
        ).trim().toLowerCase() !==
        "published"
    ) {

        return false;

    }


    /*
     * Must have a publication date.
     */

    if (!article.datePublished) {

        return false;

    }


    /*
     * Must have a usable URL.
     */

    if (
        !article.url ||
        !String(article.url).trim()
    ) {

        return false;

    }


    /*
     * Check date.
     */

    const publicationDate =
        parseArticleDate(
            article.datePublished
        );


    if (!publicationDate) {

        return false;

    }


    /*
     * Hide future articles.
     */

    const now =
        new Date();


    /*
     * Compare against current moment.
     */

    if (
        publicationDate.getTime() >
        now.getTime()
    ) {

        return false;

    }


    return true;

}


/* =========================================================
   PARSE ARTICLE DATE
========================================================= */

function parseArticleDate(
    value
) {

    if (!value) {

        return null;

    }


    /*
     * Handle YYYY-MM-DD explicitly.
     *
     * This avoids timezone inconsistencies.
     */

    const valueString =
        String(value).trim();


    const match =
        valueString.match(
            /^(\d{4})-(\d{2})-(\d{2})$/
        );


    if (match) {

        const year =
            Number(match[1]);

        const month =
            Number(match[2]);

        const day =
            Number(match[3]);


        const date =
            new Date(
                year,
                month - 1,
                day
            );


        if (
            date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day
        ) {

            return date;

        }


        return null;

    }


    /*
     * Fallback for full ISO dates.
     */

    const date =
        new Date(valueString);


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
   DATE TIMESTAMP
========================================================= */

function getDateTimestamp(
    value
) {

    const date =
        parseArticleDate(
            value
        );


    return date
        ? date.getTime()
        : 0;

}


/* =========================================================
   NORMALIZE URL
========================================================= */

function normalizeURL(
    value
) {

    if (!value) {

        return "";

    }


    let url =
        String(value)
            .trim()
            .replace(/\\/g, "/");


    /*
     * Remove query string.
     */

    url =
        url.split("?")[0];


    /*
     * Remove hash.
     */

    url =
        url.split("#")[0];


    /*
     * External URL:
     * leave unchanged.
     */

    if (
        /^https?:\/\//i.test(url)
    ) {

        return url;

    }


    /*
     * Ensure leading slash.
     */

    if (
        !url.startsWith("/")
    ) {

        url =
            "/" + url;

    }


    /*
     * Remove duplicate slashes.
     */

    url =
        url.replace(
            /\/+/g,
            "/"
        );


    /*
     * Normalize directory URLs.
     */

    if (
        !url.endsWith("/") &&
        !url.endsWith(".html")
    ) {

        url += "/";

    }


    return url;

}


/* =========================================================
   NORMALIZE IMAGE URL
========================================================= */

function normalizeImageURL(
    value
) {

    if (!value) {

        return "";

    }


    let url =
        String(value)
            .trim()
            .replace(/\\/g, "/");


    /*
     * External image.
     */

    if (
        /^https?:\/\//i.test(url)
    ) {

        return url;

    }


    /*
     * Ensure leading slash.
     */

    if (
        !url.startsWith("/")
    ) {

        url =
            "/" + url;

    }


    /*
     * Remove duplicate slashes.
     */

    url =
        url.replace(
            /\/+/g,
            "/"
        );


    return url;

}


/* =========================================================
   RENDER LATEST ARTICLES
========================================================= */

function renderLatestArticles(
    container,
    articles
) {

    container.innerHTML =
        "";


    if (
        !Array.isArray(articles) ||
        !articles.length
    ) {

        renderArticleMessage(
            container,
            "No published articles are currently available."
        );

        return;

    }


    articles.forEach(
        function (article) {

            const item =
                createArticleElement(
                    article
                );


            if (item) {

                container.appendChild(
                    item
                );

            }

        }
    );


    /*
     * Safety check.
     */

    if (
        !container.children.length
    ) {

        renderArticleMessage(
            container,
            "No articles are available."
        );

    }

}


/* =========================================================
   CREATE ARTICLE ELEMENT
========================================================= */

function createArticleElement(
    article
) {

    if (
        !article ||
        typeof article !== "object"
    ) {

        return null;

    }


    const articleURL =
        normalizeURL(
            article.url
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
        document.createElement(
            "article"
        );


    item.className =
        "article-item";


    /* =====================================================
       CONTENT
    ====================================================== */

    const content =
        document.createElement(
            "div"
        );


    /*
     * TITLE
     */

    const title =
        document.createElement(
            "h3"
        );


    const titleLink =
        document.createElement(
            "a"
        );


    titleLink.href =
        articleURL;


    titleLink.textContent =
        article.title ||
        "Electrical Engineering Article";


    title.appendChild(
        titleLink
    );


    /*
     * EXCERPT
     */

    const excerptText =
        article.excerpt ||
        article.description ||
        "";


    const excerpt =
        document.createElement(
            "p"
        );


    excerpt.className =
        "article-excerpt";


    excerpt.textContent =
        excerptText;


    /*
     * META
     */

    const meta =
        document.createElement(
            "div"
        );


    meta.className =
        "article-meta";


    /*
     * CATEGORY
     */

    const category =
        document.createElement(
            "span"
        );


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
     * READING TIME
     */

    if (
        article.readingTime
    ) {

        appendMetaSeparator(
            meta
        );


        const readingTime =
            document.createElement(
                "span"
            );


        readingTime.textContent =
            article.readingTime;


        meta.appendChild(
            readingTime
        );

    }


    /*
     * DATE
     */

    const publicationDate =
        parseArticleDate(
            article.datePublished
        );


    if (publicationDate) {

        appendMetaSeparator(
            meta
        );


        const dateElement =
            document.createElement(
                "time"
            );


        dateElement.dateTime =
            article.datePublished;


        dateElement.textContent =
            formatDate(
                publicationDate
            );


        meta.appendChild(
            dateElement
        );

    }


    /*
     * Build text content.
     */

    content.appendChild(
        title
    );


    if (
        excerptText
    ) {

        content.appendChild(
            excerpt
        );

    }


    content.appendChild(
        meta
    );


    /* =====================================================
       THUMBNAIL
    ====================================================== */

    const thumbnailLink =
        document.createElement(
            "a"
        );


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
        document.createElement(
            "div"
        );


    thumbnail.className =
        "article-thumb";


    const imageURL =
        normalizeImageURL(
            article.image
        );


    if (imageURL) {

        const image =
            document.createElement(
                "img"
            );


        image.src =
            imageURL;


        image.alt =
            article.title ||
            "Electrical engineering article";


        image.loading =
            "lazy";


        image.decoding =
            "async";


        image.addEventListener(
            "error",
            function () {

                thumbnail.innerHTML =
                    "";


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


    thumbnailLink.appendChild(
        thumbnail
    );


    /*
     * Final article element.
     */

    item.appendChild(
        content
    );


    item.appendChild(
        thumbnailLink
    );


    return item;

}


/* =========================================================
   META SEPARATOR
========================================================= */

function appendMetaSeparator(
    container
) {

    const separator =
        document.createElement(
            "span"
        );


    separator.textContent =
        "·";


    separator.setAttribute(
        "aria-hidden",
        "true"
    );


    container.appendChild(
        separator
    );

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
   FORMAT DATE
========================================================= */

function formatDate(
    date
) {

    if (
        !(date instanceof Date) ||
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    try {

        return date.toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );

    } catch (error) {

        return "";

    }

}


/* =========================================================
   LOADING MESSAGE
========================================================= */

function showArticleLoading(
    container
) {

    container.innerHTML =
        "";


    const message =
        document.createElement(
            "p"
        );


    message.className =
        "article-empty";


    message.textContent =
        "Loading articles...";


    container.appendChild(
        message
    );

}


/* =========================================================
   EMPTY MESSAGE
========================================================= */

function renderArticleMessage(
    container,
    message
) {

    container.innerHTML =
        "";


    const element =
        document.createElement(
            "p"
        );


    element.className =
        "article-empty";


    element.textContent =
        message;


    container.appendChild(
        element
    );

}


/* =========================================================
   ERROR MESSAGE
========================================================= */

function renderArticleError(
    container
) {

    container.innerHTML =
        "";


    const element =
        document.createElement(
            "p"
        );


    element.className =
        "article-error";


    element.textContent =
        "Unable to load the latest articles. Please try again later.";


    container.appendChild(
        element
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
                encodeURIComponent(
                    query
                );

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


        button.setAttribute(
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


        button.setAttribute(
            "aria-expanded",
            "false"
        );


        button.setAttribute(
            "aria-label",
            "Open article categories"
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
        .forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    closeSidebar
                );

            }
        );


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
