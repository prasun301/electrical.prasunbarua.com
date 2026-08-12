/* =========================================================
   ELECTRICAL ENGINEERING — SITE APP
   electrical.prasunbarua.com

   Purpose:
   - Load articles from articles.json
   - Build category navigation
   - Display article lists
   - Search articles
   - Filter by category
   - Support mobile navigation
   - Keep the interface lightweight
   ========================================================= */

"use strict";

/* =========================================================
   CONFIGURATION
   ========================================================= */

const SITE_CONFIG = {
    articlesFile: "/articles.json",

    selectors: {
        categoryList: "#category-list",
        articleList: "#article-list",
        searchInput: "#site-search",
        searchForm: "#site-search-form",
        searchMessage: "#search-message",
        mobileMenuButton: "#mobile-menu-button",
        sidebar: ".site-sidebar",
        sidebarOverlay: "#sidebar-overlay"
    }
};


/* =========================================================
   GLOBAL STATE
   ========================================================= */

let allArticles = [];
let currentCategory = "all";
let currentSearch = "";


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initializeSite();
});


/* =========================================================
   INITIALIZE SITE
   ========================================================= */

async function initializeSite() {

    setupMobileNavigation();
    setupSearch();

    try {
        await loadArticles();
    } catch (error) {
        console.error("Unable to initialize article system:", error);
        showArticleError();
    }

}


/* =========================================================
   LOAD ARTICLES.JSON
   ========================================================= */

async function loadArticles() {

    const response = await fetch(SITE_CONFIG.articlesFile, {
        cache: "no-cache"
    });

    if (!response.ok) {
        throw new Error(
            `Unable to load articles.json (${response.status})`
        );
    }

    const data = await response.json();

    /*
     * Support both:
     *
     * [
     *   {...},
     *   {...}
     * ]
     *
     * and:
     *
     * {
     *   "articles": [...]
     * }
     */

    if (Array.isArray(data)) {
        allArticles = data;
    } else if (Array.isArray(data.articles)) {
        allArticles = data.articles;
    } else {
        throw new Error("Invalid articles.json format.");
    }

    normalizeArticles();

    renderCategories();
    renderArticles();

    updateArticleCount();

}


/* =========================================================
   NORMALIZE ARTICLE DATA
   ========================================================= */

function normalizeArticles() {

    allArticles = allArticles.map((article, index) => {

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

            category:
                article.category ||
                "Uncategorized",

            categorySlug:
                article.categorySlug ||
                slugify(article.category || "uncategorized"),

            url:
                article.url ||
                article.path ||
                "#",

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

            image:
                article.image ||
                "",

            tags:
                Array.isArray(article.tags)
                    ? article.tags
                    : [],

            featured:
                article.featured === true

        };

        return normalized;

    });

}


/* =========================================================
   CREATE CATEGORY LIST
   ========================================================= */

function renderCategories() {

    const categoryContainer =
        document.querySelector(
            SITE_CONFIG.selectors.categoryList
        );

    if (!categoryContainer) {
        return;
    }

    /*
     * Build category map.
     */

    const categories = {};

    allArticles.forEach(article => {

        const name = article.category || "Uncategorized";
        const slug = article.categorySlug || slugify(name);

        if (!categories[slug]) {

            categories[slug] = {
                name: name,
                slug: slug,
                count: 0
            };

        }

        categories[slug].count++;

    });


    /*
     * Sort categories alphabetically.
     */

    const sortedCategories =
        Object.values(categories).sort((a, b) =>
            a.name.localeCompare(b.name)
        );


    /*
     * Clear existing content.
     */

    categoryContainer.innerHTML = "";


    /*
     * ALL ARTICLES
     */

    const allItem =
        document.createElement("li");

    allItem.className =
        currentCategory === "all"
            ? "active"
            : "";

    allItem.innerHTML = `
        <button
            type="button"
            class="category-link"
            data-category="all"
            aria-current="${currentCategory === "all" ? "page" : "false"}"
        >
            <span class="category-name">
                All Articles
            </span>

            <span class="category-count">
                ${allArticles.length}
            </span>
        </button>
    `;

    categoryContainer.appendChild(allItem);


    /*
     * CATEGORY ITEMS
     */

    sortedCategories.forEach(category => {

        const li =
            document.createElement("li");

        li.className =
            currentCategory === category.slug
                ? "active"
                : "";

        li.innerHTML = `
            <button
                type="button"
                class="category-link"
                data-category="${escapeAttribute(category.slug)}"
                aria-current="${
                    currentCategory === category.slug
                        ? "page"
                        : "false"
                }"
            >
                <span class="category-name">
                    ${escapeHTML(category.name)}
                </span>

                <span class="category-count">
                    ${category.count}
                </span>
            </button>
        `;

        categoryContainer.appendChild(li);

    });


    /*
     * CATEGORY CLICK EVENTS
     */

    categoryContainer
        .querySelectorAll(".category-link")
        .forEach(button => {

            button.addEventListener("click", () => {

                const category =
                    button.dataset.category;

                setCategory(category);

                closeMobileSidebar();

            });

        });

}


