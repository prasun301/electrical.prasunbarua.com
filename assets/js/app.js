/* =========================================================
   ELECTRICAL ENGINEERING BY PRASUN BARUA
   MAIN SITE JAVASCRIPT

   File:
   /assets/js/app.js

   Purpose:
   - Load articles.json
   - Display category articles
   - Search articles
   - Use exact article URLs from articles.json
   - Handle category navigation
   - Handle mobile navigation
   - Work with GitHub Pages + Cloudflare

   IMPORTANT:
   articles.json is the SOURCE OF TRUTH for article URLs.
   ========================================================= */

"use strict";


/* =========================================================
   GLOBAL CONFIGURATION
   ========================================================= */

const SITE_CONFIG = {

    articlesFile: "/articles.json",

    homeURL: "/",

    categories: {

        fundamentals: {
            name: "Electrical Fundamentals",
            shortName: "Fundamentals",
            path: "/articles/electrical-fundamentals/",
            icon: "electrical_services"
        },

        calculations: {
            name: "Electrical Calculations",
            shortName: "Calculations",
            path: "/articles/electrical-calculations/",
            icon: "calculate"
        },

        design: {
            name: "Electrical Design",
            shortName: "Design",
            path: "/articles/electrical-design/",
            icon: "architecture"
        },

        "power-systems": {
            name: "Power Systems",
            shortName: "Power Systems",
            path: "/articles/power-systems/",
            icon: "bolt"
        },

        "solar-pv": {
            name: "Solar PV",
            shortName: "Solar PV",
            path: "/articles/solar-pv/",
            icon: "solar_power"
        },

        "testing-commissioning": {
            name: "Testing & Commissioning",
            shortName: "Testing & Commissioning",
            path: "/articles/testing-commissioning/",
            icon: "engineering"
        }

    }

};


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeSite();

    }
);


/* =========================================================
   INITIALIZE SITE
   ========================================================= */

async function initializeSite() {

    try {

        setupMobileMenu();

        setupNavigation();

        setupSearch();

        await loadArticles();

    } catch (error) {

        console.error(
            "Electrical Engineering site initialization error:",
            error
        );

    }

}


/* =========================================================
   LOAD ARTICLES.JSON
   ========================================================= */

