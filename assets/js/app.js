/* =========================================================
   ELECTRICAL ENGINEERING — MAIN APPLICATION
   electrical.prasunbarua.com

   Features:
   - Category navigation
   - Article listing
   - Search
   - Mobile navigation
   - articles.json integration
   - URL category filtering
   - Responsive UI
========================================================= */

"use strict";

/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {
    articlesFile: "/articles.json",

    selectors: {
        articleList: "#article-list",
        categoryList: "#category-list",
        searchInput: "#article-search",
        searchForm: "#search-form",
        searchClear: "#search-clear",
        categoryTitle: "#category-title",
        categoryDescription: "#category-description",
        articleCount: "#article-count",
        mobileMenuButton: "#mobile-menu-button",
        mobileMenu: "#mobile-category-menu",
        mobileMenuClose: "#mobile-menu-close",
        overlay: "#mobile-overlay",
        noResults: "#no-results",
        searchMessage: "#search-message"
    }
};


/* =========================================================
   APPLICATION STATE
========================================================= */

const AppState = {
    articles: [],
    filteredArticles: [],
    categories: [],
    activeCategory: "all",
    searchQuery: "",
    loading: true
};


/* =========================================================
   DOM CACHE
========================================================= */

const DOM = {};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    cacheDOM();

    initializeNavigation();

    initializeSearch();

    initializeMobileNavigation();

    loadArticles();

});


/* =========================================================
   CACHE DOM ELEMENTS
========================================================= */

function cacheDOM() {

    DOM.articleList =
        document.querySelector(CONFIG.selectors.articleList);

    DOM.categoryList =
        document.querySelector(CONFIG.selectors.categoryList);

    DOM.searchInput =
        document.querySelector(CONFIG.selectors.searchInput);

    DOM.searchForm =
        document.querySelector(CONFIG.selectors.searchForm);

    DOM.searchClear =
        document.querySelector(CONFIG.selectors.searchClear);

    DOM.categoryTitle =
        document.querySelector(CONFIG.selectors.categoryTitle);

    DOM.categoryDescription =
        document.querySelector(CONFIG.selectors.categoryDescription);

    DOM.articleCount =
        document.querySelector(CONFIG.selectors.articleCount);

    DOM.mobileMenuButton =
        document.querySelector(CONFIG.selectors.mobileMenuButton);

    DOM.mobileMenu =
        document.querySelector(CONFIG.selectors.mobileMenu);

    DOM.mobileMenuClose =
        document.querySelector(CONFIG.selectors.mobileMenuClose);

    DOM.overlay =
        document.querySelector(CONFIG.selectors.overlay);

    DOM.noResults =
        document.querySelector(CONFIG.selectors.noResults);

    DOM.searchMessage =
        document.querySelector(CONFIG.selectors.searchMessage);
}


/* =========================================================
   LOAD ARTICLES
========================================================= */

async function loadArticles() {

    try {

        const response = await fetch(CONFIG.articlesFile, {
            cache: "no-cache"
        });

        if (!response.ok) {
            throw new Error(
                `Unable to load articles.json (${response.status})`
            );
        }

        const data = await response.json();

        AppState.articles = normalizeArticles(data);

        AppState.categories =
            buildCategories(AppState.articles);

        AppState.loading = false;

        renderCategories();

        determineInitialCategory();

        renderArticles();

    } catch (error) {

        console.error(
            "Article loading error:",
            error
        );

        AppState.loading = false;

        showArticleError();

    }
}


/* =========================================================
   NORMALIZE ARTICLE DATA
========================================================= */

function normalizeArticles(data) {

    let articles = [];

    /*
        Supports either:

        [
            {...},
            {...}
        ]

        OR:

        {
            "articles": [
                {...}
            ]
        }
    */

    if (Array.isArray(data)) {

        articles = data;

    } else if (
        data &&
        Array.isArray(data.articles)
    ) {

        articles = data.articles;

    }

    return articles
        .filter(article => article)
        .map((article, index) => {

            const normalized = {
                id:
                    article.id ||
                    article.slug ||
                    `article-${index + 1}`,

                title:
                    article.title ||
                    "Untitled Article",

                description:
                    article.description ||
                    article.excerpt ||
                    "",

                excerpt:
                    article.excerpt ||
                    article.description ||
                    "",

                category:
                    article.category ||
                    "Uncategorized",

                categorySlug:
                    article.categorySlug ||
                    slugify(
                        article.category ||
                        "uncategorized"
                    ),

                url:
                    article.url ||
                    article.link ||
                    "#",

                image:
                    article.image ||
                    "",

                date:
                    article.date ||
                    article.published ||
                    "",

                updated:
                    article.updated ||
                    "",

                author:
                    article.author ||
                    "Prasun Barua",

                tags:
                    Array.isArray(article.tags)
                        ? article.tags
                        : [],

                featured:
                    Boolean(article.featured),

                readTime:
                    article.readTime ||
                    calculateReadTime(article.content || ""),

                content:
                    article.content ||
                    ""
            };

            return normalized;

        });

}


