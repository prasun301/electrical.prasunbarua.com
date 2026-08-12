"use strict";

/* =========================================================
   AUTOMATIC RELATED ARTICLES
   Electrical Engineering by Prasun Barua
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const relatedContainer =
        document.getElementById("related-articles");

    if (!relatedContainer) {
        return;
    }

    /*
     * Load the central article database
     */
    fetch("/articles.json")
        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Unable to load articles.json"
                );
            }

            return response.json();
        })

        .then(articles => {

            if (!Array.isArray(articles) ||
                articles.length === 0) {

                return;
            }

            /*
             * Current page URL
             */
            const currentUrl =
                window.location.pathname
                    .replace(/\/+$/, "");

            /*
             * Find current article
             */
            const currentArticle =
                articles.find(article => {

                    const articleUrl =
                        new URL(
                            article.url,
                            window.location.origin
                        ).pathname
                        .replace(/\/+$/, "");

                    return articleUrl === currentUrl;
                });

            /*
             * If current article isn't found,
             * don't generate anything.
             */
            if (!currentArticle) {
                return;
            }

            /*
             * Normalize tags
             */
            const currentTags =
                (currentArticle.tags || [])
                    .map(tag =>
                        tag.toLowerCase().trim()
                    );

            const currentCategory =
                (currentArticle.category || "")
                    .toLowerCase()
                    .trim();

            /*
             * Remove current article
             */
            const otherArticles =
                articles.filter(article => {

                    const articleUrl =
                        new URL(
                            article.url,
                            window.location.origin
                        ).pathname
                        .replace(/\/+$/, "");

                    return articleUrl !== currentUrl;
                });

            /*
             * Calculate relevance score
             */
            const scoredArticles =
                otherArticles.map(article => {

                    let score = 0;

                    const articleCategory =
                        (article.category || "")
                            .toLowerCase()
                            .trim();

                    const articleTags =
                        (article.tags || [])
                            .map(tag =>
                                tag.toLowerCase().trim()
                            );

                    /*
                     * Same category
                     */
                    if (
                        currentCategory &&
                        articleCategory === currentCategory
                    ) {
                        score += 10;
                    }

                    /*
                     * Matching tags
                     */
                    articleTags.forEach(tag => {

                        if (currentTags.includes(tag)) {
                            score += 5;
                        }

                    });

                    /*
                     * Title word matching
                     */
                    const titleWords =
                        (currentArticle.title || "")
                            .toLowerCase()
                            .split(/\W+/)
                            .filter(word =>
                                word.length > 3
                            );

                    const articleTitle =
                        (article.title || "")
                            .toLowerCase();

                    titleWords.forEach(word => {

                        if (
                            articleTitle.includes(word)
                        ) {
                            score += 2;
                        }

                    });

                    return {
                        ...article,
                        score
                    };

                });

            /*
             * Sort by relevance
             */
            scoredArticles.sort(
                (a, b) => b.score - a.score
            );

            /*
             * Only show relevant articles
             */
            const relatedArticles =
                scoredArticles
                    .filter(article =>
                        article.score > 0
                    )
                    .slice(0, 4);

            /*
             * Nothing relevant found
             */
            if (relatedArticles.length === 0) {

                relatedContainer
                    .closest("section")
                    ?.remove();

                return;
            }

            /*
             * Generate HTML
             */
            relatedContainer.innerHTML =
                relatedArticles
                    .map(article => {

                        return `
                            <a href="${article.url}">
                                ${escapeHtml(article.title)}
                            </a>
                        `;

                    })
                    .join("");

        })

        .catch(error => {

            console.error(
                "Related articles error:",
                error
            );

        });

});


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}