async function loadArticles() {

    const articleContainer =
        document.querySelector("#articles-list") ||
        document.querySelector("#article-list") ||
        document.querySelector(".articles-grid") ||
        document.querySelector(".article-grid");


    /*
       Article detail pages normally do not have
       an article listing container.

       Therefore, do nothing on those pages.
    */

    if (!articleContainer) {

        return;

    }


    try {

        const response =
            await fetch(
                SITE_CONFIG.articlesFile,
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


        const data =
            await response.json();


        const articles =
            normalizeArticles(data);


        if (!articles.length) {

            showEmptyState(
                articleContainer,
                "No articles available yet."
            );

            return;

        }


        /*
           Make articles available globally
           for search and other scripts.
        */

        window.ElectricalArticles =
            articles;


        renderCurrentPageArticles(
            articles
        );


    } catch (error) {

        console.error(
            "Error loading articles.json:",
            error
        );


        showEmptyState(
            articleContainer,
            "Articles could not be loaded. Please refresh the page."
        );

    }

}


/* =========================================================
   NORMALIZE ARTICLES
   ========================================================= */

function normalizeArticles(data) {

    let articles = [];


    /*
       Supported formats:

       1. [
            {...},
            {...}
          ]

       2. {
            "articles": [...]
          }

       3. {
            "items": [...]
          }
    */

    if (Array.isArray(data)) {

        articles = data;

    } else if (
        data &&
        Array.isArray(data.articles)
    ) {

        articles = data.articles;

    } else if (
        data &&
        Array.isArray(data.items)
    ) {

        articles = data.items;

    }


    return articles
        .filter(
            function (article) {

                return (
                    article &&
                    typeof article === "object"
                );

            }
        )
        .map(
            normalizeArticle
        );

}


/* =========================================================
   NORMALIZE ONE ARTICLE
   ========================================================= */

function normalizeArticle(article) {

    const normalized =
        Object.assign(
            {},
            article
        );


    normalized.title =
        article.title ||
        article.name ||
        "Untitled Article";


    normalized.description =
        article.description ||
        article.excerpt ||
        "";


    normalized.category =
        article.category ||
        article.categoryName ||
        "Electrical Engineering";


    normalized.categorySlug =
        article.categorySlug ||
        article.category_slug ||
        getCategorySlug(
            article.category
        );


    normalized.readTime =
        article.readTime ||
        article.read_time ||
        article.readingTime ||
        "";


    /*
       IMPORTANT:

       Use the exact URL supplied by articles.json.

       Do NOT modify it.

       Example:

       /articles/electrical-fundamentals/ohms-law/

       remains exactly that.

       And:

       /articles/electrical-fundamentals/what-is-voltage-current-resistance.html

       remains exactly that.
    */

    normalized.url =
        article.url ||
        article.href ||
        article.link ||
        "";


    /*
       Only create a URL if articles.json
       does not provide one.
    */

    if (!normalized.url) {

        normalized.url =
            buildArticleURL(
                normalized
            );

    } else {

        normalized.url =
            normalizeArticleURL(
                normalized.url
            );

    }


    return normalized;

}


/* =========================================================
   GET CATEGORY SLUG
   ========================================================= */

function getCategorySlug(category) {

    if (!category) {

        return "";

    }


    const text =
        String(category)
            .trim()
            .toLowerCase();


    const mappings = {

        "electrical fundamentals":
            "electrical-fundamentals",

        "fundamentals":
            "electrical-fundamentals",

        "electrical calculations":
            "electrical-calculations",

        "calculations":
            "electrical-calculations",

        "electrical design":
            "electrical-design",

        "design":
            "electrical-design",

        "power systems":
            "power-systems",

        "power system":
            "power-systems",

        "solar pv":
            "solar-pv",

        "solar pv engineering":
            "solar-pv",

        "testing & commissioning":
            "testing-commissioning",

        "testing and commissioning":
            "testing-commissioning",

        "testing commissioning":
            "testing-commissioning"

    };


    return (
        mappings[text] ||
        slugify(text)
    );

}


/* =========================================================
   BUILD ARTICLE URL
   =========================================================

   IMPORTANT:

   This is ONLY a fallback.

   If articles.json contains:

   "url": "/articles/electrical-fundamentals/what-is-voltage-current-resistance.html"

   that exact URL is used.

   This function never adds an "ohms-law" directory
   automatically.
   ========================================================= */

function buildArticleURL(article) {

    /*
       If an explicit URL exists,
       ALWAYS use it.
    */

    if (
        article &&
        article.url
    ) {

        return normalizeArticleURL(
            article.url
        );

    }


    const categorySlug =
        article.categorySlug ||
        getCategorySlug(
            article.category
        );


    let slug =
        article.slug ||
        article.articleSlug ||
        "";


    /*
       If slug is missing,
       create it from title.
    */

    if (!slug) {

        slug =
            slugify(
                article.title
            );

    }


    /*
       Standard fallback structure:

       /articles/category/article/

       Example:

       /articles/electrical-fundamentals/ohms-law/

       or

       /articles/electrical-fundamentals/
       what-is-voltage-current-resistance/
    */

    return (
        "/articles/" +
        encodeURIComponent(
            categorySlug
        ) +
        "/" +
        encodeURIComponent(
            slug
        ) +
        "/"
    );

}


/* =========================================================
   SLUGIFY
   ========================================================= */

function slugify(value) {

    return String(
        value || ""
    )
        .toLowerCase()
        .trim()
        .replace(
            /['’]/g,
            ""
        )
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        );

}


/* =========================================================
   DETERMINE CURRENT CATEGORY
   ========================================================= */

function getCurrentCategory() {

    const path =
        window.location.pathname
            .replace(
                /\/+$/,
                ""
            );


    const categoryMatch =
        path.match(
            /\/articles\/([^/]+)/
        );


    if (!categoryMatch) {

        return "";

    }


    return categoryMatch[1];

}


/* =========================================================
   RENDER CURRENT PAGE ARTICLES
   ========================================================= */

function renderCurrentPageArticles(
    articles
) {

    const currentCategory =
        getCurrentCategory();


    let filtered =
        articles;


    const listing =
        document.querySelector("#articles-list") ||
        document.querySelector("#article-list") ||
        document.querySelector(".articles-grid") ||
        document.querySelector(".article-grid");


    if (!listing) {

        return;

    }


    /*
       Check whether the page explicitly
       specifies a category.
    */

    const pageCategory =
        listing.dataset.category ||
        document.body.dataset.category ||
        currentCategory;


    if (pageCategory) {

        filtered =
            articles.filter(
                function (article) {

                    const slug =
                        article.categorySlug ||
                        getCategorySlug(
                            article.category
                        );


                    return (
                        slug ===
                        pageCategory
                    );

                }
            );

    }


    renderArticles(
        filtered,
        listing
    );


    updateArticleCount(
        filtered
    );

}


/* =========================================================
   RENDER ARTICLES
   ========================================================= */

function renderArticles(
    articles,
    container
) {

    container.innerHTML = "";


    if (!articles.length) {

        showEmptyState(
            container,
            "No articles found in this category."
        );

        return;

    }


    articles.forEach(
        function (article) {

            const card =
                createArticleCard(
                    article
                );


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   CREATE ARTICLE CARD
   ========================================================= */

function createArticleCard(
    article
) {

    /*
       Use an anchor element so normal browser
       navigation works automatically.

       This is safer than forcing navigation
       with JavaScript.
    */

    const card =
        document.createElement(
            "a"
        );


    /*
       CRITICAL:

       Use the EXACT normalized URL
       from articles.json.
    */

    const articleURL =
        normalizeArticleURL(
            article.url
        );


    card.href =
        articleURL;


    card.className =
        "article-card";


    card.setAttribute(
        "aria-label",
        article.title
    );


    const category =
        escapeHTML(
            article.category ||
            "Electrical Engineering"
        );


    const title =
        escapeHTML(
            article.title
        );


    const description =
        escapeHTML(
            article.description ||
            article.excerpt ||
            ""
        );


    const readTime =
        escapeHTML(
            article.readTime ||
            ""
        );


    card.innerHTML = `

        <div class="article-card-category">
            ${category}
        </div>

        <h2 class="article-card-title">
            ${title}
        </h2>

        ${
            description
                ? `
                    <p class="article-card-description">
                        ${description}
                    </p>
                  `
                : ""
        }

        ${
            readTime
                ? `
                    <div class="article-card-meta">

                        <span
                            class="material-symbols-rounded"
                            aria-hidden="true"
                        >
                            schedule
                        </span>

                        <span>
                            ${readTime}
                        </span>

                    </div>
                  `
                : ""
        }

    `;


    /*
       We intentionally DO NOT call:

       event.preventDefault()

       Normal browser link behavior is preferable.

       This allows:

       - Normal click
       - Ctrl + click
       - Cmd + click
       - Middle click
       - Open in new tab
       - Open in new window
       - Browser accessibility

       to work correctly.
    */

    return card;

}


/* =========================================================
   NORMALIZE ARTICLE URL
   ========================================================= */

function normalizeArticleURL(url) {

    if (!url) {

        return "/";

    }


    let finalURL =
        String(url).trim();


    /*
       Absolute URL:

       https://example.com/article/

       Keep unchanged.
    */

    if (
        /^https?:\/\//i.test(
            finalURL
        )
    ) {

        return finalURL;

    }


    /*
       Remove accidental whitespace.
    */

    finalURL =
        finalURL.replace(
            /\s+/g,
            ""
        );


    /*
       Ensure leading slash.
    */

    if (
        !finalURL.startsWith("/")
    ) {

        finalURL =
            "/" +
            finalURL;

    }


    /*
       Remove accidental duplicate slashes.

       Example:

       //articles///test/

       becomes:

       /articles/test/
    */

    finalURL =
        finalURL.replace(
            /\/{2,}/g,
            "/"
        );


    /*
       Preserve root URL.
    */

    if (
        finalURL === ""
    ) {

        finalURL = "/";

    }


    return finalURL;

}


/* =========================================================
   UPDATE ARTICLE COUNT
   ========================================================= */

function updateArticleCount(
    articles
) {

    const countElements =
        document.querySelectorAll(
            "[data-article-count]"
        );


    countElements.forEach(
        function (element) {

            const count =
                articles.length;


            element.textContent =
                count +
                (
                    count === 1
                        ? " article"
                        : " articles"
                );

        }
    );

}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {

    const searchInputs =
        document.querySelectorAll(
            'input[type="search"], .search-input, #search'
        );


    if (!searchInputs.length) {

        return;

    }


    searchInputs.forEach(
        function (input) {

            let timer;


            input.addEventListener(
                "input",
                function () {

                    clearTimeout(
                        timer
                    );


                    timer =
                        setTimeout(
                            function () {

                                performSearch(
                                    input.value
                                );

                            },
                            120
                        );

                }
            );


            input.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key ===
                        "Escape"
                    ) {

                        input.value =
                            "";

                        performSearch(
                            ""
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   PERFORM SEARCH
   ========================================================= */

function performSearch(query) {

    const container =
        document.querySelector("#articles-list") ||
        document.querySelector("#article-list") ||
        document.querySelector(".articles-grid") ||
        document.querySelector(".article-grid");


    if (!container) {

        return;

    }


    const articles =
        window.ElectricalArticles ||
        [];


    if (!articles.length) {

        return;

    }


    const searchText =
        String(
            query || ""
        )
            .toLowerCase()
            .trim();


    const currentCategory =
        getCurrentCategory();


    let filtered =
        articles;


    /*
       Restrict search to current category
       when viewing a category page.
    */

    if (currentCategory) {

        filtered =
            filtered.filter(
                function (article) {

                    const category =
                        article.categorySlug ||
                        getCategorySlug(
                            article.category
                        );


                    return (
                        category ===
                        currentCategory
                    );

                }
            );

    }


    /*
       Empty search:

       Restore all articles for the
       current category.
    */

    if (!searchText) {

        renderArticles(
            filtered,
            container
        );


        updateArticleCount(
            filtered
        );


        return;

    }


    /*
       Search across:

       - title
       - description
       - excerpt
       - category
       - category slug
       - keywords
       - tags
       - slug
    */

    filtered =
        filtered.filter(
            function (article) {

                const searchableText =
                    [

                        article.title,

                        article.description,

                        article.excerpt,

                        article.category,

                        article.categorySlug,

                        article.keywords,

                        article.tags,

                        article.slug

                    ]
                        .flat()
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                return searchableText.includes(
                    searchText
                );

            }
        );


    renderArticles(
        filtered,
        container
    );


    updateArticleCount(
        filtered
    );

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    /*
       Automatically set category links
       using data-category.

       Example:

       <a data-category="fundamentals">

       becomes:

       /articles/electrical-fundamentals/
    */

    document
        .querySelectorAll(
            "[data-category]"
        )
        .forEach(
            function (element) {

                const category =
                    element.dataset.category;


                if (
                    SITE_CONFIG.categories[
                        category
                    ]
                ) {

                    const path =
                        SITE_CONFIG
                            .categories[
                                category
                            ]
                            .path;


                    if (
                        element.tagName
                            .toLowerCase() ===
                        "a"
                    ) {

                        element.href =
                            path;

                    }

                }

            }
        );


    /*
       Close mobile navigation when
       an article/category link is clicked.
    */

    document
        .querySelectorAll(
            'a[href*="/articles/"]'
        )
        .forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        closeMobileMenu();

                    }
                );

            }
        );

}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function setupMobileMenu() {

    const button =
        document.querySelector(
            "#mobile-menu-button"
        );


    const sidebar =
        document.querySelector(
            "#article-sidebar"
        );


    const overlay =
        document.querySelector(
            "#sidebar-overlay"
        );


    if (
        !button ||
        !sidebar
    ) {

        return;

    }


    button.addEventListener(
        "click",
        function () {

            const isOpen =
                sidebar.classList.contains(
                    "is-open"
                );


            if (isOpen) {

                closeMobileMenu();

            } else {

                openMobileMenu();

            }

        }
    );


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeMobileMenu
        );

    }


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                closeMobileMenu();

            }

        }
    );

}