/* =========================================================
   BUILD CATEGORY LIST
========================================================= */

function buildCategories(articles) {

    const categoryMap = new Map();

    articles.forEach(article => {

        const name =
            article.category ||
            "Uncategorized";

        const slug =
            article.categorySlug ||
            slugify(name);

        if (!categoryMap.has(slug)) {

            categoryMap.set(slug, {
                name,
                slug,
                count: 0
            });

        }

        categoryMap.get(slug).count++;

    });

    return Array.from(
        categoryMap.values()
    ).sort((a, b) =>
        a.name.localeCompare(b.name)
    );

}


/* =========================================================
   RENDER CATEGORIES
========================================================= */

function renderCategories() {

    if (!DOM.categoryList) {
        return;
    }

    const allCount =
        AppState.articles.length;

    let html = `
        <li>
            <a
                href="/"
                class="category-link ${
                    AppState.activeCategory === "all"
                        ? "active"
                        : ""
                }"
                data-category="all"
            >
                <span class="category-name">
                    All Articles
                </span>

                <span class="category-count">
                    ${allCount}
                </span>
            </a>
        </li>
    `;

    AppState.categories.forEach(category => {

        html += `
            <li>
                <a
                    href="?category=${encodeURIComponent(category.slug)}"
                    class="category-link ${
                        AppState.activeCategory === category.slug
                            ? "active"
                            : ""
                    }"
                    data-category="${escapeHTML(category.slug)}"
                >
                    <span class="category-name">
                        ${escapeHTML(category.name)}
                    </span>

                    <span class="category-count">
                        ${category.count}
                    </span>
                </a>
            </li>
        `;

    });

    DOM.categoryList.innerHTML = html;

    attachCategoryEvents();

}


/* =========================================================
   CATEGORY EVENTS
========================================================= */

function attachCategoryEvents() {

    const links =
        DOM.categoryList.querySelectorAll(
            ".category-link"
        );

    links.forEach(link => {

        link.addEventListener(
            "click",
            event => {

                event.preventDefault();

                const category =
                    link.dataset.category;

                setCategory(category);

                closeMobileMenu();

            }
        );

    });

}


/* =========================================================
   DETERMINE INITIAL CATEGORY
========================================================= */

function determineInitialCategory() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const requestedCategory =
        params.get("category");

    if (
        requestedCategory &&
        AppState.categories.some(
            category =>
                category.slug === requestedCategory
        )
    ) {

        AppState.activeCategory =
            requestedCategory;

    } else {

        AppState.activeCategory =
            "all";

    }

}


/* =========================================================
   SET CATEGORY
========================================================= */