/* =========================================================
   SET CATEGORY
   ========================================================= */

function setCategory(category) {

    currentCategory =
        category || "all";

    renderCategories();
    renderArticles();

    updateArticleCount();

    /*
     * Update URL without page reload.
     */

    const url =
        new URL(window.location.href);

    if (currentCategory === "all") {
        url.searchParams.delete("category");
    } else {
        url.searchParams.set(
            "category",
            currentCategory
        );
    }

    if (currentSearch) {
        url.searchParams.set(
            "q",
            currentSearch
        );
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

    const articleContainer =
        document.querySelector(
            SITE_CONFIG.selectors.articleList
        );

    if (!articleContainer) {
        return;
    }


    /*
     * Filter articles.
     */

    let filtered =
        [...allArticles];


    /*
     * Category filtering.
     */

    if (currentCategory !== "all") {

        filtered =
            filtered.filter(article =>
                article.categorySlug === currentCategory
            );

    }


    /*
     * Search filtering.
     */

    if (currentSearch.trim() !== "") {

        const query =
            currentSearch
                .trim()
                .toLowerCase();

        filtered =
            filtered.filter(article => {

                const searchableText = [

                    article.title,

                    article.description,

                    article.category,

                    article.author,

                    ...(article.tags || [])

                ]
                    .join(" ")
                    .toLowerCase();

                return searchableText.includes(query);

            });

    }


    /*
     * Sort newest first when dates exist.
     */

    filtered.sort((a, b) => {

        const dateA =
            parseArticleDate(a.date);

        const dateB =
            parseArticleDate(b.date);

        return dateB - dateA;

    });


    /*
     * Empty state.
     */

    if (filtered.length === 0) {

        articleContainer.innerHTML = `
            <div class="article-empty">

                <span
                    class="material-symbols-rounded"
                    aria-hidden="true"
                >
                    search_off
                </span>

                <h2>
                    No articles found
                </h2>

                <p>
                    Try another search term or choose
                    a different category.
                </p>

                <button
                    type="button"
                    class="reset-search"
                    id="reset-search"
                >
                    Show all articles
                </button>

            </div>
        `;


        const resetButton =
            document.querySelector(
                "#reset-search"
            );

        if (resetButton) {

            resetButton.addEventListener(
                "click",
                resetFilters
            );

        }

        return;
    }


    /*
     * Build article cards.
     */

    articleContainer.innerHTML =
        filtered
            .map(article =>
                createArticleCard(article)
            )
            .join("");


    /*
     * Update result message.
     */

    updateSearchMessage(
        filtered.length
    );

}


/* =========================================================
   CREATE ARTICLE CARD
   ========================================================= */

function createArticleCard(article) {

    const dateHTML =
        article.date
            ? `
                <time datetime="${escapeAttribute(article.date)}">
                    ${formatDate(article.date)}
                </time>
              `
            : "";


    const categoryHTML =
        article.category
            ? `
                <span class="article-card-category">
                    ${escapeHTML(article.category)}
                </span>
              `
            : "";


    const descriptionHTML =
        article.description
            ? `
                <p class="article-card-description">
                    ${escapeHTML(article.description)}
                </p>
              `
            : "";


    return `
        <article
            class="article-list-item"
            data-category="${escapeAttribute(article.categorySlug)}"
        >

            <div class="article-list-content">

                ${categoryHTML}

                <h2 class="article-card-title">
                    <a href="${escapeAttribute(article.url)}">
                        ${escapeHTML(article.title)}
                    </a>
                </h2>

                ${descriptionHTML}

                <div class="article-card-meta">

                    ${dateHTML}

                    ${
                        article.date && article.author
                            ? `<span aria-hidden="true">·</span>`
                            : ""
                    }

                    ${
                        article.author
                            ? `
                                <span>
                                    ${escapeHTML(article.author)}
                                </span>
                              `
                            : ""
                    }

                </div>

            </div>

            <a
                class="article-read-link"
                href="${escapeAttribute(article.url)}"
                aria-label="Read ${escapeAttribute(article.title)}"
            >
                <span class="material-symbols-rounded" aria-hidden="true">
                    arrow_forward
                </span>
            </a>

        </article>
    `;

}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {

    const form =
        document.querySelector(
            SITE_CONFIG.selectors.searchForm
        );

    const input =
        document.querySelector(
            SITE_CONFIG.selectors.searchInput
        );


    if (!form || !input) {
        return;
    }


    /*
     * Search submit.
     */

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            currentSearch =
                input.value.trim();

            renderArticles();

            updateArticleCount();

            updateURL();

        }
    );


    /*
     * Live search.
     */

    let searchTimer;

    input.addEventListener(
        "input",
        () => {

            clearTimeout(searchTimer);

            searchTimer =
                setTimeout(() => {

                    currentSearch =
                        input.value.trim();

                    renderArticles();

                    updateArticleCount();

                }, 180);

        }
    );


    /*
     * Escape key clears search.
     */

    input.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                input.value = "";

                currentSearch = "";

                renderArticles();

                updateArticleCount();

                updateURL();

            }

        }
    );


    /*
     * Load search query from URL.
     */

    const params =
        new URLSearchParams(
            window.location.search
        );

    const query =
        params.get("q");

    if (query) {

        currentSearch = query;

        input.value = query;

    }

}


