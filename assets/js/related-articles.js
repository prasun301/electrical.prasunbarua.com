/* =========================================================
   ELECTRICAL ENGINEERING
   RELATED ARTICLES SYSTEM
   ---------------------------------------------------------
   Loads articles.json and automatically displays
   relevant articles on article pages.
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    initRelatedArticles();
});


/* =========================================================
   CONFIGURATION
   ========================================================= */

const RELATED_CONFIG = {
    dataURL: "/articles.json",
    containerID: "related-articles",
    maxArticles: 3
};


/* =========================================================
   INITIALIZE
   ========================================================= */

async function initRelatedArticles() {

    const container = document.getElementById(
        RELATED_CONFIG.containerID
    );

    /*
     * If the current page does not contain a related
     * articles container, there is nothing to do.
     */
    if (!container) {
        return;
    }


    try {

        const response = await fetch(
            RELATED_CONFIG.dataURL,
            {
                cache: "no-cache"
            }
        );


        if (!response.ok) {
            throw new Error(
                `Unable to load articles.json: ${response.status}`
            );
        }


        const articles = await response.json();


        if (!Array.isArray(articles)) {
            throw new Error(
                "articles.json must contain an array of articles."
            );
        }


        const currentURL =
            normalizeURL(window.location.pathname);


        const currentArticle =
            findCurrentArticle(
                articles,
                currentURL
            );


        const relatedArticles =
            getRelatedArticles(
                articles,
                currentArticle,
                currentURL
            );


        renderRelatedArticles(
            container,
            relatedArticles
        );

    } catch (error) {

        console.warn(
            "Related articles could not be loaded:",
            error
        );

        /*
         * Keep the existing static related articles
         * if the JSON cannot be loaded.
         */
    }
}


/* =========================================================
   NORMALIZE URL
   ========================================================= */

function normalizeURL(url) {

    if (!url) {
        return "/";
    }


    let cleanURL = url;


    /*
     * Remove query string.
     */
    cleanURL =
        cleanURL.split("?")[0];


    /*
     * Remove hash.
     */
    cleanURL =
        cleanURL.split("#")[0];


    /*
     * Convert backslashes if any.
     */
    cleanURL =
        cleanURL.replace(/\\/g, "/");


    /*
     * Ensure leading slash.
     */
    if (!cleanURL.startsWith("/")) {
        cleanURL = "/" + cleanURL;
    }


    /*
     * Remove duplicate slashes.
     */
    cleanURL =
        cleanURL.replace(/\/+/g, "/");


    /*
     * Normalize trailing slash.
     */
    if (
        cleanURL.length > 1 &&
        !cleanURL.endsWith("/")
    ) {

        cleanURL += "/";

    }


    return cleanURL;
}


/* =========================================================
   FIND CURRENT ARTICLE
   ========================================================= */

function findCurrentArticle(
    articles,
    currentURL
) {

    return articles.find(article => {

        if (!article) {
            return false;
        }


        const articleURL =
            normalizeURL(
                article.url ||
                article.path ||
                ""
            );


        return articleURL === currentURL;

    }) || null;
}


/* =========================================================
   GET RELATED ARTICLES
   ========================================================= */

function getRelatedArticles(
    articles,
    currentArticle,
    currentURL
) {

    /*
     * Remove current article.
     */
    let candidates =
        articles.filter(article => {

            if (!article) {
                return false;
            }


            const articleURL =
                normalizeURL(
                    article.url ||
                    article.path ||
                    ""
                );


            return articleURL !== currentURL;

        });


    /*
     * Determine current category.
     */
    const currentCategory =
        currentArticle
            ? normalizeText(
                currentArticle.category ||
                currentArticle.section ||
                ""
            )
            : getCategoryFromURL(
                currentURL
            );


    /*
     * Determine current tags.
     */
    const currentTags =
        currentArticle &&
        Array.isArray(currentArticle.tags)
            ? currentArticle.tags
            : [];


    /*
     * Score each candidate.
     */
    const scoredArticles =
        candidates.map(article => {

            let score = 0;


            const articleCategory =
                normalizeText(
                    article.category ||
                    article.section ||
                    ""
                );


            /*
             * Same category is the strongest
             * basic relationship.
             */
            if (
                currentCategory &&
                articleCategory &&
                currentCategory === articleCategory
            ) {

                score += 50;

            }


            /*
             * Match tags.
             */
            const articleTags =
                Array.isArray(article.tags)
                    ? article.tags
                    : [];


            currentTags.forEach(
                currentTag => {

                    const normalizedCurrentTag =
                        normalizeText(
                            currentTag
                        );


                    articleTags.forEach(
                        articleTag => {

                            if (
                                normalizedCurrentTag ===
                                normalizeText(articleTag)
                            ) {

                                score += 15;

                            }

                        }
                    );

                }
            );


            /*
             * Match keywords if available.
             */
            const currentKeywords =
                currentArticle &&
                Array.isArray(
                    currentArticle.keywords
                )
                    ? currentArticle.keywords
                    : [];


            const articleKeywords =
                Array.isArray(
                    article.keywords
                )
                    ? article.keywords
                    : [];


            currentKeywords.forEach(
                keyword => {

                    const normalizedKeyword =
                        normalizeText(
                            keyword
                        );


                    articleKeywords.forEach(
                        articleKeyword => {

                            if (
                                normalizedKeyword ===
                                normalizeText(articleKeyword)
                            ) {

                                score += 8;

                            }

                        }
                    );

                }
            );


            /*
             * Category URL relationship.
             */
            const articleURL =
                normalizeURL(
                    article.url ||
                    article.path ||
                    ""
                );


            if (
                currentCategory &&
                articleURL.includes(
                    slugify(currentCategory)
                )
            ) {

                score += 5;

            }


            /*
             * Newer articles receive a small
             * preference.
             */
            if (article.date) {

                const articleDate =
                    new Date(
                        article.date
                    );


                if (
                    !Number.isNaN(
                        articleDate.getTime()
                    )
                ) {

                    const age =
                        Date.now() -
                        articleDate.getTime();


                    const days =
                        age /
                        (1000 * 60 * 60 * 24);


                    if (days < 180) {
                        score += 3;
                    }

                }

            }


            return {
                article,
                score
            };

        });


    /*
     * Sort highest relevance first.
     */
    scoredArticles.sort(
        (a, b) => {

            if (
                b.score !==
                a.score
            ) {

                return b.score -
                    a.score;

            }


            return compareDates(
                b.article,
                a.article
            );

        }
    );


    /*
     * If no meaningful relationship exists,
     * use the most recent articles instead.
     */
    const meaningful =
        scoredArticles.filter(
            item => item.score > 0
        );


    const selected =
        meaningful.length >=
        RELATED_CONFIG.maxArticles
            ? meaningful
            : scoredArticles;


    return selected
        .slice(
            0,
            RELATED_CONFIG.maxArticles
        )
        .map(
            item => item.article
        );
}