function setCategory(category) {

    AppState.activeCategory =
        category || "all";

    AppState.searchQuery = "";

    if (DOM.searchInput) {
        DOM.searchInput.value = "";
    }

    updateURL();

    renderCategories();

    renderArticles();

    updateCategoryHeader();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   UPDATE URL
========================================================= */

function updateURL() {

    const url =
        new URL(
            window.location.href
        );

    if (
        AppState.activeCategory === "all"
    ) {

        url.searchParams.delete(
            "category"
        );

    } else {

        url.searchParams.set(
            "category",
            AppState.activeCategory
        );

    }

    if (AppState.searchQuery) {

        url.searchParams.set(
            "q",
            AppState.searchQuery
        );

    } else {

        url.searchParams.delete("q");

    }

    window.history.pushState(
        {},
        "",
        url
    );

}


/* =========================================================
   RENDER ARTICLES
========================================================= */

function renderArticles() {

    if (!DOM.articleList) {
        return;
    }

    let articles =
        [...AppState.articles];

    /* CATEGORY FILTER */

    if (
        AppState.activeCategory !== "all"
    ) {

        articles =
            articles.filter(
                article =>
                    article.categorySlug ===
                    AppState.activeCategory
            );

    }


    /* SEARCH FILTER */

    if (AppState.searchQuery) {

        const query =
            AppState.searchQuery
                .toLowerCase()
                .trim();

        articles =
            articles.filter(article => {

                const searchableText = [

                    article.title,

                    article.description,

                    article.excerpt,

                    article.category,

                    article.author,

                    ...(article.tags || [])

                ]
                    .join(" ")
                    .toLowerCase();

                return searchableText.includes(
                    query
                );

            });

    }


    /* SORT ARTICLES */

    articles.sort(
        sortArticles
    );


    AppState.filteredArticles =
        articles;


    /* UPDATE COUNT */

    updateArticleCount(
        articles.length
    );


    /* UPDATE HEADER */

    updateCategoryHeader();


    /* NO RESULTS */

    if (!articles.length) {

        showNoResults();

        return;

    }


    hideNoResults();


    /* RENDER */

    DOM.articleList.innerHTML =
        articles
            .map(createArticleCard)
            .join("");


    attachArticleInteractions();

}


/* =========================================================
   SORT ARTICLES
========================================================= */

function sortArticles(a, b) {

    /*
        Featured articles first
    */

    if (
        a.featured &&
        !b.featured
    ) {
        return -1;
    }

    if (
        !a.featured &&
        b.featured
    ) {
        return 1;
    }


    /*
        Newest dates first
    */

    if (a.date && b.date) {

        const dateA =
            new Date(a.date);

        const dateB =
            new Date(b.date);

        if (
            !Number.isNaN(dateA) &&
            !Number.isNaN(dateB)
        ) {

            return dateB - dateA;

        }

    }


    /*
        Alphabetical fallback
    */

    return a.title.localeCompare(
        b.title
    );

}


/* =========================================================
   CREATE ARTICLE CARD
========================================================= */

function createArticleCard(article) {

    const imageHTML =
        article.image
            ? `
                <div class="article-card-image">
                    <img
                        src="${escapeAttribute(article.image)}"
                        alt="${escapeAttribute(article.title)}"
                        loading="lazy"
                        decoding="async"
                    >
                </div>
            `
            : "";


    const dateHTML =
        article.date
            ? `
                <time datetime="${escapeAttribute(article.date)}">
                    ${formatDate(article.date)}
                </time>
            `
            : "";


    const readTimeHTML =
        article.readTime
            ? `
                <span>
                    ${escapeHTML(
                        String(article.readTime)
                    )}
                </span>
            `
            : "";


    return `
        <article
            class="article-list-card"
            data-article-id="${escapeAttribute(article.id)}"
        >

            ${imageHTML}

            <div class="article-card-content">

                <div class="article-card-meta">

                    <span class="article-category">
                        ${escapeHTML(article.category)}
                    </span>

                    ${
                        dateHTML
                            ? `<span class="meta-separator">•</span>${dateHTML}`
                            : ""
                    }

                    ${
                        readTimeHTML
                            ? `<span class="meta-separator">•</span>${readTimeHTML}`
                            : ""
                    }

                </div>


                <h2 class="article-card-title">

                    <a href="${escapeAttribute(article.url)}">
                        ${escapeHTML(article.title)}
                    </a>

                </h2>


                ${
                    article.excerpt
                        ? `
                            <p class="article-card-excerpt">
                                ${escapeHTML(article.excerpt)}
                            </p>
                        `
                        : ""
                }


                <a
                    class="article-read-more"
                    href="${escapeAttribute(article.url)}"
                >
                    Read article

                    <span
                        class="material-symbols-rounded"
                        aria-hidden="true"
                    >
                        arrow_forward
                    </span>

                </a>

            </div>

        </article>
    `;

}


/* =========================================================
   ARTICLE INTERACTIONS
========================================================= */

function attachArticleInteractions() {

    const images =
        DOM.articleList.querySelectorAll(
            ".article-card-image img"
        );

    images.forEach(image => {

        image.addEventListener(
            "error",
            () => {

                const container =
                    image.closest(
                        ".article-card-image"
                    );

                if (container) {
                    container.remove();
                }

            }
        );

    });

}


/* =========================================================
   CATEGORY HEADER
========================================================= */

function updateCategoryHeader() {

    if (!DOM.categoryTitle) {
        return;
    }


    if (AppState.searchQuery) {

        DOM.categoryTitle.textContent =
            "Search results";

        if (DOM.categoryDescription) {

            DOM.categoryDescription.textContent =
                `Articles matching “${AppState.searchQuery}”`;

        }

        return;

    }


    if (
        AppState.activeCategory === "all"
    ) {

        DOM.categoryTitle.textContent =
            "All Articles";

        if (DOM.categoryDescription) {

            DOM.categoryDescription.textContent =
                "Browse practical electrical engineering tutorials, calculations, guides, and resources.";

        }

        return;

    }


    const category =
        AppState.categories.find(
            item =>
                item.slug ===
                AppState.activeCategory
        );


    if (category) {

        DOM.categoryTitle.textContent =
            category.name;

        if (DOM.categoryDescription) {

            DOM.categoryDescription.textContent =
                getCategoryDescription(
                    category.slug
                );

        }

    }

}


/* =========================================================
   CATEGORY DESCRIPTIONS
========================================================= */

function getCategoryDescription(slug) {

    const descriptions = {

        "electrical-fundamentals":
            "Learn the essential principles of voltage, current, resistance, power, energy, AC, DC, and basic electrical circuits.",

        "electrical-calculations":
            "Practical electrical formulas, calculations, worked examples, and engineering methods.",

        "power-systems":
            "Explore transformers, distribution systems, power factor, protection, switchgear, and electrical grid concepts.",

        "solar-pv":
            "Practical solar PV engineering covering system design, PV strings, inverters, losses, performance, and calculations.",

        "electrical-design":
            "Learn practical electrical design methods including cables, protection, earthing, distribution, and voltage drop.",

        "testing-commissioning":
            "Electrical testing, inspection, commissioning procedures, troubleshooting, and practical field methods."

    };

    return (
        descriptions[slug] ||
        "Explore practical electrical engineering articles and technical resources."
    );

}


/* =========================================================
   ARTICLE COUNT
========================================================= */

function updateArticleCount(count) {

    if (!DOM.articleCount) {
        return;
    }

    DOM.articleCount.textContent =
        `${count} ${
            count === 1
                ? "article"
                : "articles"
        }`;

}


/* =========================================================
   SEARCH
========================================================= */

function initializeSearch() {

    if (!DOM.searchInput) {
        return;
    }


    /*
        Restore search query from URL
    */

    const params =
        new URLSearchParams(
            window.location.search
        );

    const query =
        params.get("q");

    if (query) {

        AppState.searchQuery =
            query;

        DOM.searchInput.value =
            query;

    }


    /*
        Live search
    */

    DOM.searchInput.addEventListener(
        "input",
        () => {

            AppState.searchQuery =
                DOM.searchInput.value
                    .trim();

            updateURL();

            renderArticles();

            updateSearchButton();

        }
    );


    /*
        Form submit
    */

    if (DOM.searchForm) {

        DOM.searchForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                AppState.searchQuery =
                    DOM.searchInput.value
                        .trim();

                updateURL();

                renderArticles();

                updateSearchButton();

            }
        );

    }


    /*
        Clear button
    */

    if (DOM.searchClear) {

        DOM.searchClear.addEventListener(
            "click",
            clearSearch
        );

    }


    updateSearchButton();

}


