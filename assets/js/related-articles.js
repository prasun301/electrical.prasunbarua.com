/* =========================================================
   ELECTRICAL ENGINEERING
   RELATED ARTICLES SYSTEM

   Site:
   https://electrical.prasunbarua.com/

   Features:
   - Loads articles from articles.json
   - Automatically detects current article
   - Finds related articles
   - Prioritizes same category
   - Uses tags and title relevance
   - Avoids duplicate articles
   - Responsive-friendly HTML
   - Lightweight / no external library
   ========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
   ========================================================= */

const RELATED_ARTICLES_CONFIG = {

    articlesFile: "/articles.json",

    /*
     * Number of related articles to display.
     */
    limit: 4,

    /*
     * The container where related articles
     * will be inserted.
     */
    containerSelector: "#related-articles",

    /*
     * Optional heading.
     */
    heading: "Related Articles"

};


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeRelatedArticles
);


/* =========================================================
   MAIN FUNCTION
   ========================================================= */

async function initializeRelatedArticles() {

    const container =
        document.querySelector(
            RELATED_ARTICLES_CONFIG.containerSelector
        );

    /*
     * If the article page does not contain
     * the related articles container,
     * do nothing.
     */

    if (!container) {
        return;
    }


    try {

        const articles =
            await loadArticles();

        if (!articles.length) {
            return;
        }


        const currentArticle =
            findCurrentArticle(
                articles
            );


        if (!currentArticle) {
            return;
        }


        const relatedArticles =
            findRelatedArticles(
                currentArticle,
                articles
            );


        renderRelatedArticles(
            container,
            relatedArticles
        );


    } catch (error) {

        console.error(
            "Related articles error:",
            error
        );

    }

}


/* =========================================================
   LOAD ARTICLES.JSON
   ========================================================= */

