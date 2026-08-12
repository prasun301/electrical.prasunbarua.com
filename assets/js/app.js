/* =========================================================
   ELECTRICAL ENGINEERING
   SITE JAVASCRIPT
   Prasun Barua
   ========================================================= */

"use strict";


/* =========================================================
   GLOBAL CONFIGURATION
   ========================================================= */

const SITE_CONFIG = {
    articlesJSON: "/articles.json",
    articlesPage: "/articles/"
};


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeMobileMenu();

    initializeSearch();

    initializeArticleArchive();

    initializeCategoryPage();

    initializeCurrentYear();

});


/* =========================================================
   MOBILE SIDEBAR MENU
   ========================================================= */

function initializeMobileMenu() {

    const menuToggle = document.getElementById("menu-toggle");
    const sidebar = document.getElementById("site-sidebar");
    const sidebarClose = document.getElementById("sidebar-close");
    const overlay = document.getElementById("sidebar-overlay");

    if (!menuToggle || !sidebar) {
        return;
    }


    function openSidebar() {

        sidebar.classList.add("is-open");

        if (overlay) {
            overlay.classList.add("is-visible");
            overlay.setAttribute("aria-hidden", "false");
        }

        menuToggle.setAttribute("aria-expanded", "true");

        document.body.classList.add("sidebar-open");

    }


    function closeSidebar() {

        sidebar.classList.remove("is-open");

        if (overlay) {
            overlay.classList.remove("is-visible");
            overlay.setAttribute("aria-hidden", "true");
        }

        menuToggle.setAttribute("aria-expanded", "false");

        document.body.classList.remove("sidebar-open");

    }


    menuToggle.addEventListener("click", () => {

        const isOpen =
            sidebar.classList.contains("is-open");

        if (isOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }

    });


    if (sidebarClose) {

        sidebarClose.addEventListener(
            "click",
            closeSidebar
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeSidebar
        );

    }


    /*
       Close sidebar after selecting
       a navigation link on mobile.
    */

    const sidebarLinks =
        sidebar.querySelectorAll("a");

    sidebarLinks.forEach(link => {

        link.addEventListener("click", () => {

            if (window.innerWidth <= 900) {
                closeSidebar();
            }

        });

    });


    /*
       Escape key closes sidebar.
    */

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            closeSidebar();
        }

    });


    /*
       If browser becomes desktop size,
       reset mobile menu state.
    */

    window.addEventListener("resize", () => {

        if (window.innerWidth > 900) {
            closeSidebar();
        }

    });

}


/* =========================================================
   SEARCH
   ========================================================= */

function initializeSearch() {

    const searchForms =
        document.querySelectorAll(
            "#site-search-form"
        );

    if (!searchForms.length) {
        return;
    }


    searchForms.forEach(form => {

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const input =
                    form.querySelector(
                        "input[name='q']"
                    );

                if (!input) {
                    return;
                }


                const query =
                    input.value.trim();


                /*
                   Empty search:
                   return to article archive.
                */

                if (!query) {

                    window.location.href =
                        SITE_CONFIG.articlesPage;

                    return;

                }


                /*
                   Send search to:
                   /articles/?q=...
                */

                const searchURL =
                    SITE_CONFIG.articlesPage +
                    "?q=" +
                    encodeURIComponent(query);


                window.location.href =
                    searchURL;

            }
        );

    });


    /*
       If the page already contains ?q=,
       display the query inside search fields.
    */

    const params =
        new URLSearchParams(
            window.location.search
        );

    const query =
        params.get("q");


    if (query) {

        searchForms.forEach(form => {

            const input =
                form.querySelector(
                    "input[name='q']"
                );

            if (input) {
                input.value = query;
            }

        });

    }

}


/* =========================================================
   LOAD ARTICLES JSON
   ========================================================= */

async function loadArticles() {

    try {

        const response =
            await fetch(
                SITE_CONFIG.articlesJSON,
                {
                    cache: "no-cache"
                }
            );


        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const data =
            await response.json();


        if (!data || !Array.isArray(data.articles)) {

            throw new Error(
                "Invalid articles.json format."
            );

        }


        return data;

    } catch (error) {

        console.error(
            "Unable to load articles.json:",
            error
        );

        return null;

    }

}


/* =========================================================
   ARTICLE ARCHIVE
   /articles/
   ========================================================= */

