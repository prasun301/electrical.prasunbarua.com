/* =========================================================
   ELECTRICAL ENGINEERING
   MAIN SITE APPLICATION
   ---------------------------------------------------------
   Loads and displays latest published articles from
   /articles.json
   ========================================================= */

"use strict";


document.addEventListener("DOMContentLoaded", function () {

    initializeSite();

});


/* =========================================================
   CONFIGURATION
   ========================================================== */

const SITE_CONFIG = {

    articlesURL: "/articles.json",

    latestContainerID: "latest-articles",

    latestArticleCount: 6,

    fetchTimeout: 10000

};


/* =========================================================
   INITIALIZE SITE
   ========================================================== */

function initializeSite() {

    initializeLatestArticles();

    initializeSearch();

    initializeMobileSidebar();

}


/* =========================================================
   LOAD LATEST ARTICLES
   ========================================================== */

async function initializeLatestArticles() {

    const container =
        document.getElementById(
            SITE_CONFIG.latestContainerID
        );


    if (!container) {

        return;

    }


    try {

        showArticleLoading(container);


        const response =
            await fetchWithTimeout(
                SITE_CONFIG.articlesURL,
                SITE_CONFIG.fetchTimeout
            );


        if (!response.ok) {

            throw new Error(
                "articles.json returned HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        /*
         * Your articles.json uses:
         *
         * {
         *     "site": {...},
         *     "categories": [...],
         *     "articles": [...]
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
                "No articles were found in articles.json."
            );

        }


        const publishedArticles =
            getPublishedArticles(
                articles
            );


        if (!publishedArticles.length) {

            renderArticleMessage(
                container,
                "No published articles are currently available."
            );

            return;

        }


        const latestArticles =
            publishedArticles.slice(
                0,
                SITE_CONFIG.latestArticleCount
            );


        renderLatestArticles(
            container,
            latestArticles
        );


    } catch (error) {

        console.error(
            "Latest articles failed to load:",
            error
        );


        renderArticleError(
            container,
            error
        );

    }

}


/* =========================================================
   FETCH WITH TIMEOUT
   ========================================================== */

async function fetchWithTimeout(
    url,
    timeout
) {

    const controller =
        new AbortController();


    const timeoutID =
        window.setTimeout(
            function () {
                controller.abort();
            },
            timeout
        );


    try {

        return await fetch(
            url,
            {
                method: "GET",

                cache: "no-cache",

                headers: {
                    "Accept":
                        "application/json"
                },

                signal:
                    controller.signal
            }
        );

    } finally {

        window.clearTimeout(
            timeoutID
        );

    }

}


/* =========================================================
   FILTER PUBLISHED ARTICLES
   ========================================================== */

function getPublishedArticles(
    articles
) {

    const now =
        new Date();


    return articles

        .filter(
            function (article) {

                if (
                    !article ||
                    typeof article !== "object"
                ) {

                    return false;

                }


                /*
                 * Article must explicitly be published.
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


                const publicationDate =
                    parseDate(
                        article.datePublished
                    );


                if (!publicationDate) {

                    return false;

                }


                /*
                 * Do not show future articles.
                 */

                if (
                    publicationDate > now
                ) {

                    return false;

                }


                /*
                 * Must have a usable URL.
                 */

                const url =
                    normalizeURL(
                        article.url || ""
                    );


                if (!url || url === "/") {

                    return false;

                }


                return true;

            }
        )

        .sort(
            function (a, b) {

                const dateA =
                    parseDate(
                        a.datePublished
                    );


                const dateB =
                    parseDate(
                        b.datePublished
                    );


                return (
                    dateB.getTime() -
                    dateA.getTime()
                );

            }
        );

}


/* =========================================================
   PARSE DATE
   ========================================================== */

function parseDate(
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
   NORMALIZE URL
   ========================================================== */

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
     * Do not change .html URLs.
     *
     * For directory URLs, normalize to trailing slash.
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
   RENDER LATEST ARTICLES
   ========================================================== */

function renderLatestArticles(
    container,
    articles
) {

    container.innerHTML = "";


    articles.forEach(
        function (article) {

            const element =
                createArticleElement(
                    article
                );


            if (element) {

                container.appendChild(
                    element
                );

            }

        }
    );


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
   ========================================================== */

function createArticleElement(
    article
) {

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


    const wrapper =
        document.createElement(
            "article"
        );


    wrapper.className =
        "article-item";


    /* =====================================================
       TEXT CONTENT
       ====================================================== */

    const content =
        document.createElement(
            "div"
        );


    const heading =
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


    heading.appendChild(
        titleLink
    );


    const excerpt =
        document.createElement(
            "p"
        );


    excerpt.className =
        "article-excerpt";


    excerpt.textContent =
        article.excerpt ||
        article.description ||
        "";


    const meta =
        document.createElement(
            "div"
        );


    meta.className =
        "article-meta";


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


    const separator =
        document.createElement(
            "span"
        );


    separator.setAttribute(
        "aria-hidden",
        "true"
    );


    separator.textContent =
        "·";


    const readingTime =
        document.createElement(
            "span"
        );


    readingTime.textContent =
        article.readingTime ||
        "";


    const date =
        parseDate(
            article.datePublished
        );


    const dateElement =
        document.createElement(
            "time"
        );


    if (date) {

        dateElement.dateTime =
            article.datePublished;


        dateElement.textContent =
            formatDate(
                date
            );

    }


    meta.appendChild(
        category
    );


    meta.appendChild(
        separator
    );


    if (
        readingTime.textContent
    ) {

        meta.appendChild(
            readingTime
        );

        meta.appendChild(
            document.createElement("span")
        );

        meta.lastChild.textContent =
            "·";

    }


    if (
        dateElement.textContent
    ) {

        meta.appendChild(
            dateElement
        );

    }


    content.appendChild(
        heading
    );


    if (
        excerpt.textContent
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


    if (
        article.image
    ) {

        const image =
            document.createElement(
                "img"
            );


        image.src =
            article.image;


        image.alt =
            article.title ||
            "Electrical engineering article";


        image.loading =
            "lazy";


        image.decoding =
            "async";


        image.onerror =
            function () {

                thumbnail.innerHTML = "";

                addFallbackIcon(
                    thumbnail,
                    article.icon
                );

            };


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


    wrapper.appendChild(
        content
    );


    wrapper.appendChild(
        thumbnailLink
    );


    return wrapper;

}


/* =========================================================
   FALLBACK ICON
   ========================================================== */

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
   ========================================================== */

function formatDate(
    date
) {

    try {

        return date.toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );

    } catch {

        return "";

    }

}


/* =========================================================
   LOADING
   ========================================================== */

function showArticleLoading(
    container
) {

    container.innerHTML = "";

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
   ========================================================== */

function renderArticleMessage(
    container,
    message
) {

    container.innerHTML = "";


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
   ========================================================== */

function renderArticleError(
    container,
    error
) {

    container.innerHTML = "";


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


    console.error(
        "Article loader error:",
        error
    );

}


/* =========================================================
   SITE SEARCH
   ========================================================== */

function initializeSearch() {

    const form =
        document.getElementById(
            "site-search-form"
        );


    const input =
        document.getElementById(
            "site-search"
        );


    const message =
        document.getElementById(
            "search-message"
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

                if (message) {

                    message.textContent =
                        "";

                }

                return;

            }


            window.location.href =
                "/articles/?" +
                "q=" +
                encodeURIComponent(
                    query
                );

        }
    );

}


/* =========================================================
   MOBILE SIDEBAR
   ========================================================== */

function initializeMobileSidebar() {

    const menuButton =
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
        !menuButton ||
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


        menuButton.setAttribute(
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


        menuButton.setAttribute(
            "aria-expanded",
            "false"
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
