/* =========================================================
   ELECTRICAL ENGINEERING — SITE APPLICATION
   electrical.prasunbarua.com

   Main responsibilities:
   - Load articles.json
   - Build article/category navigation
   - Search articles
   - Category filtering
   - Mobile sidebar
   - Responsive navigation
   - Clean blog-style experience
   ========================================================= */

"use strict";

/* =========================================================
   GLOBAL CONFIGURATION
   ========================================================= */

const SITE_CONFIG = {
    articlesUrl: "/articles.json",

    selectors: {
        searchInput: "#site-search",
        searchForm: "#site-search-form",
        searchMessage: "#search-message",

        categoryList: "#category-list",
        articleList: "#article-list",
        articleCount: "#article-count",

        mobileMenuButton: "#mobile-menu-button",
        sidebar: ".site-sidebar",
        sidebarOverlay: "#sidebar-overlay",

        categoryLinks: "[data-category]",
        searchResults: "#search-results"
    }
};


/* =========================================================
   APPLICATION STATE
   ========================================================= */

const AppState = {
    articles: [],
    categories: [],
    activeCategory: "all",
    searchQuery: "",
    initialized: false
};


/* =========================================================
   DOM HELPERS
   ========================================================= */

function $(selector, parent = document) {
    return parent.querySelector(selector);
}

function $$(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initializeSite();
});


async function initializeSite() {

    if (AppState.initialized) {
        return;
    }

    AppState.initialized = true;

    setupMobileNavigation();
    setupSearch();

    await loadArticles();

    setupCategoryNavigation();
    initializeFromURL();
});


/* =========================================================
   LOAD ARTICLES.JSON
   ========================================================= */

