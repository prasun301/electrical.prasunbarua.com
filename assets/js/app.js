/* =========================================================
   ELECTRICAL ENGINEERING BY PRASUN BARUA
   ARTICLE APPLICATION JAVASCRIPT

   Features:
   - Mobile navigation
   - Article sidebar
   - Search
   - Dynamic homepage latest articles
   - Dynamic article loading from articles.json
   - Related articles
   - Social sharing
   - Copy article URL
   - Native Web Share
   - Reading progress
   - Automatic active navigation
   - Smooth anchors
   ========================================================= */

"use strict";


/* =========================================================
   GLOBAL CONFIGURATION
   ========================================================= */

const SITE_CONFIG = {
    siteName: "Electrical Engineering by Prasun Barua",

    siteUrl: window.location.origin,

    articlesFile: "/articles.json",

    maxLatestArticles: 4,

    maxRelatedArticles: 4
};


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeMobileMenu();

    initializeSidebar();

    initializeSearch();

    initializeLatestArticles();

    initializeRelatedArticles();

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
   LOAD ARTICLES JSON
   ========================================================= */

async function loadArticlesData() {

    try {

        const response =
            await fetch(
                SITE_CONFIG.articlesFile,
                {
                    cache: "no-store"
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


        return data;

    } catch (error) {

        console.error(
            "Articles loading error:",
            error
        );

        return null;

    }

}


/* =========================================================
   GET PUBLISHED ARTICLES
   ========================================================= */

function getPublishedArticles(data) {

    if (
        !data ||
        !Array.isArray(data.articles)
    ) {

        return [];

    }


    return data.articles
        .filter(article => {

            return (
                article &&
                article.status === "published" &&
                article.datePublished
            );

        })
        .sort((a, b) => {

            const dateA =
                new Date(
                    a.datePublished
                ).getTime();

            const dateB =
                new Date(
                    b.datePublished
                ).getTime();


            return dateB - dateA;

        });

}


/* =========================================================
   LATEST ARTICLES
   ========================================================= */

async function initializeLatestArticles() {

    /*
     * Look for the dedicated dynamic container first.
     */

    let container =
        document.querySelector(
            "#latest-articles"
        );


    /*
     * Also support:
     *
     * #latest .article-list
     *
     * This makes the script compatible
     * with your existing homepage structure.
     */

    if (!container) {

        container =
            document.querySelector(
                "#latest .article-list"
            );

    }


    if (!container) {
        return;
    }


    const data =
        await loadArticlesData();


    if (!data) {

        showLatestArticlesMessage(
            container,
            "Unable to load articles."
        );

        return;

    }


    const publishedArticles =
        getPublishedArticles(data);


    const latestArticles =
        publishedArticles.slice(
            0,
            SITE_CONFIG.maxLatestArticles
        );


    renderLatestArticles(
        container,
        latestArticles
    );

}


/* =========================================================
   RENDER LATEST ARTICLES
   ========================================================= */

function renderLatestArticles(
    container,
    articles
) {

    /*
     * Remove any old hard-coded
     * article cards.
     */

    container.innerHTML = "";


    if (!articles.length) {

        showLatestArticlesMessage(
            container,
            "No published articles available yet."
        );

        return;

    }


    articles.forEach(article => {

        const item =
            createArticleItem(article);

        container.appendChild(item);

    });

}


/* =========================================================
   CREATE ARTICLE ITEM
   ========================================================= */

function createArticleItem(article) {

    const item =
        document.createElement("article");

    item.className =
        "article-item";


    const content =
        document.createElement("div");


    /*
     * TITLE
     */

    const title =
        document.createElement("h3");


    const titleLink =
        document.createElement("a");


    titleLink.href =
        article.url || "#";


    titleLink.textContent =
        article.title || "Untitled Article";


    title.appendChild(
        titleLink
    );


    /*
     * EXCERPT
     */

    const excerpt =
        document.createElement("p");


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
        document.createElement("div");


    meta.className =
        "article-meta";


    const category =
        document.createElement("span");


    category.className =
        "article-category";


    category.textContent =
        article.categoryName ||
        "Electrical Engineering";


    const separator =
        document.createElement("span");


    separator.textContent =
        "·";


    const readingTime =
        document.createElement("span");


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
     * Add content.
     */

    content.appendChild(
        title
    );


    content.appendChild(
        excerpt
    );


    content.appendChild(
        meta
    );


    /*
     * THUMBNAIL
     */

    const thumb =
        document.createElement("a");


    thumb.href =
        article.url || "#";


    thumb.className =
        "article-thumb";


    thumb.setAttribute(
        "aria-label",
        "Read " +
        (
            article.title ||
            "article"
        )
    );


    const icon =
        document.createElement("span");


    icon.className =
        "material-symbols-rounded";


    icon.textContent =
        article.icon ||
        "article";


    thumb.appendChild(
        icon
    );


    /*
     * Assemble article.
     */

    item.appendChild(
        content
    );


    item.appendChild(
        thumb
    );


    return item;

}


/* =========================================================
   LATEST ARTICLE MESSAGE
   ========================================================= */

function showLatestArticlesMessage(
    container,
    message
) {

    container.innerHTML = "";


    const messageElement =
        document.createElement("p");


    messageElement.className =
        "article-loading-message";


    messageElement.textContent =
        message;


    container.appendChild(
        messageElement
    );

}


/* =========================================================
   RELATED ARTICLES
   ========================================================= */

async function initializeRelatedArticles() {

    const container =
        document.querySelector(
            ".related-articles"
        );


    if (!container) {
        return;
    }


    const data =
        await loadArticlesData();


    if (!data) {
        return;
    }


    const currentPath =
        normalizePath(
            window.location.pathname
        );


    const publishedArticles =
        getPublishedArticles(data);


    const currentArticle =
        publishedArticles.find(
            article => {

                return (
                    normalizePath(
                        article.url
                    ) === currentPath
                );

            }
        );


    if (!currentArticle) {
        return;
    }


    const relatedArticles =
        publishedArticles
            .filter(article => {

                if (
                    normalizePath(
                        article.url
                    ) === currentPath
                ) {

                    return false;

                }


                return (
                    article.category ===
                    currentArticle.category
                );

            })
            .slice(
                0,
                SITE_CONFIG.maxRelatedArticles
            );


    if (!relatedArticles.length) {
        return;
    }


    renderRelatedArticles(
        container,
        relatedArticles
    );

}


/* =========================================================
   RENDER RELATED ARTICLES
   ========================================================= */

function renderRelatedArticles(
    container,
    articles
) {

    container.innerHTML = "";


    articles.forEach(article => {

        const card =
            document.createElement("article");


        card.className =
            "related-card";


        const link =
            document.createElement("a");


        link.href =
            article.url || "#";


        link.textContent =
            article.title ||
            "Untitled Article";


        card.appendChild(
            link
        );


        container.appendChild(
            card
        );

    });

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


                filterArticleCards(
                    query
                );

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
            ".related-card, " +
            ".article-item"
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
            card.textContent
                .toLowerCase();


        card.hidden =
            !text.includes(query);

    });

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


                shareArticle(
                    network
                );

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
                imageElement.getAttribute(
                    "src"
                ),
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
                    article.description +
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
            (
                window.screen.width -
                width
            ) / 2
        );


    const top =
        Math.max(
            0,
            (
                window.screen.height -
                height
            ) / 2
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

async function copyArticleLink(
    button
) {

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


        setTimeout(
            () => {

                button.setAttribute(
                    "aria-label",
                    originalLabel
                );


                button.classList.remove(
                    "copied"
                );

            },
            1800
        );


    } catch (error) {

        console.error(
            "Copy error:",
            error
        );


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
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            1800
        );

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
                (
                    current /
                    total
                ) * 100;

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
