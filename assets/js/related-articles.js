/* =========================================================
   ELECTRICAL ENGINEERING
   RELATED ARTICLES SYSTEM
   ---------------------------------------------------------
   Loads articles.json and displays relevant published
   articles on article pages.

   IMPORTANT:
   Article URLs are used exactly as defined in articles.json.
   No trailing slash is added to .html URLs.
   ========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
========================================================== */

const RELATED_CONFIG = {

    dataURL: "/articles.json",

    containerID: "related-articles",

    maxArticles: 3

};


/* =========================================================
   INITIALIZE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initRelatedArticles();

    }
);


/* =========================================================
   LOAD RELATED ARTICLES
========================================================== */

async function initRelatedArticles() {

    const container =
        document.getElementById(
            RELATED_CONFIG.containerID
        );


    /*
     * This page does not use the related-article system.
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
                "Unable to load articles.json: HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        /*
         * Your articles.json structure is:
         *
         * {
         *   "site": {},
         *   "categories": [],
         *   "articles": []
         * }
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
            normalizeCurrentURL(
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

        console.error(
            "Related articles failed:",
            error
        );

    }

}


/* =========================================================
   NORMALIZE CURRENT PAGE URL
   ---------------------------------------------------------
   Used ONLY for comparison.
   Does NOT modify article href values.
========================================================== */

function normalizeCurrentURL(url) {

    if (!url) {

        return "/";

    }


    let cleanURL =
        String(url)
            .split("?")[0]
            .split("#")[0]
            .replace(/\\/g, "/");


    if (!cleanURL.startsWith("/")) {

        cleanURL =
            "/" + cleanURL;

    }


    cleanURL =
        cleanURL.replace(
            /\/+/g,
            "/"
        );


    /*
     * Remove trailing slash except
     * for the root page.
     */

    if (
        cleanURL.length > 1 &&
        cleanURL.endsWith("/")
    ) {

        cleanURL =
            cleanURL.slice(
                0,
                -1
            );

    }


    return cleanURL;

}


/* =========================================================
   GET ARTICLE URL
   ---------------------------------------------------------
   IMPORTANT:
   Returns the exact URL from articles.json.
========================================================== */

function getArticleURL(article) {

    if (!article) {

        return "";

    }


    return String(
        article.url ||
        article.path ||
        ""
    ).trim();

}


/* =========================================================
   FIND CURRENT ARTICLE
========================================================== */

function findCurrentArticle(
    articles,
    currentURL
) {

    return articles.find(
        function (article) {

            const articleURL =
                normalizeCurrentURL(
                    getArticleURL(article)
                );


            return (
                articleURL ===
                currentURL
            );

        }
    ) || null;

}


/* =========================================================
   GET RELATED ARTICLES
========================================================== */

function getRelatedArticles(
    articles,
    currentArticle,
    currentURL
) {

    const now =
        new Date();


    /*
     * Only published, dated, non-future articles.
     */

    const candidates =
        articles.filter(
            function (article) {

                if (!article) {

                    return false;

                }


                /*
                 * Only published articles.
                 */

                if (
                    String(
                        article.status || ""
                    ).toLowerCase() !==
                    "published"
                ) {

                    return false;

                }


                /*
                 * Must have a valid URL.
                 */

                const articleURL =
                    getArticleURL(
                        article
                    );


                if (!articleURL) {

                    return false;

                }


                /*
                 * Must have publication date.
                 */

                if (!article.datePublished) {

                    return false;

                }


                const publishedDate =
                    parseArticleDate(
                        article.datePublished
                    );


                if (!publishedDate) {

                    return false;

                }


                /*
                 * Do not show future articles.
                 */

                if (
                    publishedDate >
                    now
                ) {

                    return false;

                }


                /*
                 * Remove current article.
                 */

                const normalizedArticleURL =
                    normalizeCurrentURL(
                        articleURL
                    );


                if (
                    normalizedArticleURL ===
                    currentURL
                ) {

                    return false;

                }


                return true;

            }
        );


    /*
     * Current category.
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
     * Current tags.
     */

    const currentTags =
        currentArticle &&
        Array.isArray(
            currentArticle.tags
        )
            ? currentArticle.tags
            : [];


    /*
     * Score articles.
     */

    const scored =
        candidates.map(
            function (article) {

                let score = 0;


                const category =
                    normalizeText(
                        article.category ||
                        article.section ||
                        ""
                    );


                /*
                 * Same category.
                 */

                if (
                    currentCategory &&
                    category &&
                    currentCategory ===
                    category
                ) {

                    score += 50;

                }


                /*
                 * Tag matches.
                 */

                const tags =
                    Array.isArray(
                        article.tags
                    )
                        ? article.tags
                        : [];


                currentTags.forEach(
                    function (currentTag) {

                        const currentTagText =
                            normalizeText(
                                currentTag
                            );


                        tags.forEach(
                            function (tag) {

                                if (
                                    currentTagText ===
                                    normalizeText(tag)
                                ) {

                                    score += 15;

                                }

                            }
                        );

                    }
                );


                /*
                 * Recency bonus.
                 */

                const date =
                    parseArticleDate(
                        article.datePublished
                    );


                if (date) {

                    const daysOld =
                        (
                            Date.now() -
                            date.getTime()
                        ) /
                        (
                            1000 *
                            60 *
                            60 *
                            24
                        );


                    if (
                        daysOld >= 0 &&
                        daysOld < 180
                    ) {

                        score += 3;

                    }

                }


                return {

                    article: article,

                    score: score

                };

            }
        );


    /*
     * Sort:
     * 1. Relevance
     * 2. Publication date
     */

    scored.sort(
        function (a, b) {

            if (
                b.score !==
                a.score
            ) {

                return (
                    b.score -
                    a.score
                );

            }


            return compareDates(
                b.article,
                a.article
            );

        }
    );


    /*
     * Prefer related articles with
     * a meaningful score.
     */

    const meaningful =
        scored.filter(
            function (item) {

                return item.score > 0;

            }
        );


    const selected =
        meaningful.length >=
        RELATED_CONFIG.maxArticles

            ? meaningful

            : scored;


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
   PARSE DATE
========================================================== */

function parseArticleDate(
    value
) {

    if (!value) {

        return null;

    }


    const date =
        new Date(
            value
        );


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


    return (
        (
            dateB
                ? dateB.getTime()
                : 0
        ) -
        (
            dateA
                ? dateA.getTime()
                : 0
        )
    );

}


/* =========================================================
   CATEGORY FROM URL
========================================================== */

function getCategoryFromURL(
    url
) {

    const parts =
        normalizeCurrentURL(url)
            .split("/")
            .filter(Boolean);


    /*
     * /articles/electrical-calculations/...
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

    return String(
        value || ""
    )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            " "
        );

}


/* =========================================================
   RENDER
========================================================== */

function renderRelatedArticles(
    container,
    articles
) {

    /*
     * Clear existing fallback cards.
     */

    container.innerHTML = "";


    if (
        !articles ||
        !articles.length
    ) {

        const empty =
            document.createElement("p");


        empty.className =
            "related-empty";


        empty.textContent =
            "More related articles will be available soon.";


        container.appendChild(
            empty
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
   CREATE RELATED CARD
========================================================== */

function createRelatedCard(
    article
) {

    /*
     * IMPORTANT:
     * Use the URL EXACTLY as it appears
     * in articles.json.
     */

    const articleURL =
        getArticleURL(
            article
        );


    if (
        !articleURL ||
        articleURL === "#"
    ) {

        return null;

    }


    const card =
        document.createElement("a");


    card.className =
        "related-card";


    /*
     * DO NOT normalize this URL.
     */

    card.setAttribute(
        "href",
        articleURL
    );


    card.setAttribute(
        "aria-label",
        "Read " +
        (
            article.title ||
            "article"
        )
    );


    /*
     * Category
     */

    const category =
        document.createElement("div");


    category.className =
        "related-card-category";


    category.textContent =
        article.categoryName ||
        article.category ||
        "Electrical Engineering";


    /*
     * Title
     */

    const title =
        document.createElement("h3");


    title.textContent =
        article.title ||
        "Electrical Engineering Article";


    /*
     * Description
     */

    const description =
        document.createElement("p");


    description.className =
        "related-card-description";


    description.textContent =
        article.excerpt ||
        article.description ||
        "";


    /*
     * Date
     */

    const publishedDate =
        parseArticleDate(
            article.datePublished
        );


    const meta =
        document.createElement("div");


    meta.className =
        "related-card-meta";


    if (publishedDate) {

        meta.textContent =
            formatArticleDate(
                publishedDate
            );

    }


    /*
     * Build
     */

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


    if (
        meta.textContent
    ) {

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
            typeof window.gtag !==
                "function"
        ) {

            return;

        }


        /*
         * Analytics only.
         *
         * No preventDefault().
         * Therefore the normal link navigation
         * continues normally.
         */

        window.gtag(
            "event",
            "related_article_click",
            {
                article_url:
                    card.href,

                article_title:
                    card.querySelector(
                        "h3"
                    )?.textContent ||
                    ""
            }
        );

    }
);