async function loadArticles() {

    try {

        const response = await fetch(
            SITE_CONFIG.articlesUrl,
            {
                method: "GET",
                cache: "no-cache",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                `Unable to load articles.json (${response.status})`
            );
        }

        const data = await response.json();

        /*
         Accept either:

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

            AppState.articles = data;

        } else if (
            data &&
            Array.isArray(data.articles)
        ) {

            AppState.articles = data.articles;

        } else {

            throw new Error(
                "articles.json does not contain a valid article array."
            );
        }

        normalizeArticles();

        buildCategories();

        renderCategories();

        renderArticles();

    } catch (error) {

        console.error(
            "Electrical Engineering site:",
            error
        );

        showArticleLoadError();
    }
}


/* =========================================================
   NORMALIZE ARTICLE DATA
   ========================================================= */

function normalizeArticles() {

    AppState.articles = AppState.articles
        .filter(article => article && typeof article === "object")
        .map((article, index) => {

            const title =
                article.title ||
                article.name ||
                "Untitled Article";

            const description =
                article.description ||
                article.excerpt ||
                article.summary ||
                "";

            const category =
                article.category ||
                article.categoryName ||
                "Electrical Engineering";

            const url =
                article.url ||
                article.link ||
                article.path ||
                "#";

            const date =
                article.date ||
                article.published ||
                article.publishedDate ||
                "";

            const image =
                article.image ||
                article.thumbnail ||
                "";

            const tags =
                Array.isArray(article.tags)
                    ? article.tags
                    : [];

            return {

                ...article,

                id:
                    article.id ||
                    slugify(title) ||
                    `article-${index + 1}`,

                title: String(title),

                description:
                    String(description),

                category:
                    String(category),

                url:
                    String(url),

                date:
                    String(date),

                image:
                    String(image),

                tags
            };
        });
}


/* =========================================================
   BUILD CATEGORY LIST
   ========================================================= */

function buildCategories() {

    const categoryMap = new Map();

    AppState.articles.forEach(article => {

        const category =
            article.category.trim();

        if (!category) {
            return;
        }

        const key =
            category.toLowerCase();

        if (!categoryMap.has(key)) {

            categoryMap.set(
                key,
                {
                    name: category,
                    count: 0
                }
            );
        }

        categoryMap.get(key).count++;
    });

    AppState.categories =
        Array.from(categoryMap.values())
            .sort((a, b) =>
                a.name.localeCompare(
                    b.name
                )
            );
}


/* =========================================================
   RENDER CATEGORY SIDEBAR
   ========================================================= */

function renderCategories() {

    const categoryList =
        $(SITE_CONFIG.selectors.categoryList);

    if (!categoryList) {
        return;
    }

    categoryList.innerHTML = "";

    /*
     ALL ARTICLES
    */

    const allItem =
        document.createElement("li");

    allItem.innerHTML = `
        <a
            href="#"
            class="category-link active"
            data-category="all"
            aria-current="page"
        >
            <span>All Articles</span>
            <span class="category-count">
                ${AppState.articles.length}
            </span>
        </a>
    `;

    categoryList.appendChild(allItem);


    /*
     CATEGORIES
    */

    AppState.categories.forEach(category => {

        const item =
            document.createElement("li");

        item.innerHTML = `
            <a
                href="#"
                class="category-link"
                data-category="${escapeAttribute(category.name)}"
            >
                <span>${escapeHTML(category.name)}</span>
                <span class="category-count">
                    ${category.count}
                </span>
            </a>
        `;

        categoryList.appendChild(item);
    });

    updateCategoryActiveState();
}


/* =========================================================
   CATEGORY NAVIGATION
   ========================================================= */

function setupCategoryNavigation() {

    const categoryList =
        $(SITE_CONFIG.selectors.categoryList);

    if (!categoryList) {
        return;
    }

    categoryList.addEventListener(
        "click",
        event => {

            const link =
                event.target.closest(
                    "[data-category]"
                );

            if (!link) {
                return;
            }

            event.preventDefault();

            const category =
                link.dataset.category ||
                "all";

            AppState.activeCategory =
                category;

            AppState.searchQuery = "";

            const searchInput =
                $(SITE_CONFIG.selectors.searchInput);

            if (searchInput) {
                searchInput.value = "";
            }

            renderArticles();

            updateCategoryActiveState();

            updateURL();

            closeMobileSidebar();

            scrollToArticleArea();
        }
    );
}


/* =========================================================
   UPDATE CATEGORY ACTIVE STATE
   ========================================================= */

function updateCategoryActiveState() {

    $$("[data-category]").forEach(link => {

        const isActive =
            normalizeCategory(
                link.dataset.category
            ) ===
            normalizeCategory(
                AppState.activeCategory
            );

        link.classList.toggle(
            "active",
            isActive
        );

        if (isActive) {

            link.setAttribute(
                "aria-current",
                "page"
            );

        } else {

            link.removeAttribute(
                "aria-current"
            );
        }
    });
}


/* =========================================================
   RENDER ARTICLES
   ========================================================= */

function renderArticles() {

    const articleList =
        $(SITE_CONFIG.selectors.articleList);

    if (!articleList) {
        return;
    }

    let articles =
        [...AppState.articles];


    /*
     CATEGORY FILTER
    */

    if (
        AppState.activeCategory &&
        AppState.activeCategory !== "all"
    ) {

        articles =
            articles.filter(article =>
                normalizeCategory(
                    article.category
                ) ===
                normalizeCategory(
                    AppState.activeCategory
                )
            );
    }


    /*
     SEARCH FILTER
    */

    if (AppState.searchQuery) {

        const query =
            AppState.searchQuery
                .trim()
                .toLowerCase();

        articles =
            articles.filter(article => {

                const searchableText = [

                    article.title,

                    article.description,

                    article.category,

                    article.content || "",

                    ...(article.tags || [])

                ]
                    .join(" ")
                    .toLowerCase();

                return searchableText.includes(
                    query
                );
            });
    }


    /*
     SORT ARTICLES
    */

    articles.sort(
        sortArticlesByDate
    );


    /*
     EMPTY STATE
    */

    if (!articles.length) {

        articleList.innerHTML = `
            <div class="article-empty">
                <span
                    class="material-symbols-rounded"
                    aria-hidden="true"
                >
                    search_off
                </span>

                <h3>No articles found</h3>

                <p>
                    Try another search term or
                    choose a different category.
                </p>

                <button
                    type="button"
                    class="reset-search-button"
                    id="reset-search"
                >
                    Show all articles
                </button>
            </div>
        `;

        const resetButton =
            $("#reset-search");

        if (resetButton) {

            resetButton.addEventListener(
                "click",
                resetFilters
            );
        }

    } else {

        articleList.innerHTML =
            articles
                .map(createArticleCard)
                .join("");
    }


    /*
     UPDATE ARTICLE COUNT
    */

    updateArticleCount(
        articles.length
    );


    /*
     SEARCH MESSAGE
    */

    updateSearchMessage(
        articles.length
    );
}


/* =========================================================
   CREATE ARTICLE CARD
   ========================================================= */

function createArticleCard(article) {

    const category =
        escapeHTML(article.category);

    const title =
        escapeHTML(article.title);

    const description =
        escapeHTML(
            article.description
        );

    const url =
        sanitizeURL(article.url);

    const date =
        formatDate(article.date);

    const image =
        sanitizeURL(article.image);


    const imageHTML =
        image
            ? `
                <div class="article-card-image">
                    <img
                        src="${escapeAttribute(image)}"
                        alt=""
                        loading="lazy"
                        decoding="async"
                    >
                </div>
            `
            : "";


    const dateHTML =
        date
            ? `
                <time
                    class="article-date"
                    datetime="${escapeAttribute(article.date)}"
                >
                    ${escapeHTML(date)}
                </time>
            `
            : "";


    return `
        <article class="article-card">

            ${imageHTML}

            <div class="article-card-content">

                <div class="article-meta">

                    <span class="article-category">
                        ${category}
                    </span>

                    ${dateHTML}

                </div>

                <h2 class="article-card-title">

                    <a href="${escapeAttribute(url)}">
                        ${title}
                    </a>

                </h2>

                ${
                    description
                        ? `
                            <p class="article-card-excerpt">
                                ${description}
                            </p>
                        `
                        : ""
                }

                <a
                    href="${escapeAttribute(url)}"
                    class="article-read-more"
                    aria-label="Read ${title}"
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
   SEARCH
   ========================================================= */

function setupSearch() {

    const searchForm =
        $(SITE_CONFIG.selectors.searchForm);

    const searchInput =
        $(SITE_CONFIG.selectors.searchInput);

    if (!searchInput) {
        return;
    }


    /*
     LIVE SEARCH
    */

    searchInput.addEventListener(
        "input",
        debounce(
            () => {

                AppState.searchQuery =
                    searchInput.value.trim();

                /*
                 When searching, show
                 all categories first.
                */

                AppState.activeCategory =
                    "all";

                updateCategoryActiveState();

                renderArticles();

            },
            180
        )
    );


    /*
     FORM SUBMIT
    */

    if (searchForm) {

        searchForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                AppState.searchQuery =
                    searchInput.value.trim();

                AppState.activeCategory =
                    "all";

                updateCategoryActiveState();

                renderArticles();

                updateURL();

                scrollToArticleArea();
            }
        );
    }
}


/* =========================================================
   SEARCH MESSAGE
   ========================================================= */

function updateSearchMessage(count) {

    const message =
        $(SITE_CONFIG.selectors.searchMessage);

    if (!message) {
        return;
    }

    if (AppState.searchQuery) {

        message.textContent =
            `${count} article${count === 1 ? "" : "s"} found for "${AppState.searchQuery}".`;

    } else {

        message.textContent = "";
    }
}


/* =========================================================
   ARTICLE COUNT
   ========================================================= */

function updateArticleCount(count) {

    const element =
        $(SITE_CONFIG.selectors.articleCount);

    if (!element) {
        return;
    }

    element.textContent =
        `${count} article${count === 1 ? "" : "s"}`;
}


/* =========================================================
   RESET FILTERS
   ========================================================= */

function resetFilters() {

    AppState.activeCategory =
        "all";

    AppState.searchQuery =
        "";

    const searchInput =
        $(SITE_CONFIG.selectors.searchInput);

    if (searchInput) {
        searchInput.value = "";
    }

    updateCategoryActiveState();

    renderArticles();

    updateURL();
}


/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

function setupMobileNavigation() {

    const button =
        $(SITE_CONFIG.selectors.mobileMenuButton);

    const sidebar =
        $(SITE_CONFIG.selectors.sidebar);

    const overlay =
        $(SITE_CONFIG.selectors.sidebarOverlay);


    if (!button || !sidebar) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            const isOpen =
                sidebar.classList.toggle(
                    "is-open"
                );

            button.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            document.body.classList.toggle(
                "sidebar-open",
                isOpen
            );
        }
    );


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeMobileSidebar
        );
    }


    /*
     ESC KEY
    */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeMobileSidebar();
            }
        }
    );
}


function closeMobileSidebar() {

    const sidebar =
        $(SITE_CONFIG.selectors.sidebar);

    const button =
        $(SITE_CONFIG.selectors.mobileMenuButton);

    if (sidebar) {

        sidebar.classList.remove(
            "is-open"
        );
    }

    if (button) {

        button.setAttribute(
            "aria-expanded",
            "false"
        );
    }

    document.body.classList.remove(
        "sidebar-open"
    );
}


/* =========================================================
   URL STATE
   ========================================================= */

function initializeFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const category =
        params.get("category");

    const query =
        params.get("q");


    if (category) {

        const matchedCategory =
            AppState.categories.find(
                item =>
                    normalizeCategory(
                        item.name
                    ) ===
                    normalizeCategory(
                        category
                    )
            );

        if (matchedCategory) {

            AppState.activeCategory =
                matchedCategory.name;
        }
    }


    if (query) {

        AppState.searchQuery =
            query;

        const searchInput =
            $(SITE_CONFIG.selectors.searchInput);

        if (searchInput) {

            searchInput.value =
                query;
        }
    }


    updateCategoryActiveState();

    renderArticles();
}


function updateURL() {

    const params =
        new URLSearchParams();


    if (
        AppState.activeCategory &&
        AppState.activeCategory !== "all"
    ) {

        params.set(
            "category",
            AppState.activeCategory
        );
    }


    if (AppState.searchQuery) {

        params.set(
            "q",
            AppState.searchQuery
        );
    }


    const queryString =
        params.toString();

    const newURL =
        queryString
            ? `${window.location.pathname}?${queryString}`
            : window.location.pathname;


    /*
     Don't reload page.
    */

    window.history.replaceState(
        {},
        "",
        newURL
    );
}


/* =========================================================
   SCROLL TO ARTICLE AREA
   ========================================================= */

function scrollToArticleArea() {

    const articleList =
        $(SITE_CONFIG.selectors.articleList);

    if (!articleList) {
        return;
    }

    const top =
        articleList.getBoundingClientRect().top +
        window.scrollY -
        100;


    window.scrollTo({
        top,
        behavior: "smooth"
    });
}


/* =========================================================
   ARTICLE SORTING
   ========================================================= */

function sortArticlesByDate(a, b) {

    const dateA =
        parseDate(a.date);

    const dateB =
        parseDate(b.date);

    if (
        dateA !== null &&
        dateB !== null
    ) {

        return dateB - dateA;
    }

    return a.title.localeCompare(
        b.title
    );
}


function parseDate(value) {

    if (!value) {
        return null;
    }

    const timestamp =
        Date.parse(value);

    return Number.isNaN(timestamp)
        ? null
        : timestamp;
}


/* =========================================================
   DATE FORMATTING
   ========================================================= */

function formatDate(value) {

    if (!value) {
        return "";
    }

    const timestamp =
        Date.parse(value);

    if (Number.isNaN(timestamp)) {

        return value;
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
   CATEGORY NORMALIZATION
   ========================================================= */

function normalizeCategory(value) {

    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}


/* =========================================================
   SLUG GENERATOR
   ========================================================= */

function slugify(value) {

    return String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}


/* =========================================================
   URL SANITIZATION
   ========================================================= */

function sanitizeURL(url) {

    if (!url) {
        return "#";
    }

    const value =
        String(url).trim();


    /*
     Allow:

     /articles/example/
     article.html
     https://example.com
     http://example.com
     */

    if (
        value.startsWith("/") ||
        value.startsWith("./") ||
        value.startsWith("../") ||
        value.startsWith("https://") ||
        value.startsWith("http://") ||
        value.startsWith("#")
    ) {

        return value;
    }


    /*
     Prevent dangerous protocols.
    */

    return "#";
}


/* =========================================================
   HTML ESCAPING
   ========================================================= */

function escapeHTML(value) {

    return String(value || "")
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
   ERROR STATE
   ========================================================= */

function showArticleLoadError() {

    const articleList =
        $(SITE_CONFIG.selectors.articleList);

    if (!articleList) {
        return;
    }

    articleList.innerHTML = `
        <div class="article-empty article-error">

            <span
                class="material-symbols-rounded"
                aria-hidden="true"
            >
                error_outline
            </span>

            <h3>
                Articles could not be loaded
            </h3>

            <p>
                Please refresh the page and try again.
            </p>

            <button
                type="button"
                class="reset-search-button"
                onclick="window.location.reload()"
            >
                Refresh page
            </button>

        </div>
    `;
}


/* =========================================================
   DEBOUNCE
   ========================================================= */

function debounce(
    callback,
    delay = 200
) {

    let timeout;

    return function (...args) {

        clearTimeout(timeout);

        timeout =
            setTimeout(
                () => {
                    callback.apply(
                        this,
                        args
                    );
                },
                delay
            );
    };
}


/* =========================================================
   HANDLE BROWSER BACK/FORWARD
   ========================================================= */

window.addEventListener(
    "popstate",
    () => {

        initializeFromURL();
    }
);


/* =========================================================
   ACCESSIBILITY — KEYBOARD SIDEBAR
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "/" &&
            !isTypingInField(event.target)
        ) {

            event.preventDefault();

            const searchInput =
                $(SITE_CONFIG.selectors.searchInput);

            if (searchInput) {

                searchInput.focus();
            }
        }
    }
);


function isTypingInField(element) {

    if (!element) {
        return false;
    }

    const tag =
        element.tagName.toLowerCase();

    return (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        element.isContentEditable
    );
}


/* =========================================================
   EXPOSE OPTIONAL PUBLIC METHODS
   ========================================================= */

window.ElectricalEngineering = {

    search(query) {

        AppState.searchQuery =
            String(query || "").trim();

        AppState.activeCategory =
            "all";

        const searchInput =
            $(SITE_CONFIG.selectors.searchInput);

        if (searchInput) {

            searchInput.value =
                AppState.searchQuery;
        }

        updateCategoryActiveState();

        renderArticles();

        updateURL();
    },

    showCategory(category) {

        AppState.activeCategory =
            category || "all";

        AppState.searchQuery =
            "";

        const searchInput =
            $(SITE_CONFIG.selectors.searchInput);

        if (searchInput) {

            searchInput.value = "";
        }

        updateCategoryActiveState();

        renderArticles();

        updateURL();
    },

    reset() {

        resetFilters();
    },

    getArticles() {

        return [...AppState.articles];
    },

    getCategories() {

        return [...AppState.categories];
    }
};
