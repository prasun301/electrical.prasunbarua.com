/**
 * Electrical Engineering by Prasun Barua
 * Main application script
 *
 * Responsibilities:
 * - Load article data from /articles.json
 * - Render latest published articles
 * - Automatically sort articles newest first
 * - Handle site search
 * - Handle mobile category sidebar
 * - Provide graceful error handling
 */

(() => {
    "use strict";

    /* =========================================================
       CONFIGURATION
       ========================================================= */

    const CONFIG = {
        articlesUrl: "/articles.json",
        articlesPage: "/articles/",
        latestArticleLimit: 6,
        articlesTimeout: 10000
    };


    /* =========================================================
       DOM HELPERS
       ========================================================= */

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        Array.from(parent.querySelectorAll(selector));


    /* =========================================================
       HTML ESCAPING
       ========================================================= */

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =========================================================
       DATE FORMATTING
       ========================================================= */

    function formatDate(dateString) {
        if (!dateString) {
            return "";
        }

        const date = new Date(`${dateString}T00:00:00`);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        }).format(date);
    }


    /* =========================================================
       DATE PARSING
       ========================================================= */

    function getPublishedDate(article) {
        if (!article || !article.datePublished) {
            return 0;
        }

        const date = new Date(
            `${article.datePublished}T00:00:00`
        );

        if (Number.isNaN(date.getTime())) {
            return 0;
        }

        return date.getTime();
    }


    /* =========================================================
       ARTICLE SORTING
       Newest published article first
       ========================================================= */

    function sortNewestFirst(articles) {
        return [...articles].sort((a, b) => {
            return (
                getPublishedDate(b) -
                getPublishedDate(a)
            );
        });
    }


    /* =========================================================
       ARTICLE THUMBNAIL
       ========================================================= */

    function renderArticleThumbnail(article) {
        const icon = escapeHTML(
            article.icon || "article"
        );

        const image = article.image
            ? escapeHTML(article.image)
            : "";

        if (image) {
            return `
                <span class="article-thumb">
                    <img
                        src="${image}"
                        alt=""
                        loading="lazy"
                        decoding="async"
                        onerror="this.parentElement.innerHTML='<span class=&quot;material-symbols-rounded&quot;>article</span>'"
                    >
                </span>
            `;
        }

        return `
            <span
                class="article-thumb"
                aria-hidden="true"
            >
                <span class="material-symbols-rounded">
                    ${icon}
                </span>
            </span>
        `;
    }


    /* =========================================================
       ARTICLE CARD
       ========================================================= */

    function renderArticle(article) {
        const title = escapeHTML(
            article.title || "Untitled Article"
        );

        const description = escapeHTML(
            article.excerpt ||
            article.description ||
            ""
        );

        const category = escapeHTML(
            article.categoryName ||
            "Electrical Engineering"
        );

        const readingTime = escapeHTML(
            article.readingTime || ""
        );

        const url = escapeHTML(
            article.url || "#"
        );

        const date = formatDate(
            article.datePublished
        );

        const metaItems = [];

        if (category) {
            metaItems.push(
                `<span class="article-category">${category}</span>`
            );
        }

        if (date) {
            if (metaItems.length) {
                metaItems.push(
                    `<span aria-hidden="true">·</span>`
                );
            }

            metaItems.push(
                `<span>${escapeHTML(date)}</span>`
            );
        }

        if (readingTime) {
            if (metaItems.length) {
                metaItems.push(
                    `<span aria-hidden="true">·</span>`
                );
            }

            metaItems.push(
                `<span>${readingTime}</span>`
            );
        }

        return `
            <article class="article-item">

                <div>
                    <h3>
                        <a href="${url}">
                            ${title}
                        </a>
                    </h3>

                    <p class="article-excerpt">
                        ${description}
                    </p>

                    <div class="article-meta">
                        ${metaItems.join("")}
                    </div>
                </div>

                <a
                    href="${url}"
                    class="article-thumb-link"
                    aria-label="Read ${title}"
                >
                    ${renderArticleThumbnail(article)}
                </a>

            </article>
        `;
    }


    /* =========================================================
       FETCH JSON WITH TIMEOUT
       ========================================================= */

    async function fetchArticlesJSON() {
        const controller =
            new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, CONFIG.articlesTimeout);

        try {
            const url =
                new URL(
                    CONFIG.articlesUrl,
                    window.location.origin
                ).href;

            const response = await fetch(
                url,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    },
                    cache: "no-cache",
                    signal: controller.signal
                }
            );

            if (!response.ok) {
                throw new Error(
                    `articles.json returned HTTP ${response.status}`
                );
            }

            const contentType =
                response.headers.get("content-type") || "";

            /*
             * Do not strictly require application/json because
             * some static hosts may return an unusual content type.
             */

            const data =
                await response.json();

            return data;

        } finally {
            clearTimeout(timeout);
        }
    }


    /* =========================================================
       LOAD ARTICLES
       ========================================================= */

    async function loadArticles() {
        const articleList =
            $("#latest-articles");

        if (!articleList) {
            console.warn(
                "Element #latest-articles was not found."
            );

            return;
        }

        /*
         * Make sure the loading message is visible
         * while the request is running.
         */

        articleList.innerHTML = `
            <p class="article-loading">
                Loading articles...
            </p>
        `;

        try {
            const data =
                await fetchArticlesJSON();

            if (
                !data ||
                !Array.isArray(data.articles)
            ) {
                throw new Error(
                    "Invalid articles.json structure. Expected an 'articles' array."
                );
            }

            /*
             * Only published articles are displayed.
             */

            const publishedArticles =
                data.articles.filter(article => {

                    if (!article) {
                        return false;
                    }

                    if (
                        article.status !==
                        "published"
                    ) {
                        return false;
                    }

                    if (!article.title) {
                        return false;
                    }

                    if (!article.url) {
                        return false;
                    }

                    return true;
                });


            /*
             * Sort automatically:
             *
             * newest datePublished
             * ↓
             * oldest datePublished
             */

            const latestArticles =
                sortNewestFirst(
                    publishedArticles
                ).slice(
                    0,
                    CONFIG.latestArticleLimit
                );


            if (!latestArticles.length) {

                articleList.innerHTML = `
                    <p class="article-empty">
                        No published articles are available yet.
                    </p>
                `;

                return;
            }


            /*
             * Render latest articles.
             */

            articleList.innerHTML =
                latestArticles
                    .map(renderArticle)
                    .join("");


            console.log(
                `Loaded ${latestArticles.length} latest articles.`
            );

        } catch (error) {

            console.error(
                "Article loading error:",
                error
            );


            let message =
                "Articles could not be loaded at this time.";


            if (
                error &&
                error.name === "AbortError"
            ) {
                message =
                    "Article loading timed out. Please try again.";
            }


            articleList.innerHTML = `
                <p class="article-error">
                    ${escapeHTML(message)}
                </p>
            `;
        }
    }


    /* =========================================================
       SEARCH
       ========================================================= */

    function initSearch() {
        const searchForm =
            $("#site-search-form");

        const searchInput =
            $("#site-search");

        const searchMessage =
            $("#search-message");


        if (
            !searchForm ||
            !searchInput
        ) {
            return;
        }


        searchForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const query =
                    searchInput.value.trim();


                if (!query) {

                    if (searchMessage) {
                        searchMessage.textContent =
                            "Enter a topic to search.";
                    }

                    searchInput.focus();

                    return;
                }


                if (searchMessage) {
                    searchMessage.textContent = "";
                }


                const searchURL =
                    `${CONFIG.articlesPage}?q=` +
                    encodeURIComponent(query);


                window.location.href =
                    searchURL;
            }
        );


        searchInput.addEventListener(
            "input",
            () => {

                if (searchMessage) {
                    searchMessage.textContent = "";
                }

            }
        );
    }


    /* =========================================================
       MOBILE SIDEBAR
       ========================================================= */

    function initMobileSidebar() {

        const menuButton =
            $("#menu-button");

        const sidebar =
            $("#category-sidebar");

        const overlay =
            $(".sidebar-overlay");


        if (
            !menuButton ||
            !sidebar
        ) {
            return;
        }


        const menuIcon =
            $(".material-symbols-rounded", menuButton);


        function openSidebar() {

            sidebar.classList.add(
                "active"
            );


            if (overlay) {
                overlay.classList.add(
                    "active"
                );
            }


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


            if (menuIcon) {
                menuIcon.textContent =
                    "close";
            }
        }


        function closeSidebar() {

            sidebar.classList.remove(
                "active"
            );


            if (overlay) {
                overlay.classList.remove(
                    "active"
                );
            }


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


            if (menuIcon) {
                menuIcon.textContent =
                    "menu";
            }
        }


        function toggleSidebar() {

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


        menuButton.addEventListener(
            "click",
            toggleSidebar
        );


        if (overlay) {

            overlay.addEventListener(
                "click",
                closeSidebar
            );

        }


        $$(".category-list a, .sidebar-link", sidebar)
            .forEach(link => {

                link.addEventListener(
                    "click",
                    closeSidebar
                );

            });


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape"
                ) {
                    closeSidebar();
                }

            }
        );


        window.addEventListener(
            "resize",
            () => {

                if (
                    window.innerWidth > 900 &&
                    sidebar.classList.contains(
                        "active"
                    )
                ) {
                    closeSidebar();
                }

            }
        );
    }


    /* =========================================================
       INITIALIZATION
       ========================================================= */

    function init() {

        initSearch();

        initMobileSidebar();

        loadArticles();

    }


    /* =========================================================
       START APPLICATION
       ========================================================= */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init,
            { once: true }
        );

    } else {

        init();

    }

})();