async function initializeArticleArchive() {

    /*
       Only run on the main article archive.
    */

    const articleList =
        document.querySelector(
            ".article-list"
        );


    if (!articleList) {
        return;
    }


    /*
       Do not interfere with pages
       that don't use the article archive.
    */

    const isArchivePage =
        window.location.pathname === "/articles/" ||
        window.location.pathname === "/articles/index.html";


    if (!isArchivePage) {
        return;
    }


    const data =
        await loadArticles();


    if (!data) {
        showArticleLoadError();
        return;
    }


    const articles =
        data.articles.filter(
            article =>
                article.status === "published"
        );


    const params =
        new URLSearchParams(
            window.location.search
        );


    const searchQuery =
        (params.get("q") || "")
            .trim()
            .toLowerCase();


    if (searchQuery) {

        const filteredArticles =
            searchArticles(
                articles,
                searchQuery
            );


        renderArticleArchive(
            filteredArticles
        );


        updateSearchMessage(
            searchQuery,
            filteredArticles.length
        );

    } else {

        renderArticleArchive(
            sortArticles(articles)
        );

        clearSearchMessage();

    }


    /*
       Search box:
       update results while typing.
    */

    const searchInput =
        document.getElementById(
            "site-search"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            debounce(() => {

                const query =
                    searchInput.value
                        .trim()
                        .toLowerCase();


                if (!query) {

                    renderArticleArchive(
                        sortArticles(articles)
                    );

                    clearSearchMessage();

                    return;

                }


                const results =
                    searchArticles(
                        articles,
                        query
                    );


                renderArticleArchive(
                    results
                );


                updateSearchMessage(
                    query,
                    results.length
                );

            }, 180)
        );

    }

}


/* =========================================================
   SEARCH ARTICLES
   ========================================================= */

