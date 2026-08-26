/* =========================================================
   ELECTRICAL ENGINEERING
   RELATED ARTICLES SYSTEM
   ---------------------------------------------------------
   Loads articles.json and automatically displays
   relevant published articles on article pages.
   ========================================================= */

"use strict";


/* =========================================================
   INITIALIZE
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {

    initRelatedArticles();

});


/* =========================================================
   CONFIGURATION
   ========================================================== */

const RELATED_CONFIG = {

    dataURL: "/articles.json",

    containerID: "related-articles",

    maxArticles: 3

};


/* =========================================================
   INITIALIZE RELATED ARTICLES
   ========================================================== */

async function initRelatedArticles() {

    const container =
        document.getElementById(
            RELATED_CONFIG.containerID
        );


    /*
     * Nothing to do if this page does not contain
     * the related articles container.
     */

    if (!container) {

        return;

    }


    try {

        const response =
            await fetch(
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


        const data =
            await response.json();


        /*
         * Support both:
         *
         * 1. [ {...}, {...} ]
         *
         * 2. { "articles": [ {...}, {...} ] }
         */

        const articles =
            Array.isArray(data)
                ? data
                : Array.isArray(data.articles)
                    ? data.articles
                    : [];


        if (!articles.length) {

            throw new Error(
                "No articles found in articles.json."
            );

        }


        const currentURL =
            normalizeURL(
                window.location.pathname
            );


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

    }

}


/* =========================================================
   NORMALIZE URL
   ========================================================== */

function normalizeURL(url) {

    if (!url) {

        return "/";

    }


    let cleanURL =
        String(url);


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
     * Convert backslashes.
     */

    cleanURL =
        cleanURL.replace(/\\/g, "/");


    /*
     * Ensure leading slash.
     */

    if (!cleanURL.startsWith("/")) {

        cleanURL =
            "/" + cleanURL;

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
   ========================================================== */

function findCurrentArticle(
    articles,
    currentURL
) {

    return articles.find(function (article) {

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
   ========================================================== */

function getRelatedArticles(
    articles,
    currentArticle,
    currentURL
) {


    /* =====================================================
       CURRENT DATE
    ====================================================== */

    const now =
        new Date();


    /* =====================================================
       ONLY INCLUDE ACTUALLY PUBLISHED ARTICLES
    ====================================================== */

    let candidates =
        articles.filter(function (article) {

            if (!article) {

                return false;

            }


            /*
             * Must explicitly be published.
             */

            if (
                String(article.status || "")
                    .toLowerCase() !==
                "published"
            ) {

                return false;

            }


            /*
             * Must have a publication date.
             */

            if (!article.datePublished) {

                return false;

            }


            const publishedDate =
                parseArticleDate(
                    article.datePublished
                );


            /*
             * Reject invalid dates.
             */

            if (!publishedDate) {

                return false;

            }


            /*
             * Reject future articles.
             */

            if (
                publishedDate > now
            ) {

                return false;

            }


            /*
             * Remove current article.
             */

            const articleURL =
                normalizeURL(
                    article.url ||
                    article.path ||
                    ""
                );


            return articleURL !== currentURL;

        });


    /* =====================================================
       CURRENT CATEGORY
    ====================================================== */

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


    /* =====================================================
       CURRENT TAGS
    ====================================================== */

    const currentTags =
        currentArticle &&
        Array.isArray(
            currentArticle.tags
        )
            ? currentArticle.tags
            : [];


    /* =====================================================
       CURRENT KEYWORDS
    ====================================================== */

    const currentKeywords =
        currentArticle &&
        Array.isArray(
            currentArticle.keywords
        )
            ? currentArticle.keywords
            : [];


    /* =====================================================
       SCORE CANDIDATES
    ====================================================== */

    const scoredArticles =
        candidates.map(function (article) {

            let score = 0;


            const articleCategory =
                normalizeText(
                    article.category ||
                    article.section ||
                    ""
                );


            /* ---------------------------------------------
               SAME CATEGORY
            --------------------------------------------- */

            if (
                currentCategory &&
                articleCategory &&
                currentCategory ===
                articleCategory
            ) {

                score += 50;

            }


            /* ---------------------------------------------
               TAG MATCHES
            --------------------------------------------- */

            const articleTags =
                Array.isArray(article.tags)
                    ? article.tags
                    : [];


            currentTags.forEach(
                function (currentTag) {

                    const normalizedCurrentTag =
                        normalizeText(
                            currentTag
                        );


                    articleTags.forEach(
                        function (articleTag) {

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


            /* ---------------------------------------------
               KEYWORD MATCHES
            --------------------------------------------- */

            const articleKeywords =
                Array.isArray(
                    article.keywords
                )
                    ? article.keywords
                    : [];


            currentKeywords.forEach(
                function (keyword) {

                    const normalizedKeyword =
                        normalizeText(
                            keyword
                        );


                    articleKeywords.forEach(
                        function (articleKeyword) {

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


            /* ---------------------------------------------
               SAME CATEGORY URL
            --------------------------------------------- */

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


            /* ---------------------------------------------
               RECENCY BONUS
            --------------------------------------------- */

            const publishedDate =
                parseArticleDate(
                    article.datePublished
                );


            if (publishedDate) {

                const age =
                    Date.now() -
                    publishedDate.getTime();


                const days =
                    age /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    );


                if (days < 180) {

                    score += 3;

                }

            }


            return {
                article: article,
                score: score
            };

        });


    /* =====================================================
       SORT
    ====================================================== */

    scoredArticles.sort(
        function (a, b) {

            /*
             * Higher relevance first.
             */

            if (
                b.score !==
                a.score
            ) {

                return (
                    b.score -
                    a.score
                );

            }


            /*
             * Newer publication first.
             */

            return compareDates(
                b.article,
                a.article
            );

        }
    );


    /* =====================================================
       MEANINGFUL RELATED ARTICLES
    ====================================================== */

    const meaningful =
        scoredArticles.filter(
            function (item) {

                return item.score > 0;

            }
        );


    /*
     * Prefer meaningful matches when at least
     * three are available.
     *
     * Otherwise fill the cards with the
     * latest published articles.
     */

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
            function (item) {

                return item.article;

            }
        );

}


/* =========================================================
   PARSE ARTICLE DATE
   ========================================================== */

function parseArticleDate(
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
   COMPARE DATES
   ========================================================== */

function compareDates(
    articleA,
    articleB
) {

    const dateA =
        parseArticleDate(
            articleA.datePublished ||
            articleA.dateModified
        );


    const dateB =
        parseArticleDate(
            articleB.datePublished ||
            articleB.dateModified
        );


    const timestampA =
        dateA
            ? dateA.getTime()
            : 0;


    const timestampB =
        dateB
            ? dateB.getTime()
            : 0;


    return (
        timestampA -
        timestampB
    );

}


/* =========================================================
   GET CATEGORY FROM URL
   ========================================================== */

function getCategoryFromURL(
    url
) {

    const parts =
        normalizeURL(url)
            .split("/")
            .filter(Boolean);


    /*
     * Expected:
     *
     * /articles/electrical-fundamentals/ohms-law/
     *
     * parts[0] = articles
     * parts[1] = category
     */

    if (
        parts.length >= 2 &&
        parts[0] === "articles"
    ) {

        return parts[1];

    }


    return "";

}


/* =========================================================
   NORMALIZE TEXT
   ========================================================== */

function normalizeText(
    value
) {

    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

}


/* =========================================================
   SLUGIFY
   ========================================================== */

function slugify(
    value
) {

    return String(value || "")
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

}


/* =========================================================
   RENDER RELATED ARTICLES
   ========================================================== */

function renderRelatedArticles(
    container,
    articles
) {

    /*
     * Always clear the container.
     */

    container.innerHTML = "";


    /*
     * Nothing available.
     */

    if (
        !articles ||
        !articles.length
    ) {

        const emptyMessage =
            document.createElement("p");


        emptyMessage.className =
            "related-empty";


        emptyMessage.textContent =
            "More articles will be available soon.";


        container.appendChild(
            emptyMessage
        );


        return;

    }


    articles.forEach(
        function (article) {

            const card =
                createRelatedCard(
                    article
                );


            if (card) {

                container.appendChild(
                    card
                );

            }

        }
    );

}


/* =========================================================
   CREATE RELATED ARTICLE CARD
   ========================================================== */

function createRelatedCard(
    article
) {

    const articleURL =
        normalizeURL(
            article.url ||
            article.path ||
            ""
        );


    if (
        !articleURL ||
        articleURL === "/"
    ) {

        return null;

    }


    const card =
        document.createElement("a");


    card.className =
        "related-card";


    card.href =
        articleURL;


    /*
     * Add accessible label.
     */

    card.setAttribute(
        "aria-label",
        article.title ||
        "Open article"
    );


    /* =====================================================
       CATEGORY
    ====================================================== */

    const category =
        document.createElement("div");


    category.className =
        "related-card-category";


    category.textContent =
        article.categoryName ||
        article.category ||
        article.section ||
        "Electrical Engineering";


    /* =====================================================
       TITLE
    ====================================================== */

    const title =
        document.createElement("h3");


    title.textContent =
        article.title ||
        "Electrical Engineering Article";


    /* =====================================================
       DESCRIPTION
    ====================================================== */

    const description =
        document.createElement("p");


    description.className =
        "related-card-description";


    description.textContent =
        article.excerpt ||
        article.description ||
        "";


    /* =====================================================
       OPTIONAL DATE
    ====================================================== */

    const date =
        parseArticleDate(
            article.datePublished
        );


    let meta = null;


    if (date) {

        meta =
            document.createElement("div");


        meta.className =
            "related-card-meta";


        meta.textContent =
            formatArticleDate(
                date
            );

    }


    /* =====================================================
       BUILD CARD
    ====================================================== */

    card.appendChild(
        category
    );


    card.appendChild(
        title
    );


    if (
        description.textContent
    ) {

        card.appendChild(
            description
        );

    }


    if (meta) {

        card.appendChild(
            meta
        );

    }


    return card;

}


/* =========================================================
   FORMAT DATE
   ========================================================== */

function formatArticleDate(
    date
) {

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
   GOOGLE ANALYTICS
   ========================================================== */

document.addEventListener(
    "click",
    function (event) {

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