/* =========================================================
   CLEAR SEARCH
========================================================= */

function clearSearch() {

    AppState.searchQuery = "";

    if (DOM.searchInput) {
        DOM.searchInput.value = "";
        DOM.searchInput.focus();
    }

    updateURL();

    renderArticles();

    updateSearchButton();

}


/* =========================================================
   SEARCH BUTTON STATE
========================================================= */

function updateSearchButton() {

    if (!DOM.searchClear) {
        return;
    }

    if (
        AppState.searchQuery
    ) {

        DOM.searchClear.hidden =
            false;

    } else {

        DOM.searchClear.hidden =
            true;

    }

}


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

function initializeMobileNavigation() {

    if (DOM.mobileMenuButton) {

        DOM.mobileMenuButton.addEventListener(
            "click",
            openMobileMenu
        );

    }


    if (DOM.mobileMenuClose) {

        DOM.mobileMenuClose.addEventListener(
            "click",
            closeMobileMenu
        );

    }


    if (DOM.overlay) {

        DOM.overlay.addEventListener(
            "click",
            closeMobileMenu
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
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

    if (DOM.mobileMenu) {

        DOM.mobileMenu.classList.add(
            "is-open"
        );

    }

    if (DOM.overlay) {

        DOM.overlay.classList.add(
            "is-visible"
        );

    }

    document.body.classList.add(
        "menu-open"
    );


    if (DOM.mobileMenuButton) {

        DOM.mobileMenuButton.setAttribute(
            "aria-expanded",
            "true"
        );

    }

}


/* =========================================================
   CLOSE MOBILE MENU
========================================================= */

function closeMobileMenu() {

    if (DOM.mobileMenu) {

        DOM.mobileMenu.classList.remove(
            "is-open"
        );

    }

    if (DOM.overlay) {

        DOM.overlay.classList.remove(
            "is-visible"
        );

    }

    document.body.classList.remove(
        "menu-open"
    );


    if (DOM.mobileMenuButton) {

        DOM.mobileMenuButton.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


/* =========================================================
   SHOW NO RESULTS
========================================================= */

function showNoResults() {

    if (DOM.articleList) {

        DOM.articleList.innerHTML = "";

    }

    if (DOM.noResults) {

        DOM.noResults.hidden =
            false;

    }

    if (DOM.searchMessage) {

        if (AppState.searchQuery) {

            DOM.searchMessage.textContent =
                `No articles found for “${AppState.searchQuery}”.`;

        } else {

            DOM.searchMessage.textContent =
                "There are currently no articles in this category.";

        }

    }

}


/* =========================================================
   HIDE NO RESULTS
========================================================= */

function hideNoResults() {

    if (DOM.noResults) {

        DOM.noResults.hidden =
            true;

    }

    if (DOM.searchMessage) {

        DOM.searchMessage.textContent =
            "";

    }

}


/* =========================================================
   SHOW ARTICLE ERROR
========================================================= */

function showArticleError() {

    if (!DOM.articleList) {
        return;
    }

    DOM.articleList.innerHTML = `
        <div class="article-error">

            <span
                class="material-symbols-rounded"
                aria-hidden="true"
            >
                error
            </span>

            <h2>
                Articles could not be loaded
            </h2>

            <p>
                Please try refreshing the page.
            </p>

            <button
                type="button"
                onclick="window.location.reload()"
            >
                Reload page
            </button>

        </div>
    `;

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(dateString);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }

    return new Intl.DateTimeFormat(
        "en",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    ).format(date);

}


/* =========================================================
   CALCULATE READ TIME
========================================================= */

function calculateReadTime(content) {

    if (!content) {
        return "";
    }

    const words =
        content
            .trim()
            .split(/\s+/)
            .length;

    const minutes =
        Math.max(
            1,
            Math.ceil(words / 200)
        );

    return `${minutes} min read`;

}


/* =========================================================
   SLUGIFY
========================================================= */

function slugify(value) {

    return String(value)
        .toLowerCase()
        .trim()
        .replace(/['"]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

}


/* =========================================================
   HTML ESCAPING
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   ATTRIBUTE ESCAPING
========================================================= */

function escapeAttribute(value) {

    return escapeHTML(value);

}


/* =========================================================
   BROWSER BACK / FORWARD
========================================================= */

window.addEventListener(
    "popstate",
    () => {

        const params =
            new URLSearchParams(
                window.location.search
            );

        const category =
            params.get("category");

        const query =
            params.get("q");


        if (
            category &&
            AppState.categories.some(
                item =>
                    item.slug === category
            )
        ) {

            AppState.activeCategory =
                category;

        } else {

            AppState.activeCategory =
                "all";

        }


        AppState.searchQuery =
            query || "";


        if (DOM.searchInput) {

            DOM.searchInput.value =
                AppState.searchQuery;

        }


        renderCategories();

        renderArticles();

        updateSearchButton();

    }
);


/* =========================================================
   GLOBAL API
   Useful if you later want buttons elsewhere
========================================================= */

window.ElectricalEngineering = {

    setCategory,

    clearSearch,

    openMobileMenu,

    closeMobileMenu,

    getArticles: () =>
        [...AppState.articles],

    getCurrentCategory: () =>
        AppState.activeCategory,

    getSearchQuery: () =>
        AppState.searchQuery

};


/* =========================================================
   END
========================================================= */
