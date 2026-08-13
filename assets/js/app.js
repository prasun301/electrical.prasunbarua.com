/* =========================================================
   ELECTRICAL ENGINEERING BY PRASUN BARUA
   ARTICLE APPLICATION JAVASCRIPT

   Features:
   - Mobile navigation
   - Article sidebar
   - Search
   - Dynamic latest article loading
   - Related articles
   - Social sharing
   - Copy article URL
   - Native Web Share
   - Reading progress
   - Automatic active navigation
   ========================================================= */

"use strict";


/* =========================================================
   GLOBAL CONFIGURATION
   ========================================================= */

const SITE_CONFIG = {

    siteName: "Electrical Engineering by Prasun Barua",

    siteUrl: window.location.origin,

    articlesFile: "/articles.json",

    maxRelatedArticles: 4,

    maxLatestArticles: 4

};


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeMobileMenu();

    initializeSidebar();

    initializeSearch();

    initializeLatestArticles();

    initializeSocialSharing();

    initializeCopyLink();

    initializeNativeShare();

    initializeReadingProgress();

    initializeSmoothAnchors();

});


/* =========================================================
   MOBILE MENU
   ========================================================= */

function initializeMobileMenu() {

    const menuButton =
        document.querySelector(".mobile-menu-button");

    const sidebar =
        document.querySelector(".article-sidebar");

    const overlay =
        document.querySelector(".sidebar-overlay");

    if (!menuButton || !sidebar) {
        return;
    }


    function openMenu() {

        sidebar.classList.add("active");

        if (overlay) {
            overlay.classList.add("active");
        }

        menuButton.setAttribute(
            "aria-expanded",
            "true"
        );

        document.body.classList.add(
            "sidebar-open"
        );

    }


    function closeMenu() {

        sidebar.classList.remove("active");

        if (overlay) {
            overlay.classList.remove("active");
        }

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

        document.body.classList.remove(
            "sidebar-open"
        );

    }


    menuButton.addEventListener(
        "click",
        () => {

            const isOpen =
                sidebar.classList.contains("active");

            if (isOpen) {

                closeMenu();

            } else {

                openMenu();

            }

        }
    );


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeMenu
        );

    }


    sidebar
        .querySelectorAll("a")
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    if (window.innerWidth <= 900) {

                        closeMenu();

                    }

                }
            );

        });


    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                closeMenu();

            }

        }
    );

}


/* =========================================================
   SIDEBAR
   ========================================================= */

function initializeSidebar() {

    const sidebar =
        document.querySelector(".article-sidebar");

    if (!sidebar) {
        return;
    }


    const currentPath =
        normalizePath(
            window.location.pathname
        );


    sidebar
        .querySelectorAll("a")
        .forEach(link => {

            const href =
                link.getAttribute("href");

            if (!href) {
                return;
            }


            const linkPath =
                normalizePath(href);


            if (
                linkPath === currentPath &&
                !link.classList.contains("back-link")
            ) {

                link.classList.add("active");

                link.setAttribute(
                    "aria-current",
                    "page"
                );

            }

        });

}


/* =========================================================
   NORMALIZE URL PATH
   ========================================================= */

function normalizePath(path) {

    if (!path) {
        return "/";
    }


    try {

        const url =
            new URL(
                path,
                window.location.origin
            );


        let cleanPath =
            url.pathname.replace(
                /\/+/g,
                "/"
            );


        if (
            cleanPath.length > 1 &&
            cleanPath.endsWith("/")
        ) {

            cleanPath =
                cleanPath.slice(0, -1);

        }


        return cleanPath.toLowerCase();


    } catch (error) {

        return path
            .replace(/\/+/g, "/")
            .replace(/\/$/, "")
            .toLowerCase();

    }

}


/* =========================================================
   SEARCH
   ========================================================= */

function initializeSearch() {

    const searchInputs =
        document.querySelectorAll(
            ".article-search input, " +
            ".search-box input, " +
            ".search-container input"
        );


    if (!searchInputs.length) {
        return;
    }


    searchInputs.forEach(input => {

        input.addEventListener(
            "input",
            () => {

                const query =
                    input.value
                        .trim()
                        .toLowerCase();


                filterArticleCards(query);

            }
        );

    });

}


/* =========================================================
   FILTER ARTICLE CARDS
   ========================================================= */

function filterArticleCards(query) {

    const cards =
        document.querySelectorAll(
            ".article-card, " +
            ".related-card"
        );


    if (!cards.length) {
        return;
    }


    cards.forEach(card => {

        if (!query) {

            card.hidden = false;

            return;

        }


        const text =
            card.textContent.toLowerCase();


        card.hidden =
            !text.includes(query);

    });

}


