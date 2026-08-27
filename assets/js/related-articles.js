/* =========================================================
   ELECTRICAL ENGINEERING
   RELATED ARTICLES SYSTEM
   ---------------------------------------------------------
   Loads /articles.json and displays relevant published
   articles on article pages.

   URL handling:
   - Relative URLs from articles.json are converted to
     root-relative URLs for reliable navigation.
   - Absolute http/https URLs are preserved.
   - URL normalization is used only for comparison.
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


    if (!container) {

        return;

    }


    try {

        const response =
            await fetch(
                RELATED_CONFIG.dataURL,
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
                "Unable to load articles.json: HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        /*
         * Support:
         *
         * [
         *   {...},
         *   {...}
         * ]
         *
         * OR
         *
         * {
         *   "articles": [...]
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
   GET ARTICLE URL
   ---------------------------------------------------------
   Converts relative URLs into root-relative URLs.
   Keeps absolute URLs unchanged.
========================================================== */

function getArticleURL(article) {

    if (!article) {

        return "";

    }


    const rawURL =
        String(
            article.url ||
            article.path ||
            ""
        ).trim();


    if (!rawURL) {

        return "";

    }


    /*
     * Absolute URL:
     *
     * https://example.com/article/
     * http://example.com/article/
     */

    if (
        /^https?:\/\//i.test(
            rawURL
        )
    ) {

        return rawURL;

    }


    /*
     * Protocol-relative URL:
     *
     * //example.com/article/
     */

    if (
        rawURL.startsWith("//")
    ) {

        return rawURL;

    }


    /*
     * Root-relative URL:
     *
     * /articles/example/
     */

    if (
        rawURL.startsWith("/")
    ) {

        return rawURL;

    }


    /*
     * Relative URL:
     *
     * articles/example/
     *
     * Convert to:
     *
     * /articles/example/
     */

    return "/" + rawURL;

}


/* =========================================================
   NORMALIZE URL FOR COMPARISON
   ---------------------------------------------------------
   This function does NOT control href values.
========================================================== */