function searchArticles(
    articles,
    query
) {

    const terms =
        query
            .split(/\s+/)
            .filter(Boolean);


    return articles.filter(article => {

        const searchableText = [

            article.title,

            article.description,

            article.excerpt,

            article.category,

            article.categoryName,

            ...(article.tags || [])

        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();


        return terms.every(
            term =>
                searchableText.includes(term)
        );

    });

}


/* =========================================================
   SORT ARTICLES
   ========================================================= */

function sortArticles(articles) {

    return [...articles].sort(
        (a, b) => {

            const dateA =
                a.datePublished
                    ? new Date(a.datePublished)
                    : new Date(0);

            const dateB =
                b.datePublished
                    ? new Date(b.datePublished)
                    : new Date(0);


            return dateB - dateA;

        }
    );

}


/* =========================================================
   RENDER ARTICLE ARCHIVE
   ========================================================= */

function renderArticleArchive(
    articles
) {

    const articleList =
        document.querySelector(
            ".article-list"
        );


    const noResults =
        document.getElementById(
            "no-results"
        );


    if (!articleList) {
        return;
    }


    articleList.innerHTML = "";


    if (!articles.length) {

        if (noResults) {
            noResults.hidden = false;
        }

        return;

    }


    if (noResults) {
        noResults.hidden = true;
    }


    articles.forEach(article => {

        const element =
            createArticleCard(article);


        articleList.appendChild(
            element
        );

    });

}


/* =========================================================
   CREATE ARTICLE CARD
   ========================================================= */

function createArticleCard(article) {

    const articleElement =
        document.createElement(
            "article"
        );


    articleElement.className =
        "article-list-item";


    const icon =
        escapeHTML(
            article.icon ||
            "article"
        );


    const category =
        escapeHTML(
            article.categoryName ||
            article.category ||
            "Article"
        );


    const title =
        escapeHTML(
            article.title ||
            "Untitled Article"
        );


    const description =
        escapeHTML(
            article.description ||
            article.excerpt ||
            ""
        );


    const readingTime =
        escapeHTML(
            article.readingTime ||
            ""
        );


    const date =
        formatArticleDate(
            article.datePublished
        );


    const articleURL =
        safeURL(
            article.url
        );


    articleElement.innerHTML = `

        <div class="article-list-icon">

            <span class="material-symbols-rounded"
                  aria-hidden="true">
                ${icon}
            </span>

        </div>


        <div class="article-list-content">

            <div class="article-category">
                ${category}
            </div>


            <h2>

                <a href="${articleURL}">
                    ${title}
                </a>

            </h2>


            <p>
                ${description}
            </p>


            <div class="article-meta">

                ${
                    date
                        ? `<time datetime="${escapeHTML(article.datePublished)}">
                               ${date}
                           </time>`
                        : ""
                }

                ${
                    readingTime
                        ? `<span>•</span>
                           <span>
                               ${readingTime}
                           </span>`
                        : ""
                }

            </div>


            <a class="article-read-link"
               href="${articleURL}">

                Read article

                <span class="material-symbols-rounded"
                      aria-hidden="true">
                    arrow_forward
                </span>

            </a>

        </div>

    `;


    return articleElement;

}


/* =========================================================
   CATEGORY PAGE
   ========================================================= */

async function initializeCategoryPage() {

    const categoryContainer =
        document.querySelector(
            "[data-category]"
        );


    if (!categoryContainer) {
        return;
    }


    const categoryID =
        categoryContainer.dataset.category;


    if (!categoryID) {
        return;
    }


    const data =
        await loadArticles();


    if (!data) {
        return;
    }


    const articles =
        data.articles.filter(
            article =>
                article.status === "published" &&
                article.category === categoryID
        );


    /*
       If the category page has an
       article-list, populate it.
    */

    const articleList =
        categoryContainer.querySelector(
            ".article-list"
        );


    if (!articleList) {
        return;
    }


    articleList.innerHTML = "";


    if (!articles.length) {

        articleList.innerHTML = `

            <div class="no-results">

                <span class="material-symbols-rounded">
                    article
                </span>

                <h2>
                    No articles yet
                </h2>

                <p>
                    Articles in this category
                    will be published soon.
                </p>

            </div>

        `;

        return;

    }


    sortArticles(articles)
        .forEach(article => {

            articleList.appendChild(
                createArticleCard(article)
            );

        });

}


/* =========================================================
   SEARCH MESSAGE
   ========================================================= */

function updateSearchMessage(
    query,
    resultCount
) {

    const message =
        document.getElementById(
            "search-message"
        );


    if (!message) {
        return;
    }


    if (resultCount === 0) {

        message.textContent =
            `No articles found for "${query}".`;

        return;

    }


    const articleWord =
        resultCount === 1
            ? "article"
            : "articles";


    message.textContent =
        `${resultCount} ${articleWord} found for "${query}".`;

}


/* =========================================================
   CLEAR SEARCH MESSAGE
   ========================================================= */

function clearSearchMessage() {

    const message =
        document.getElementById(
            "search-message"
        );


    if (message) {
        message.textContent = "";
    }

}


/* =========================================================
   ARTICLE LOAD ERROR
   ========================================================= */

function showArticleLoadError() {

    const articleList =
        document.querySelector(
            ".article-list"
        );


    if (!articleList) {
        return;
    }


    articleList.innerHTML = `

        <div class="no-results">

            <span class="material-symbols-rounded">
                error_outline
            </span>

            <h2>
                Articles are temporarily unavailable
            </h2>

            <p>
                Please try again later.
            </p>

        </div>

    `;

}


/* =========================================================
   FORMAT ARTICLE DATE
   ========================================================= */

function formatArticleDate(
    dateString
) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(dateString);


    if (Number.isNaN(date.getTime())) {
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
   CURRENT YEAR
   ========================================================= */

function initializeCurrentYear() {

    const currentYear =
        new Date().getFullYear();


    document
        .querySelectorAll(
            "[data-current-year]"
        )
        .forEach(element => {

            element.textContent =
                currentYear;

        });

}


/* =========================================================
   DEBOUNCE
   ========================================================= */

function debounce(
    callback,
    delay = 200
) {

    let timeout;


    return (...args) => {

        clearTimeout(timeout);


        timeout = setTimeout(
            () => callback(...args),
            delay
        );

    };

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   SAFE INTERNAL URL
   ========================================================= */

function safeURL(url) {

    if (!url) {
        return "#";
    }


    const value =
        String(url).trim();


    /*
       Only allow internal paths.
       This prevents accidental
       unsafe javascript: URLs.
    */

    if (
        value.startsWith("/") &&
        !value.startsWith("//")
    ) {

        return value;

    }


    return "#";

}


/* =========================================================
   ACTIVE SIDEBAR LINK
   ========================================================= */

(function initializeActiveSidebar() {

    const currentPath =
        window.location.pathname
            .replace(/\/+$/, "/");


    document
        .querySelectorAll(
            ".sidebar-link"
        )
        .forEach(link => {

            const href =
                link.getAttribute("href");


            if (!href) {
                return;
            }


            const linkPath =
                href
                    .replace(/\/+$/, "/");


            if (
                linkPath === currentPath
            ) {

                link.classList.add(
                    "active"
                );

            }

        });

})();


/* =========================================================
   EXTERNAL LINK SAFETY
   ========================================================= */

document
    .querySelectorAll(
        'a[target="_blank"]'
    )
    .forEach(link => {

        const rel =
            link.getAttribute("rel") || "";


        if (!rel.includes("noopener")) {

            link.setAttribute(
                "rel",
                `${rel} noopener noreferrer`
                    .trim()
            );

        }

    });


/* =========================================================
   END
   ========================================================= */