/* =========================================================
   LATEST ARTICLES
   ========================================================= */

async function initializeLatestArticles() {

    const container =
        document.getElementById(
            "latest-articles"
        );


    /*
     * If this page does not contain
     * the Latest Articles container,
     * do nothing.
     */

    if (!container) {
        return;
    }


    try {

        const response =
            await fetch(
                SITE_CONFIG.articlesFile,
                {
                    cache: "no-cache"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load articles.json"
            );

        }


        const data =
            await response.json();


        if (
            !data ||
            !Array.isArray(data.articles)
        ) {

            throw new Error(
                "Invalid articles.json format"
            );

        }


        /*
         * Only published articles
         * are shown.
         */

        const publishedArticles =
            data.articles
                .filter(article => {

                    return (
                        article.status ===
                        "published"
                    );

                })
                .filter(article => {

                    return (
                        article.url &&
                        article.title
                    );

                });


        /*
         * Sort newest first.
         */

        publishedArticles.sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.datePublished || 0
                    );

                const dateB =
                    new Date(
                        b.datePublished || 0
                    );


                return dateB - dateA;

            }
        );


        /*
         * Take only the latest
         * configured number.
         */

        const latestArticles =
            publishedArticles.slice(
                0,
                SITE_CONFIG.maxLatestArticles
            );


        /*
         * Clear the existing container.
         */

        container.innerHTML = "";


        /*
         * If there are no published
         * articles, show a message.
         */

        if (!latestArticles.length) {

            container.innerHTML = `
                <p class="article-empty">
                    No published articles yet.
                </p>
            `;

            return;

        }


        /*
         * Create article elements.
         */

        latestArticles.forEach(
            article => {

                const articleElement =
                    document.createElement(
                        "article"
                    );


                articleElement.className =
                    "article-item";


                const articleContent =
                    document.createElement(
                        "div"
                    );


                /*
                 * TITLE
                 */

                const heading =
                    document.createElement(
                        "h3"
                    );


                const titleLink =
                    document.createElement(
                        "a"
                    );


                titleLink.href =
                    article.url;


                titleLink.textContent =
                    article.title;


                heading.appendChild(
                    titleLink
                );


                /*
                 * DESCRIPTION
                 */

                const excerpt =
                    document.createElement(
                        "p"
                    );


                excerpt.className =
                    "article-excerpt";


                excerpt.textContent =
                    article.excerpt ||
                    article.description ||
                    "";


                /*
                 * META
                 */

                const meta =
                    document.createElement(
                        "div"
                    );


                meta.className =
                    "article-meta";


                const category =
                    document.createElement(
                        "span"
                    );


                category.className =
                    "article-category";


                category.textContent =
                    article.categoryName ||
                    "";


                const separator =
                    document.createElement(
                        "span"
                    );


                separator.textContent =
                    "·";


                const readingTime =
                    document.createElement(
                        "span"
                    );


                readingTime.textContent =
                    article.readingTime ||
                    "";


                meta.appendChild(
                    category
                );

                meta.appendChild(
                    separator
                );

                meta.appendChild(
                    readingTime
                );


                /*
                 * Put text content together.
                 */

                articleContent.appendChild(
                    heading
                );

                articleContent.appendChild(
                    excerpt
                );

                articleContent.appendChild(
                    meta
                );


                /*
                 * ARTICLE ICON
                 */

                const thumbnail =
                    document.createElement(
                        "a"
                    );


                thumbnail.href =
                    article.url;


                thumbnail.className =
                    "article-thumb";


                thumbnail.setAttribute(
                    "aria-label",
                    "Read " + article.title
                );


                const icon =
                    document.createElement(
                        "span"
                    );


                icon.className =
                    "material-symbols-rounded";


                icon.textContent =
                    article.icon ||
                    "article";


                thumbnail.appendChild(
                    icon
                );


                /*
                 * Add content to article.
                 */

                articleElement.appendChild(
                    articleContent
                );

                articleElement.appendChild(
                    thumbnail
                );


                /*
                 * Add article to homepage.
                 */

                container.appendChild(
                    articleElement
                );

            }
        );


    } catch (error) {

        console.error(
            "Latest Articles Error:",
            error
        );


        /*
         * Keep the homepage clean if
         * articles.json cannot be loaded.
         */

        container.innerHTML = `
            <p class="article-empty">
                Unable to load latest articles.
            </p>
        `;

    }

}


