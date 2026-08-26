/**
 * Electrical Engineering by Prasun Barua
 * Main application script
 *
 * Responsibilities:
 * - Load article data from /articles.json
 * - Render latest published articles
 * - Sort newest articles first automatically
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
        articlesFile: "/articles.json",
        articlesPage: "/articles/",
        latestArticleLimit: 6,
        fetchTimeout: 10000
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

    function getArticleTimestamp(dateString) {
        if (!dateString) {
            return 0;
        }

        const timestamp = new Date(
            `${dateString}T00:00:00`
        ).getTime();

        return Number.isNaN(timestamp)
            ? 0
            : timestamp;
    }


    /* =========================================================
       ARTICLE SORTING
       ========================================================= */

    function sortNewestFirst(articles) {
        return [...articles].sort((a, b) => {
            const dateB =
                getArticleTimestamp(b.datePublished);

            const dateA =
                getArticleTimestamp(a.datePublished);

            return dateB - dateA;
        });
    }


    /* =========================================================
       ARTICLE THUMBNAIL
       ========================================================= */

    function renderArticleThumbnail(article) {
        const icon =
            escapeHTML(article.icon || "article");

        const image =
            article.image
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
        const title =
            escapeHTML(article.title);

        const description =
            escapeHTML(
                article.excerpt ||
                article.description ||
                ""
            );

        const category =
            escapeHTML(
                article.categoryName ||
                "Electrical Engineering"
            );

        const readingTime =
            escapeHTML(
                article.readingTime || ""
            );

        const url =
            escapeHTML(
                article.url || "#"
            );

        const date =
            formatDate(article.datePublished);

        const metaItems = [
            `<span class="article-category">${category}</span>`
        ];

        if (date) {
            metaItems.push(
                `<span aria-hidden="true">·</span>`
            );

            metaItems.push(
                `<span>${escapeHTML(date)}</span>`
            );
        }

        if (readingTime) {
            metaItems.push(
                `<span aria-hidden="true">·</span>`
            );

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
       ERROR MESSAGE
       ========================================================= */

    function showArticleError(articleList, message) {
        if (!articleList) {
            return;
        }

        articleList.innerHTML = `
            <p class="article-error">
                ${escapeHTML(message)}
            </p>
        `;
    }


    /* =========================================================
       LOAD JSON WITH TIMEOUT
       ========================================================= */

    async function fetchArticlesJSON() {

        const controller =
            new AbortController();

        const timeout =
            setTimeout(() => {
                controller.abort();
            }, CONFIG.fetchTimeout);

        try {

            /*
             * Build the URL from the current site origin.
             *
             * Example:
             * https://electrical.prasunbarua.com/articles.json
             */

            const articlesURL =
                new URL(
                    CONFIG.articlesFile,
                    window.location.origin
                );

            /*
             * Cache busting.
             * This helps prevent an old articles.json
             * from being served from browser/CDN cache.
             */

            articlesURL.searchParams.set(
                "v",
                Date.now().toString()
            );

            console.log(
                "Loading articles from:",
                articlesURL.href
            );

            const response =
                await fetch(
                    articlesURL.href,
                    {
                        method: "GET",
                        headers: {
                            "Accept": "application/json"
                        },
                        cache: "no-store",
                        credentials: "same-origin",
                        signal: controller.signal
                    }
                );

            if (!response.ok) {
                throw new Error(
                    `articles.json returned HTTP ${response.status}`
                );
            }

            const contentType =
                response.headers.get(
                    "content-type"
                ) || "";

            console.log(
                "articles.json content type:",
                contentType
            );

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
                'Element "#latest-articles" was not found.'
            );

            return;
        }

        /*
         * Keep loading message visible while fetching.
         */

        articleList.innerHTML = `
            <p class="article-loading">
                Loading articles...
            </p>
        `;

        try {

            const data =
                await fetchArticlesJSON();

            console.log(
                "articles.json loaded:",
                data
            );

            if (
                !data ||
                !Array.isArray(data.articles)
            ) {
                throw new Error(
                    "Invalid articles.json structure. Expected an articles array."
                );
            }


            /* =================================================
               FILTER PUBLISHED ARTICLES
               ================================================= */

            const publishedArticles =
                data.articles.filter(article => {

                    return (
                        article &&
                        article.status === "published" &&
                        article.url &&
                        article.title &&
                        article.datePublished
                    );

                });


            console.log(
                "Published articles:",
                publishedArticles
            );


            /* =================================================
               SORT NEWEST FIRST
               ================================================= */

            const latestArticles =
                sortNewestFirst(
                    publishedArticles
                ).slice(
                    0,
                    CONFIG.latestArticleLimit
                );


            console.log(
                "Latest articles:",
                latestArticles
            );


            /* =================================================
               NO ARTICLES
               ================================================= */

            if (!latestArticles.length) {

                articleList.innerHTML = `
                    <p class="article-empty">
                        No published articles are available yet.
                    </p>
                `;

                return;
            }


            /* =================================================
               RENDER ARTICLES
               ================================================= */

            articleList.innerHTML =
                latestArticles
                    .map(renderArticle)
                    .join("");


        } catch (error) {

            console.error(
                "Article loading error:",
                error
            );

            let message =
                "Articles could not be loaded.";

            if (
                error &&
                error.name === "AbortError"
            ) {
                message =
                    "Loading articles timed out. Please try again later.";
            } else if (
                error &&
                error.message
            ) {
                message =
                    `Articles could not be loaded: ${error.message}`;
            }

            showArticleError(
                articleList,
                message
            );
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

        if (!searchForm || !searchInput) {
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

        if (!menuButton || !sidebar) {
            return;
        }

        const menuIcon =
            $(".material-symbols-rounded", menuButton);


        function openSidebar() {

            sidebar.classList.add("active");

            if (overlay) {
                overlay.classList.add("active");
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
                menuIcon.textContent = "close";
            }
        }


        function closeSidebar() {

            sidebar.classList.remove("active");

            if (overlay) {
                overlay.classList.remove("active");
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
                menuIcon.textContent = "menu";
            }
        }


        function toggleSidebar() {

            if (
                sidebar.classList.contains("active")
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

                if (event.key === "Escape") {
                    closeSidebar();
                }

            }
        );


        window.addEventListener(
            "resize",
            () => {

                if (
                    window.innerWidth > 900 &&
                    sidebar.classList.contains("active")
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

        console.log(
            "Electrical Engineering app initialized."
        );

        initSearch();

        initMobileSidebar();

        loadArticles();
    }


    /* =========================================================
       START APPLICATION
       ========================================================= */

    if (
        document.readyState === "loading"
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
