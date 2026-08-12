/* =========================================================
   ELECTRICAL ENGINEERING — SITE APP
   electrical.prasunbarua.com

   Functions:
   - Mobile navigation
   - Article search
   - articles.json search
   - Category navigation
   - Search URL handling
   - Smooth UX
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       GLOBAL ELEMENTS
       ===================================================== */

    const body = document.body;

    const menuButton = document.querySelector("[data-menu-toggle]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    const searchForm = document.querySelector("#site-search-form");
    const searchInput = document.querySelector("#site-search");
    const searchMessage = document.querySelector("#search-message");

    let articles = [];


    /* =====================================================
       MOBILE NAVIGATION
       ===================================================== */

    if (menuButton && mobileNav) {

        menuButton.addEventListener("click", () => {

            const isOpen = mobileNav.classList.toggle("is-open");

            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            body.classList.toggle(
                "menu-open",
                isOpen
            );

        });


        /* Close menu when clicking a navigation link */

        mobileNav.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", () => {

                mobileNav.classList.remove("is-open");

                menuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

                body.classList.remove("menu-open");

            });

        });

    }


    /* =====================================================
       LOAD ARTICLE DATABASE
       ===================================================== */

    async function loadArticles() {

        try {

            const response = await fetch("/articles.json", {
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}`
                );
            }

            const data = await response.json();

            if (Array.isArray(data)) {

                articles = data;

            } else if (
                data &&
                Array.isArray(data.articles)
            ) {

                articles = data.articles;

            } else {

                articles = [];

            }

        } catch (error) {

            console.error(
                "Unable to load articles.json:",
                error
            );

            articles = [];

        }

    }


    /* =====================================================
       NORMALIZE SEARCH TEXT
       ===================================================== */

    function normalizeText(value) {

        return String(value || "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, " ");

    }


    /* =====================================================
       SEARCH ARTICLES
       ===================================================== */

    function searchArticles(query) {

        const normalizedQuery =
            normalizeText(query);

        if (!normalizedQuery) {
            return [];
        }

        const terms =
            normalizedQuery.split(" ");

        return articles
            .map(article => {

                const title =
                    normalizeText(article.title);

                const description =
                    normalizeText(
                        article.description ||
                        article.excerpt ||
                        ""
                    );

                const category =
                    normalizeText(
                        article.category ||
                        ""
                    );

                const keywords =
                    normalizeText(
                        Array.isArray(article.keywords)
                            ? article.keywords.join(" ")
                            : article.keywords || ""
                    );

                const searchableText =
                    `${title} ${description} ${category} ${keywords}`;

                let score = 0;

                terms.forEach(term => {

                    if (title.includes(term)) {
                        score += 10;
                    }

                    if (category.includes(term)) {
                        score += 6;
                    }

                    if (keywords.includes(term)) {
                        score += 5;
                    }

                    if (description.includes(term)) {
                        score += 3;
                    }

                });

                return {
                    article,
                    score
                };

            })
            .filter(item => item.score > 0)
            .sort((a, b) => {

                return b.score - a.score;

            })
            .map(item => item.article);

    }


    /* =====================================================
       SEARCH SUBMIT
       ===================================================== */

    if (searchForm) {

        searchForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const query =
                    searchInput
                        ? searchInput.value.trim()
                        : "";

                if (!query) {

                    if (searchMessage) {

                        searchMessage.textContent =
                            "Please enter a topic to search.";

                    }

                    if (searchInput) {
                        searchInput.focus();
                    }

                    return;

                }


                const results =
                    searchArticles(query);


                /* -----------------------------------------
                   If results found
                   ----------------------------------------- */

                if (results.length > 0) {

                    const firstResult =
                        results[0];

                    if (firstResult.url) {

                        window.location.href =
                            firstResult.url;

                        return;

                    }

                    if (firstResult.path) {

                        window.location.href =
                            firstResult.path;

                        return;

                    }

                }


                /* -----------------------------------------
                   No result
                   ----------------------------------------- */

                if (searchMessage) {

                    searchMessage.textContent =
                        `No article found for "${query}". Try another electrical engineering topic.`;

                }

            }
        );

    }


    /* =====================================================
       SEARCH FROM URL
       ===================================================== */

    function handleSearchParameter() {

        const params =
            new URLSearchParams(
                window.location.search
            );

        const query =
            params.get("q");

        if (!query) {
            return;
        }

        if (searchInput) {
            searchInput.value = query;
        }

        const results =
            searchArticles(query);

        if (results.length > 0) {

            const firstResult =
                results[0];

            const destination =
                firstResult.url ||
                firstResult.path;

            if (destination) {

                window.location.href =
                    destination;

            }

        } else if (searchMessage) {

            searchMessage.textContent =
                `No article found for "${query}".`;

        }

    }


    /* =====================================================
       CATEGORY FILTER
       ===================================================== */

    const categoryButtons =
        document.querySelectorAll(
            "[data-category]"
        );

    const articleItems =
        document.querySelectorAll(
            "[data-article-category]"
        );


    if (
        categoryButtons.length &&
        articleItems.length
    ) {

        categoryButtons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const selected =
                        normalizeText(
                            button.dataset.category
                        );


                    categoryButtons.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    articleItems.forEach(
                        article => {

                            const category =
                                normalizeText(
                                    article.dataset
                                        .articleCategory
                                );

                            if (
                                selected === "all" ||
                                category === selected
                            ) {

                                article.hidden =
                                    false;

                            } else {

                                article.hidden =
                                    true;

                            }

                        }
                    );

                }
            );

        });

    }


    /* =====================================================
       ACTIVE CATEGORY FROM URL
       ===================================================== */

    function activateCategoryFromURL() {

        const params =
            new URLSearchParams(
                window.location.search
            );

        const category =
            params.get("category");

        if (!category) {
            return;
        }

        const normalized =
            normalizeText(category);

        categoryButtons.forEach(button => {

            const buttonCategory =
                normalizeText(
                    button.dataset.category
                );

            if (
                buttonCategory === normalized
            ) {

                button.click();

            }

        });

    }


    /* =====================================================
       EXTERNAL LINKS
       ===================================================== */

    document
        .querySelectorAll(
            'a[href^="http"]'
        )
        .forEach(link => {

            const currentHost =
                window.location.hostname;

            try {

                const linkURL =
                    new URL(
                        link.href,
                        window.location.href
                    );

                if (
                    linkURL.hostname !==
                    currentHost
                ) {

                    link.setAttribute(
                        "target",
                        "_blank"
                    );

                    link.setAttribute(
                        "rel",
                        "noopener noreferrer"
                    );

                }

            } catch (error) {

                console.warn(
                    "Invalid URL:",
                    link.href
                );

            }

        });


    /* =====================================================
       CURRENT YEAR
       ===================================================== */

    document
        .querySelectorAll(
            "[data-current-year]"
        )
        .forEach(element => {

            element.textContent =
                new Date().getFullYear();

        });


    /* =====================================================
       BACK TO TOP
       ===================================================== */

    const backToTop =
        document.querySelector(
            "[data-back-to-top]"
        );


    if (backToTop) {

        const updateBackToTop =
            () => {

                if (
                    window.scrollY > 500
                ) {

                    backToTop.classList.add(
                        "is-visible"
                    );

                } else {

                    backToTop.classList.remove(
                        "is-visible"
                    );

                }

            };


        window.addEventListener(
            "scroll",
            updateBackToTop,
            {
                passive: true
            }
        );


        backToTop.addEventListener(
            "click",
            () => {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    }


    /* =====================================================
       ESC KEY
       ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") {
                return;
            }


            if (
                mobileNav &&
                mobileNav.classList.contains(
                    "is-open"
                )
            ) {

                mobileNav.classList.remove(
                    "is-open"
                );

                if (menuButton) {

                    menuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

                body.classList.remove(
                    "menu-open"
                );

            }

        }
    );


    /* =====================================================
       INITIALIZE
       ===================================================== */

    loadArticles().then(() => {

        activateCategoryFromURL();

        handleSearchParameter();

    });

});