/* =========================================================
   SOCIAL SHARING
   ========================================================= */

function initializeSocialSharing() {

    const buttons =
        document.querySelectorAll(
            ".share-icon[data-share]"
        );


    if (!buttons.length) {
        return;
    }


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();


                const network =
                    button.dataset.share;


                shareArticle(network);

            }
        );

    });

}


/* =========================================================
   ARTICLE INFORMATION
   ========================================================= */

function getArticleInfo() {

    const canonical =
        document.querySelector(
            'link[rel="canonical"]'
        );


    let url =
        canonical
            ? canonical.href
            : window.location.href;


    url =
        url.split("#")[0];


    const titleElement =
        document.querySelector(
            ".article-title"
        );


    const title =
        titleElement
            ? titleElement.textContent.trim()
            : document.title;


    const descriptionElement =
        document.querySelector(
            ".article-intro"
        );


    const description =
        descriptionElement
            ? descriptionElement.textContent.trim()
            : "";


    const imageElement =
        document.querySelector(
            ".article-feature-image img"
        );


    let image = "";


    if (imageElement) {

        image =
            new URL(
                imageElement.getAttribute("src"),
                window.location.origin
            ).href;

    }


    return {
        url,
        title,
        description,
        image
    };

}


/* =========================================================
   SHARE ARTICLE
   ========================================================= */

function shareArticle(network) {

    const article =
        getArticleInfo();


    const encodedUrl =
        encodeURIComponent(
            article.url
        );


    const encodedTitle =
        encodeURIComponent(
            article.title
        );


    let shareUrl = "";


    switch (network) {

        case "facebook":

            shareUrl =
                "https://www.facebook.com/sharer/sharer.php" +
                "?u=" +
                encodedUrl;

            break;


        case "x":

            shareUrl =
                "https://twitter.com/intent/tweet" +
                "?url=" +
                encodedUrl +
                "&text=" +
                encodedTitle;

            break;


        case "linkedin":

            shareUrl =
                "https://www.linkedin.com/sharing/share-offsite/" +
                "?url=" +
                encodedUrl;

            break;


        case "pinterest":

            shareUrl =
                "https://pinterest.com/pin/create/button/" +
                "?url=" +
                encodedUrl +
                "&description=" +
                encodedTitle;

            if (article.image) {

                shareUrl +=
                    "&media=" +
                    encodeURIComponent(
                        article.image
                    );

            }

            break;


        case "whatsapp":

            shareUrl =
                "https://wa.me/?" +
                "text=" +
                encodeURIComponent(
                    article.title +
                    "\n\n" +
                    article.url
                );

            break;


        case "telegram":

            shareUrl =
                "https://t.me/share/url" +
                "?url=" +
                encodedUrl +
                "&text=" +
                encodedTitle;

            break;


        case "reddit":

            shareUrl =
                "https://www.reddit.com/submit" +
                "?url=" +
                encodedUrl +
                "&title=" +
                encodedTitle;

            break;


        case "email":

            shareUrl =
                "mailto:" +
                "?subject=" +
                encodedTitle +
                "&body=" +
                encodeURIComponent(
                    article.title +
                    "\n\n" +
                    article.url
                );

            break;


        default:

            return;

    }


    if (!shareUrl) {
        return;
    }


    if (network === "email") {

        window.location.href =
            shareUrl;

        return;

    }


    openSharePopup(
        shareUrl,
        network
    );

}


/* =========================================================
   SOCIAL SHARE POPUP
   ========================================================= */

function openSharePopup(
    url,
    network
) {

    const width = 640;

    const height = 620;


    const left =
        Math.max(
            0,
            (window.screen.width - width) / 2
        );


    const top =
        Math.max(
            0,
            (window.screen.height - height) / 2
        );


    const popup =
        window.open(
            url,
            "share_" + network,
            [
                "width=" + width,
                "height=" + height,
                "left=" + left,
                "top=" + top,
                "toolbar=no",
                "menubar=no",
                "location=yes",
                "status=no",
                "resizable=yes",
                "scrollbars=yes"
            ].join(",")
        );


    if (!popup) {

        window.location.href =
            url;

    } else {

        try {

            popup.focus();

        } catch (error) {

            /* Ignore focus errors. */

        }

    }

}


/* =========================================================
   COPY ARTICLE LINK
   ========================================================= */

function initializeCopyLink() {

    const buttons =
        document.querySelectorAll(
            '[data-share="copy"]'
        );


    if (!buttons.length) {
        return;
    }


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            async event => {

                event.preventDefault();

                await copyArticleLink(
                    button
                );

            }
        );

    });

}