async function loadArticles() {

    const response =
        await fetch(
            RELATED_ARTICLES_CONFIG.articlesFile,
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
     * Support both formats:
     *
     * [
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

        return normalizeArticles(
            data
        );

    }


    if (
        data &&
        Array.isArray(data.articles)
    ) {

        return normalizeArticles(
            data.articles
        );

    }


    throw new Error(
        "Invalid articles.json format."
    );

}


/* =========================================================
   NORMALIZE ARTICLES
   ========================================================= */

function normalizeArticles(articles) {

    return articles.map(
        (article, index) => {

            const category =
                article.category ||
                "Uncategorized";


            const categorySlug =
                article.categorySlug ||
                slugify(category);


            const tags =
                Array.isArray(article.tags)
                    ? article.tags
                    : [];


            return {

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
                    category,

                categorySlug:
                    categorySlug,

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
                    tags

            };

        }
    );

}


/* =========================================================
   FIND CURRENT ARTICLE
   ========================================================= */

function findCurrentArticle(articles) {

    const currentPath =
        normalizePath(
            window.location.pathname
        );


    /*
     * First try exact URL matching.
     */

    let article =
        articles.find(
            item =>
                normalizePath(
                    item.url
                ) === currentPath
        );


    if (article) {
        return article;
    }


    /*
     * Try removing index.html.
     */

    const cleanPath =
        currentPath
            .replace(
                /\/index\.html$/,
                "/"
            );


    article =
        articles.find(
            item =>
                normalizePath(
                    item.url
                ) === cleanPath
        );


    if (article) {
        return article;
    }


    /*
     * Try article slug matching.
     */

    const currentSlug =
        getLastPathSegment(
            currentPath
        );


    article =
        articles.find(
            item => {

                const articleSlug =
                    getArticleSlug(
                        item.url
                    );

                return (
                    articleSlug &&
                    articleSlug === currentSlug
                );

            }
        );


    return article || null;

}


/* =========================================================
   FIND RELATED ARTICLES
   ========================================================= */

function findRelatedArticles(
    currentArticle,
    articles
) {

    const currentCategory =
        String(
            currentArticle.categorySlug || ""
        )
            .toLowerCase();


    const currentTags =
        normalizeTags(
            currentArticle.tags
        );


    const currentTitleWords =
        extractKeywords(
            currentArticle.title
        );


    const candidates =
        articles
            .filter(
                article =>
                    article.id !==
                    currentArticle.id
            )
            .map(
                article => {

                    let score = 0;


                    /*
                     * SAME CATEGORY
                     *
                     * Strongest relevance signal.
                     */

                    if (
                        article.categorySlug &&
                        String(
                            article.categorySlug
                        ).toLowerCase() ===
                        currentCategory
                    ) {

                        score += 100;

                    }


                    /*
                     * MATCHING TAGS
                     */

                    const articleTags =
                        normalizeTags(
                            article.tags
                        );


                    const sharedTags =
                        currentTags.filter(
                            tag =>
                                articleTags.includes(
                                    tag
                                )
                        );


                    score +=
                        sharedTags.length * 25;


                    /*
                     * TITLE KEYWORD MATCHING
                     */

                    const articleTitleWords =
                        extractKeywords(
                            article.title
                        );


                    const sharedTitleWords =
                        currentTitleWords.filter(
                            word =>
                                articleTitleWords.includes(
                                    word
                                )
                        );


                    score +=
                        sharedTitleWords.length * 8;


                    /*
                     * DESCRIPTION MATCHING
                     */

                    const description =
                        String(
                            article.description || ""
                        ).toLowerCase();


                    currentTitleWords.forEach(
                        word => {

                            if (
                                word.length >= 5 &&
                                description.includes(word)
                            ) {

                                score += 2;

                            }

                        }
                    );


                    /*
                     * Slight preference for
                     * newer articles.
                     */

                    const timestamp =
                        parseDate(
                            article.date
                        );


                    if (timestamp > 0) {

                        score +=
                            timestamp /
                            100000000000000;

                    }


                    return {
                        article,
                        score
                    };

                }
            );


    /*
     * Sort by relevance.
     */

    candidates.sort(
        (a, b) =>
            b.score - a.score
    );


    /*
     * Select requested number.
     */

    return candidates
        .slice(
            0,
            RELATED_ARTICLES_CONFIG.limit
        )
        .map(
            item =>
                item.article
        );

}


/* =========================================================
   RENDER RELATED ARTICLES
   ========================================================= */

function renderRelatedArticles(
    container,
    articles
) {

    /*
     * Do not display an empty section.
     */

    if (!articles.length) {

        container.innerHTML = "";

        return;

    }


    const cards =
        articles
            .map(
                article =>
                    createRelatedArticleCard(
                        article
                    )
            )
            .join("");


    container.innerHTML = `

        <section
            class="related-articles-section"
            aria-labelledby="related-articles-title"
        >

            <div class="related-articles-header">

                <span
                    class="related-articles-label"
                >
                    RELATED
                </span>

                <h2
                    id="related-articles-title"
                >
                    ${escapeHTML(
                        RELATED_ARTICLES_CONFIG.heading
                    )}
                </h2>

            </div>

            <div
                class="related-articles-grid"
            >
                ${cards}
            </div>

        </section>

    `;

}


/* =========================================================
   CREATE RELATED ARTICLE CARD
   ========================================================= */

function createRelatedArticleCard(
    article
) {

    const category =
        article.category
            ? `
                <span
                    class="related-article-category"
                >
                    ${escapeHTML(
                        article.category
                    )}
                </span>
              `
            : "";


    const description =
        article.description
            ? `
                <p>
                    ${escapeHTML(
                        shortenText(
                            article.description,
                            130
                        )
                    )}
                </p>
              `
            : "";


    const date =
        article.date
            ? `
                <time
                    datetime="${escapeAttribute(
                        article.date
                    )}"
                >
                    ${formatDate(
                        article.date
                    )}
                </time>
              `
            : "";


    return `

        <article
            class="related-article-card"
        >

            <div
                class="related-article-content"
            >

                ${category}

                <h3>
                    <a
                        href="${escapeAttribute(
                            article.url
                        )}"
                    >
                        ${escapeHTML(
                            article.title
                        )}
                    </a>
                </h3>

                ${description}

                ${
                    date
                        ? `
                            <div
                                class="related-article-meta"
                            >
                                ${date}
                            </div>
                          `
                        : ""
                }

            </div>

            <a
                href="${escapeAttribute(
                    article.url
                )}"
                class="related-article-arrow"
                aria-label="Read ${escapeAttribute(
                    article.title
                )}"
            >
                <span
                    class="material-symbols-rounded"
                    aria-hidden="true"
                >
                    arrow_forward
                </span>
            </a>

        </article>

    `;

}


/* =========================================================
   NORMALIZE PATH
   ========================================================= */

function normalizePath(
    path
) {

    if (!path) {
        return "/";
    }


    let normalized =
        String(path)
            .split("?")[0]
            .split("#")[0];


    /*
     * Remove domain if a full URL is supplied.
     */

    try {

        if (
            normalized.startsWith(
                "http://"
            ) ||
            normalized.startsWith(
                "https://"
            )
        ) {

            normalized =
                new URL(
                    normalized
                ).pathname;

        }

    } catch (error) {
        /* Ignore invalid URL. */
    }


    /*
     * Ensure leading slash.
     */

    if (
        !normalized.startsWith("/")
    ) {

        normalized =
            "/" + normalized;

    }


    /*
     * Convert index.html to directory URL.
     */

    normalized =
        normalized.replace(
            /\/index\.html$/,
            "/"
        );


    /*
     * Remove duplicate slashes.
     */

    normalized =
        normalized.replace(
            /\/{2,}/g,
            "/"
        );


    /*
     * Keep root clean.
     */

    if (
        normalized.length > 1 &&
        !normalized.endsWith("/")
    ) {

        normalized += "/";

    }


    return normalized;

}


/* =========================================================
   GET LAST PATH SEGMENT
   ========================================================= */

function getLastPathSegment(
    path
) {

    const clean =
        normalizePath(
            path
        ).replace(
            /\/$/,
            ""
        );


    const parts =
        clean.split("/");


    return parts[
        parts.length - 1
    ] || "";

}


/* =========================================================
   GET ARTICLE SLUG
   ========================================================= */

function getArticleSlug(
    url
) {

    return getLastPathSegment(
        url
    )
        .replace(
            /\.html$/,
            ""
        )
        .toLowerCase();

}


/* =========================================================
   NORMALIZE TAGS
   ========================================================= */

function normalizeTags(
    tags
) {

    if (!Array.isArray(tags)) {
        return [];
    }


    return tags
        .map(
            tag =>
                String(tag)
                    .toLowerCase()
                    .trim()
        )
        .filter(Boolean);

}


/* =========================================================
   EXTRACT TITLE KEYWORDS
   ========================================================= */

function extractKeywords(
    text
) {

    const stopWords = new Set([

        "about",
        "after",
        "again",
        "also",
        "because",
        "being",
        "between",
        "calculate",
        "calculation",
        "does",
        "from",
        "have",
        "how",
        "into",
        "more",
        "that",
        "than",
        "their",
        "there",
        "these",
        "this",
        "using",
        "what",
        "when",
        "where",
        "which",
        "with",
        "your"

    ]);


    return String(
        text || ""
    )
        .toLowerCase()
        .replace(
            /[^a-z0-9\s-]/g,
            " "
        )
        .split(
            /\s+/
        )
        .map(
            word =>
                word.trim()
        )
        .filter(
            word =>
                word.length >= 4 &&
                !stopWords.has(word)
        );

}


/* =========================================================
   PARSE DATE
   ========================================================= */

function parseDate(
    date
) {

    if (!date) {
        return 0;
    }


    const timestamp =
        Date.parse(
            date
        );


    return Number.isNaN(
        timestamp
    )
        ? 0
        : timestamp;

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(
    date
) {

    const timestamp =
        parseDate(
            date
        );


    if (!timestamp) {
        return date;
    }


    return new Intl.DateTimeFormat(
        "en",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    ).format(
        new Date(
            timestamp
        )
    );

}


/* =========================================================
   SHORTEN TEXT
   ========================================================= */

function shortenText(
    text,
    maxLength
) {

    const value =
        String(
            text || ""
        ).trim();


    if (
        value.length <= maxLength
    ) {

        return value;

    }


    const shortened =
        value.substring(
            0,
            maxLength
        );


    const lastSpace =
        shortened.lastIndexOf(
            " "
        );


    if (lastSpace > 0) {

        return (
            shortened.substring(
                0,
                lastSpace
            ) + "…"
        );

    }


    return shortened + "…";

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
    value
) {

    return String(
        value
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
   ESCAPE ATTRIBUTE
   ========================================================= */

function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}


/* =========================================================
   OPTIONAL PUBLIC API
   ========================================================= */

window.RelatedArticles = {

    reload:
        initializeRelatedArticles,

    find:
        findRelatedArticles

};