/* =========================================================
   UPDATE URL
   ========================================================= */

function updateURL() {

    const url =
        new URL(window.location.href);


    if (currentSearch) {

        url.searchParams.set(
            "q",
            currentSearch
        );

    } else {

        url.searchParams.delete("q");

    }


    if (currentCategory !== "all") {

        url.searchParams.set(
            "category",
            currentCategory
        );

    } else {

        url.searchParams.delete(
            "category"
        );

    }


    window.history.replaceState(
        {},
        "",
        url
    );

}


/* =========================================================
   READ CATEGORY FROM URL
   ========================================================= */

function loadCategoryFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const category =
        params.get("category");

    if (category) {

        currentCategory =
            category;

    }

}


/* =========================================================
   ARTICLE COUNT
   ========================================================= */

function updateArticleCount() {

    const countElements =
        document.querySelectorAll(
            "[data-article-count]"
        );

    let count =
        allArticles.length;


    if (currentCategory !== "all") {

        count =
            allArticles.filter(article =>
                article.categorySlug === currentCategory
            ).length;

    }


    if (currentSearch) {

        const query =
            currentSearch
                .toLowerCase()
                .trim();

        count =
            allArticles.filter(article => {

                const categoryMatch =
                    currentCategory === "all" ||
                    article.categorySlug === currentCategory;

                if (!categoryMatch) {
                    return false;
                }

                const text = [

                    article.title,
                    article.description,
                    article.category,
                    ...(article.tags || [])

                ]
                    .join(" ")
                    .toLowerCase();

                return text.includes(query);

            }).length;

    }


    countElements.forEach(element => {

        element.textContent =
            count;

    });

}


/* =========================================================
   SEARCH MESSAGE
   ========================================================= */

function updateSearchMessage(count) {

    const message =
        document.querySelector(
            SITE_CONFIG.selectors.searchMessage
        );

    if (!message) {
        return;
    }


    if (!currentSearch) {

        message.textContent = "";

        return;

    }


    message.textContent =
        `${count} ${
            count === 1
                ? "article"
                : "articles"
        } found for “${currentSearch}”`;

}


/* =========================================================
   RESET FILTERS
   ========================================================= */

function resetFilters() {

    currentCategory = "all";
    currentSearch = "";


    const input =
        document.querySelector(
            SITE_CONFIG.selectors.searchInput
        );

    if (input) {
        input.value = "";
    }


    renderCategories();
    renderArticles();

    updateArticleCount();
    updateURL();

}


/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