/* =========================================================
   COPY LINK
   ========================================================= */

async function copyArticleLink(button) {

    const article =
        getArticleInfo();


    const originalLabel =
        button.getAttribute(
            "aria-label"
        ) ||
        "Copy article link";


    try {

        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {

            await navigator.clipboard.writeText(
                article.url
            );

        } else {

            fallbackCopyText(
                article.url
            );

        }


        button.setAttribute(
            "aria-label",
            "Link copied"
        );


        button.classList.add(
            "copied"
        );


        showShareToast(
            "Article link copied"
        );


        setTimeout(() => {

            button.setAttribute(
                "aria-label",
                originalLabel
            );


            button.classList.remove(
                "copied"
            );

        }, 1800);


    } catch (error) {

        showShareToast(
            "Unable to copy link"
        );

    }

}


/* =========================================================
   FALLBACK COPY
   ========================================================= */

function fallbackCopyText(text) {

    const textarea =
        document.createElement(
            "textarea"
        );


    textarea.value =
        text;


    textarea.style.position =
        "fixed";


    textarea.style.left =
        "-9999px";


    textarea.style.top =
        "0";


    textarea.setAttribute(
        "readonly",
        ""
    );


    document.body.appendChild(
        textarea
    );


    textarea.select();


    textarea.setSelectionRange(
        0,
        textarea.value.length
    );


    const successful =
        document.execCommand(
            "copy"
        );


    document.body.removeChild(
        textarea
    );


    if (!successful) {

        throw new Error(
            "Copy failed"
        );

    }

}


/* =========================================================
   TOAST MESSAGE
   ========================================================= */

function showShareToast(message) {

    let toast =
        document.querySelector(
            ".share-toast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );


        toast.className =
            "share-toast";


        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toast._timer
    );


    toast._timer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 1800);

}


/* =========================================================
   NATIVE WEB SHARE
   ========================================================= */

function initializeNativeShare() {

    const button =
        document.querySelector(
            '[data-share="native"]'
        );


    if (!button) {
        return;
    }


    if (
        typeof navigator.share !==
        "function"
    ) {

        button.style.display =
            "none";

        return;

    }


    button.addEventListener(
        "click",
        async event => {

            event.preventDefault();


            const article =
                getArticleInfo();


            try {

                await navigator.share({

                    title:
                        article.title,

                    text:
                        article.description,

                    url:
                        article.url

                });


            } catch (error) {

                if (
                    error &&
                    error.name !==
                    "AbortError"
                ) {

                    showShareToast(
                        "Sharing was cancelled"
                    );

                }

            }

        }
    );

}


/* =========================================================
   READING PROGRESS
   ========================================================= */

function initializeReadingProgress() {

    const article =
        document.querySelector(
            ".article-content"
        );


    if (!article) {
        return;
    }


    let progressBar =
        document.querySelector(
            ".reading-progress"
        );


    if (!progressBar) {

        progressBar =
            document.createElement(
                "div"
            );


        progressBar.className =
            "reading-progress";


        document.body.appendChild(
            progressBar
        );

    }


    function updateProgress() {

        const rect =
            article.getBoundingClientRect();


        const articleTop =
            window.scrollY +
            rect.top;


        const articleHeight =
            article.offsetHeight;


        const viewportHeight =
            window.innerHeight;


        const current =
            window.scrollY -
            articleTop;


        const total =
            articleHeight -
            viewportHeight;


        let percentage = 0;


        if (total > 0) {

            percentage =
                (current / total) * 100;

        }


        percentage =
            Math.max(
                0,
                Math.min(
                    100,
                    percentage
                )
            );


        progressBar.style.width =
            percentage + "%";

    }


    window.addEventListener(
        "scroll",
        updateProgress,
        {
            passive: true
        }
    );


    window.addEventListener(
        "resize",
        updateProgress
    );


    updateProgress();

}


/* =========================================================
   SMOOTH ANCHOR LINKS
   ========================================================= */

function initializeSmoothAnchors() {

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    const targetId =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !targetId ||
                        targetId === "#"
                    ) {

                        return;

                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (!target) {
                        return;
                    }


                    event.preventDefault();


                    target.scrollIntoView({

                        behavior: "smooth",

                        block: "start"

                    });


                    history.replaceState(
                        null,
                        "",
                        targetId
                    );

                }
            );

        });

}


/* =========================================================
   END OF APPLICATION
   ========================================================= */
