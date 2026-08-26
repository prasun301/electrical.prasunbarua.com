/* =========================================================
   ELECTRICAL ENGINEERING
   LATEST ARTICLES
   ---------------------------------------------------------
   Loads /articles.json and displays the newest published
   articles on the homepage.

   Expected HTML:

   <div id="latest-articles"></div>

   Optional:

   <p id="latest-articles-status"></p>

   ========================================================= */

"use strict";


document.addEventListener(
    "DOMContentLoaded",
    initLatestArticles
);


/* =========================================================
   CONFIGURATION
========================================================== */

const LATEST_ARTICLES_CONFIG = {

    dataURL: "/articles.json",

    containerID: "latest-articles",

    statusID: "latest-articles-status",

    maxArticles: 6

};


/* =========================================================
   INITIALIZE
========================================================== */

async function initLatestArticles() {

    const container =
        document.getElementById(
            LATEST_ARTICLES_CONFIG.containerID
        );


    /*
     * Homepage does not contain the container.
     * Nothing to do.
     */

    if (!container) {

        return;

    }


    try {

        setStatus(
            "Loading latest articles..."
        );


        const response =
            await fetch(
                LATEST_ARTICLES_CONFIG.dataURL,
                {
                    cache: "no-cache"
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        /*
         * Your articles.json structure:
         *
         * {
         *   site: {},
         *   categories: [],
         *   articles: []
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


        /*
         * Get published articles only.
         */

        const publishedArticles =
            getPublishedArticles(
                articles
            );


        /*
         * Sort newest first.
         */

        publishedArticles.sort(
            function (a, b) {

                return (
                    getDateValue(b) -
                    getDateValue(a)
                );

            }
        );


        /*
         * Limit number displayed.
         */

        const latestArticles =
            publishedArticles.slice(
                0,
                LATEST_ARTICLES_CONFIG.maxArticles
            );


        renderLatestArticles(
            container,
            latestArticles
        );


        setStatus("");


        console.info(
            "Latest articles loaded:",
            latestArticles
        );


    } catch (error) {

        console.error(
            "Latest articles could not be loaded:",
            error
        );


        container.innerHTML = "";


        setStatus(
            "Latest articles are temporarily unavailable."
        );

    }

}


/* =========================================================
   FILTER PUBLISHED ARTICLES
========================================================== */

function getPublishedArticles(
    articles
) {

    const now =
        new Date();


    return articles.filter(
        function (article) {

            if (!article) {

                return false;

            }


            /*
             * Only explicitly published articles.
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
             * Must have a URL.
             */

            if (
                !String(
                    article.url || ""
                ).trim()
            ) {

                return false;

            }


            /*
             * Must have publication date.
             */

            const date =
                parseArticleDate(
                    article.datePublished
                );


            if (!date) {

                return false;

            }


            /*
             * Do not show future articles.
             */

            if (date > now) {

                return false;

            }


            return true;

        }
    );

}


/* =========================================================
   DATE PARSER
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
   DATE VALUE
========================================================== */

function getDateValue(
    article
) {

    const date =
        parseArticleDate(
            article.datePublished ||
            article.dateModified
        );


    return date
        ? date.getTime()
        : 0;

}


/* =========================================================
   RENDER
========================================================== */

function renderLatestArticles(
    container,
    articles
) {

    /*
     * Clear loading/static content.
     */

    container.innerHTML = "";


    if (
        !articles.length
    ) {

        container.innerHTML = `
            <div class="latest-empty">
                <h3>No published articles yet</h3>
                <p>New electrical engineering articles will appear here.</p>
            </div>
        `;

        return;

    }


    articles.forEach(
        function (article) {

            const card =
                createArticleCard(
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
   CREATE ARTICLE CARD
========================================================== */

function createArticleCard(
    article
) {

    const url =
        String(
            article.url || ""
        ).trim();


    if (!url) {

        return null;

    }


    const card =
        document.createElement("a");


    card.className =
        "latest-article-card";


    /*
     * IMPORTANT:
     * Use the JSON URL exactly as supplied.
     */

    card.href =
        url;


    card.setAttribute(
        "aria-label",
        "Read " +
        (
            article.title ||
            "Electrical engineering article"
        )
    );


    /*
     * IMAGE
     */

    if (
        article.image &&
        String(article.image).trim()
    ) {

        const imageWrapper =
            document.createElement("div");


        imageWrapper.className =
            "latest-article-image";


        const image =
            document.createElement("img");


        image.src =
            article.image;


        image.alt =
            article.title ||
            "Electrical engineering article";


        image.loading =
            "lazy";


        image.decoding =
            "async";


        imageWrapper.appendChild(
            image
        );


        card.appendChild(
            imageWrapper
        );

    }


    /*
     * CONTENT
     */

    const content =
        document.createElement("div");


    content.className =
        "latest-article-content";


    /*
     * CATEGORY
     */

    const category =
        document.createElement("div");


    category.className =
        "latest-article-category";


    category.textContent =
        article.categoryName ||
        article.category ||
        "Electrical Engineering";


    /*
     * TITLE
     */

    const title =
        document.createElement("h3");


    title.textContent =
        article.title ||
        "Electrical Engineering Article";


    /*
     * DESCRIPTION
     */

    const description =
        document.createElement("p");


    description.className =
        "latest-article-description";


    description.textContent =
        article.excerpt ||
        article.description ||
        "";


    /*
     * META
     */

    const meta =
        document.createElement("div");


    meta.className =
        "latest-article-meta";


    const date =
        parseArticleDate(
            article.datePublished
        );


    if (date) {

        const dateSpan =
            document.createElement("span");


        dateSpan.textContent =
            formatDate(
                date
            );


        meta.appendChild(
            dateSpan
        );

    }


    if (
        article.readingTime
    ) {

        const separator =
            document.createElement("span");


        separator.textContent =
            "•";


        separator.setAttribute(
            "aria-hidden",
            "true"
        );


        meta.appendChild(
            separator
        );


        const readingTime =
            document.createElement("span");


        readingTime.textContent =
            article.readingTime;


        meta.appendChild(
            readingTime
        );

    }


    /*
     * BUILD
     */

    content.appendChild(
        category
    );


    content.appendChild(
        title
    );


    if (
        description.textContent
    ) {

        content.appendChild(
            description
        );

    }


    if (
        meta.children.length
    ) {

        content.appendChild(
            meta
        );

    }


    card.appendChild(
        content
    );


    return card;

}


/* =========================================================
   FORMAT DATE
========================================================== */

function formatDate(
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
   STATUS
========================================================== */

function setStatus(
    message
) {

    const status =
        document.getElementById(
            LATEST_ARTICLES_CONFIG.statusID
        );


    if (!status) {

        return;

    }


    status.textContent =
        message;

}