function setupMobileNavigation() {

    const menuButton =
        document.querySelector(
            SITE_CONFIG.selectors.mobileMenuButton
        );

    const sidebar =
        document.querySelector(
            SITE_CONFIG.selectors.sidebar
        );

    const overlay =
        document.querySelector(
            SITE_CONFIG.selectors.sidebarOverlay
        );


    if (!menuButton || !sidebar) {
        return;
    }


    menuButton.addEventListener(
        "click",
        () => {

            const isOpen =
                sidebar.classList.contains(
                    "is-open"
                );

            if (isOpen) {
                closeMobileSidebar();
            } else {
                openMobileSidebar();
            }

        }
    );


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeMobileSidebar
        );

    }


    /*
     * Close sidebar when clicking a normal link.
     */

    sidebar
        .querySelectorAll("a")
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {
                    closeMobileSidebar();
                }
            );

        });


    /*
     * Escape key.
     */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                sidebar.classList.contains("is-open")
            ) {

                closeMobileSidebar();

            }

        }
    );

}


/* =========================================================
   OPEN MOBILE SIDEBAR
   ========================================================= */

function openMobileSidebar() {

    const sidebar =
        document.querySelector(
            SITE_CONFIG.selectors.sidebar
        );

    const overlay =
        document.querySelector(
            SITE_CONFIG.selectors.sidebarOverlay
        );

    const menuButton =
        document.querySelector(
            SITE_CONFIG.selectors.mobileMenuButton
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

    }


    if (menuButton) {

        menuButton.setAttribute(
            "aria-expanded",
            "true"
        );

    }


    document.body.classList.add(
        "menu-open"
    );

}


/* =========================================================
   CLOSE MOBILE SIDEBAR
   ========================================================= */

function closeMobileSidebar() {

    const sidebar =
        document.querySelector(
            SITE_CONFIG.selectors.sidebar
        );

    const overlay =
        document.querySelector(
            SITE_CONFIG.selectors.sidebarOverlay
        );

    const menuButton =
        document.querySelector(
            SITE_CONFIG.selectors.mobileMenuButton
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

    }


    if (menuButton) {

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

    }


    document.body.classList.remove(
        "menu-open"
    );

}


/* =========================================================
   DATE HELPERS
   ========================================================= */

function parseArticleDate(dateString) {

    if (!dateString) {
        return 0;
    }

    const timestamp =
        Date.parse(dateString);

    return Number.isNaN(timestamp)
        ? 0
        : timestamp;

}


function formatDate(dateString) {

    const timestamp =
        parseArticleDate(dateString);

    if (!timestamp) {
        return dateString;
    }


    return new Intl.DateTimeFormat(
        "en",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    ).format(
        new Date(timestamp)
    );

}


/* =========================================================
   SLUGIFY
   ========================================================= */

function slugify(value) {

    return String(value)
        .toLowerCase()
        .trim()
        .replace(
            /[^\w\s-]/g,
            ""
        )
        .replace(
            /\s+/g,
            "-"
        )
        .replace(
            /--+/g,
            "-"
        );

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


function escapeAttribute(value) {

    return escapeHTML(value);

}


/* =========================================================
   ARTICLE ERROR
   ========================================================= */

function showArticleError() {

    const articleContainer =
        document.querySelector(
            SITE_CONFIG.selectors.articleList
        );

    if (!articleContainer) {
        return;
    }


    articleContainer.innerHTML = `
        <div class="article-empty article-error">

            <span
                class="material-symbols-rounded"
                aria-hidden="true"
            >
                error_outline
            </span>

            <h2>
                Articles could not be loaded
            </h2>

            <p>
                Please try refreshing the page.
            </p>

            <button
                type="button"
                class="reset-search"
                onclick="window.location.reload()"
            >
                Refresh page
            </button>

        </div>
    `;

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

        currentCategory =
            params.get("category") || "all";

        currentSearch =
            params.get("q") || "";


        const input =
            document.querySelector(
                SITE_CONFIG.selectors.searchInput
            );

        if (input) {
            input.value =
                currentSearch;
        }


        renderCategories();
        renderArticles();
        updateArticleCount();

    }
);


/* =========================================================
   INITIAL URL STATE
   ========================================================= */

loadCategoryFromURL();


/* =========================================================
   EXPOSE OPTIONAL FUNCTIONS
   ========================================================= */

window.ElectricalSite = {

    getArticles: () => [...allArticles],

    getCurrentCategory: () =>
        currentCategory,

    getCurrentSearch: () =>
        currentSearch,

    setCategory,

    resetFilters,

    openMobileSidebar,

    closeMobileSidebar

};