function normalizeCurrentURL(url) {

    if (!url) {

        return "/";

    }


    let cleanURL =
        String(url)
            .trim()
            .split("?")[0]
            .split("#")[0]
            .replace(/\\/g, "/");


    /*
     * Remove domain if a full URL is supplied.
     */

    try {

        if (
            /^https?:\/\//i.test(
                cleanURL
            )
        ) {

            const parsed =
                new URL(cleanURL);


            cleanURL =
                parsed.pathname;

        }

    } catch (error) {

        /*
         * Ignore invalid URL and continue
         * with the original string.
         */

    }


    /*
     * Ensure leading slash.
     */

    if (
        !cleanURL.startsWith("/")
    ) {

        cleanURL =
            "/" + cleanURL;

    }


    /*
     * Remove duplicate slashes.
     */

    cleanURL =
        cleanURL.replace(
            /\/+/g,
            "/"
        );


    /*
     * Remove trailing slash except root.
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
                    getArticleURL(
                        article
                    )
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
     * Only:
     * - published
     * - valid date
     * - non-future
     * - valid URL
     * - not current article
     */

    const candidates =
        articles.filter(
            function (article) {

                if (
                    !article ||
                    typeof article !== "object"
                ) {

                    return false;

                }


                /*
                 * Status
                 */

                if (
                    String(
                        article.status || ""
                    )
                        .trim()
                        .toLowerCase() !==
                    "published"
                ) {

                    return false;

                }


                /*
                 * URL
                 */

                const articleURL =
                    getArticleURL(
                        article
                    );


                if (!articleURL) {

                    return false;

                }


                /*
                 * Publication date
                 */

                if (
                    !article.datePublished
                ) {

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
                 * Never show future articles.
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
       SCORE
    ====================================================== */

    const scored =
        candidates.map(
            function (article) {

                let score = 0;


                const articleCategory =
                    normalizeText(
                        article.category ||
                        article.section ||
                        ""
                    );


                /*
                 * Same category
                 */

                if (
                    currentCategory &&
                    articleCategory &&
                    currentCategory ===
                    articleCategory
                ) {

                    score += 50;

                }


                /*
                 * Matching tags
                 */

                const articleTags =
                    Array.isArray(
                        article.tags
                    )
                        ? article.tags
                        : [];


                currentTags.forEach(
                    function (currentTag) {

                        const currentTagNormalized =
                            normalizeText(
                                currentTag
                            );


                        articleTags.forEach(
                            function (articleTag) {

                                if (
                                    currentTagNormalized ===
                                    normalizeText(
                                        articleTag
                                    )
                                ) {

                                    score += 15;

                                }

                            }
                        );

                    }
                );


                /*
                 * Recency bonus
                 */

                const articleDate =
                    parseArticleDate(
                        article.datePublished
                    );


                if (articleDate) {

                    const ageInDays =
                        (
                            Date.now() -
                            articleDate.getTime()
                        ) /
                        (
                            1000 *
                            60 *
                            60 *
                            24
                        );


                    if (
                        ageInDays >= 0 &&
                        ageInDays < 180
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


    /* =====================================================
       SORT
    ====================================================== */

    scored.sort(
        function (a, b) {

            /*
             * First:
             * relevance score
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
             * Then:
             * newest publication date
             */

            return compareDates(
                b.article,
                a.article
            );

        }
    );


    /* =====================================================
       MEANINGFUL ARTICLES
    ====================================================== */

    const meaningful =
        scored.filter(
            function (item) {

                return (
                    item.score >
                    0
                );

            }
        );


    /*
     * Use meaningful matches when
     * at least three are available.
     *
     * Otherwise use the best available
     * published articles.
     */

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


    /*
     * YYYY-MM-DD is interpreted as
     * local midnight rather than depending
     * on browser UTC parsing behavior.
     */

    const stringValue =
        String(value).trim();


    const match =
        /^(\d{4})-(\d{2})-(\d{2})$/
            .exec(
                stringValue
            );


    if (match) {

        const year =
            Number(
                match[1]
            );


        const month =
            Number(
                match[2]
            );


        const day =
            Number(
                match[3]
            );


        const localDate =
            new Date(
                year,
                month - 1,
                day
            );


        if (
            !Number.isNaN(
                localDate.getTime()
            )
        ) {

            return localDate;

        }

    }


    const date =
        new Date(
            stringValue
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


    const timeA =
        dateA
            ? dateA.getTime()
            : 0;


    const timeB =
        dateB
            ? dateB.getTime()
            : 0;


    return (
        timeA -
        timeB
    );

}


/* =========================================================
   CATEGORY FROM URL
========================================================== */

function getCategoryFromURL(
    url
) {

    const parts =
        normalizeCurrentURL(
            url
        )
            .split("/")
            .filter(Boolean);


    /*
     * Example:
     *
     * /articles/electrical-fundamentals/ohms-law/
     *
     * parts[0] = articles
     * parts[1] = electrical-fundamentals
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
   RENDER RELATED ARTICLES
========================================================== */

function renderRelatedArticles(
    container,
    articles
) {

    /*
     * Remove static fallback cards.
     */

    container.innerHTML = "";


    if (
        !articles ||
        !articles.length
    ) {

        const empty =
            document.createElement(
                "p"
            );


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
   CREATE RELATED ARTICLE CARD
========================================================== */

function createRelatedCard(
    article
) {

    /*
     * Get the corrected navigation URL.
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


    /*
     * Create actual link element.
     */

    const card =
        document.createElement(
            "a"
        );


    card.className =
        "related-card";


    card.href =
        articleURL;


    card.setAttribute(
        "aria-label",
        "Read " +
        (
            article.title ||
            "article"
        )
    );


    /* =====================================================
       CATEGORY
    ====================================================== */

    const category =
        document.createElement(
            "div"
        );


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
        document.createElement(
            "h3"
        );


    title.textContent =
        article.title ||
        "Electrical Engineering Article";


    /* =====================================================
       DESCRIPTION
    ====================================================== */

    const description =
        document.createElement(
            "p"
        );


    description.className =
        "related-card-description";


    description.textContent =
        article.excerpt ||
        article.description ||
        "";


    /* =====================================================
       DATE
    ====================================================== */

    const publishedDate =
        parseArticleDate(
            article.datePublished
        );


    let meta =
        null;


    if (publishedDate) {

        meta =
            document.createElement(
                "div"
            );


        meta.className =
            "related-card-meta";


        meta.textContent =
            formatArticleDate(
                publishedDate
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
            typeof window.gtag !==
                "function"
        ) {

            return;

        }


        /*
         * Analytics only.
         *
         * We deliberately do NOT call
         * preventDefault(), so normal
         * browser navigation continues.
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