/* =========================================================
   OPEN MOBILE MENU
   ========================================================= */

function openMobileMenu() {

    const button =
        document.querySelector(
            "#mobile-menu-button"
        );


    const sidebar =
        document.querySelector(
            "#article-sidebar"
        );


    const overlay =
        document.querySelector(
            "#sidebar-overlay"
        );


    if (sidebar) {

        sidebar.classList.add(
            "is-open"
        );

    }


    if (overlay) {

        overlay.classList.add(
            "is-visible"
        );


        overlay.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    if (button) {

        button.setAttribute(
            "aria-expanded",
            "true"
        );

    }


    document.body.classList.add(
        "menu-open"
    );

}


/* =========================================================
   CLOSE MOBILE MENU
   ========================================================= */

function closeMobileMenu() {

    const button =
        document.querySelector(
            "#mobile-menu-button"
        );


    const sidebar =
        document.querySelector(
            "#article-sidebar"
        );


    const overlay =
        document.querySelector(
            "#sidebar-overlay"
        );


    if (sidebar) {

        sidebar.classList.remove(
            "is-open"
        );

    }


    if (overlay) {

        overlay.classList.remove(
            "is-visible"
        );


        overlay.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    if (button) {

        button.setAttribute(
            "aria-expanded",
            "false"
        );

    }


    document.body.classList.remove(
        "menu-open"
    );

}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function showEmptyState(
    container,
    message
) {

    container.innerHTML = `

        <div class="articles-empty">

            <span
                class="material-symbols-rounded"
                aria-hidden="true"
            >
                article
            </span>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

    return String(
        value || ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   PUBLIC API
   =========================================================

   Other scripts can use:

   ElectricalSite.loadArticles()

   ElectricalSite.search("voltage")

   ElectricalSite.openMobileMenu()

   ElectricalSite.closeMobileMenu()

   ElectricalSite.buildArticleURL(article)
   ========================================================= */

window.ElectricalSite = {

    loadArticles:
        loadArticles,

    search:
        performSearch,

    closeMobileMenu:
        closeMobileMenu,

    openMobileMenu:
        openMobileMenu,

    buildArticleURL:
        buildArticleURL

};


/* =========================================================
   END OF APP.JS
   ========================================================= */