/* =========================================================
   COMPARE DATES
   ========================================================= */

function compareDates(
    articleA,
    articleB
) {

    const dateA =
        new Date(
            articleA.date ||
            articleA.published ||
            0
        ).getTime();


    const dateB =
        new Date(
            articleB.date ||
            articleB.published ||
            0
        ).getTime();


    return (
        (Number.isNaN(dateA) ? 0 : dateA) -
        (Number.isNaN(dateB) ? 0 : dateB)
    );
}


/* =========================================================
   GET CATEGORY FROM URL
   ========================================================= */

function getCategoryFromURL(url) {

    const parts =
        normalizeURL(url)
            .split("/")
            .filter(Boolean);


    /*
     * Expected:
     *
     * /articles/electrical-fundamentals/...
     *
     * parts[0] = articles
     * parts[1] = category
     */

    if (
        parts.length >= 2 &&
        parts[0] === "articles"
    ) {

        return parts[1]
            .replace(/-/g, " ");

    }


    return "";
}


/* =========================================================
   NORMALIZE TEXT
   ========================================================= */

function normalizeText(value) {

    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

}


/* =========================================================
   SLUGIFY
   ========================================================= */

function slugify(value) {

    return String(value || "")
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

}


/* =========================================================
   RENDER RELATED ARTICLES
   ========================================================= */

function renderRelatedArticles(
    container,
    articles
) {

    if (
        !articles ||
        !articles.length
    ) {

        return;

    }


    /*
     * Clear the static fallback cards.
     */
    container.innerHTML = "";


    articles.forEach(article => {

        const card =
            createRelatedCard(
                article
            );


        if (card) {

            container.appendChild(
                card
            );

        }

    });

}


/* =========================================================
   CREATE RELATED ARTICLE CARD
   ========================================================= */

function createRelatedCard(article) {

    const articleURL =
        normalizeURL(
            article.url ||
            article.path ||
            ""
        );


    if (!articleURL || articleURL === "/") {
        return null;
    }


    const card =
        document.createElement("a");


    card.className =
        "related-card";


    card.href =
        articleURL;


    /*
     * Category.
     */
    const category =
        document.createElement("div");


    category.className =
        "related-card-category";


    category.textContent =
        article.category ||
        article.section ||
        "Electrical Engineering";


    /*
     * Title.
     */
    const title =
        document.createElement("h3");


    title.textContent =
        article.title ||
        "Electrical Engineering Article";


    /*
     * Optional description.
     */
    const description =
        article.description
            ? document.createElement("p")
            : null;


    if (description) {

        description.className =
            "related-card-description";


        description.textContent =
            article.description;

    }


    card.appendChild(
        category
    );


    card.appendChild(
        title
    );


    if (description) {

        card.appendChild(
            description
        );

    }


    return card;
}


/* =========================================================
   OPTIONAL: ARTICLE VIEW TRACKING
   ---------------------------------------------------------
   Sends a lightweight Google Analytics event when
   related article cards are clicked.
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const card =
            event.target.closest(
                ".related-card"
            );


        if (
            !card ||
            typeof window.gtag !== "function"
        ) {

            return;

        }


        window.gtag(
            "event",
            "related_article_click",
            {
                article_url:
                    card.href,

                article_title:
                    card.querySelector("h3")
                        ?.textContent ||
                    ""
            }
        );

    }
);
