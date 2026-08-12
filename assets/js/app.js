/* =========================================================
   ELECTRICAL ENGINEERING
   MAIN SITE JAVASCRIPT
   ---------------------------------------------------------
   Site-wide functionality:
   - Mobile navigation
   - Sidebar / overlay
   - Escape-key handling
   - Active navigation
   - Smooth anchor scrolling
   - Header scroll state
   - External link handling
   - Copy buttons
   - Back-to-top button
   - Reading progress
   - Accessible interactions
   ========================================================= */

"use strict";


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initMobileNavigation();

    initActiveNavigation();

    initSmoothScrolling();

    initHeaderScroll();

    initExternalLinks();

    initCopyButtons();

    initBackToTop();

    initReadingProgress();

});


/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

function initMobileNavigation() {

    const menuButton =
        document.getElementById(
            "mobile-menu-button"
        );

    const sidebar =
        document.getElementById(
            "article-sidebar"
        );

    const overlay =
        document.getElementById(
            "sidebar-overlay"
        );


    if (
        !menuButton ||
        !sidebar
    ) {

        return;

    }


    /*
     * Open sidebar.
     */
    function openMenu() {

        document.body.classList.add(
            "menu-open"
        );

        sidebar.classList.add(
            "is-open"
        );


        if (overlay) {

            overlay.classList.add(
                "is-visible"
            );

            overlay.setAttribute(
                "aria-hidden",
                "false"
            );

        }


        menuButton.setAttribute(
            "aria-expanded",
            "true"
        );


        menuButton.setAttribute(
            "aria-label",
            "Close navigation menu"
        );


        /*
         * Prevent page scrolling while
         * mobile navigation is open.
         */
        document.body.style.overflow =
            "hidden";

    }


    /*
     * Close sidebar.
     */
    function closeMenu() {

        document.body.classList.remove(
            "menu-open"
        );

        sidebar.classList.remove(
            "is-open"
        );


        if (overlay) {

            overlay.classList.remove(
                "is-visible"
            );

            overlay.setAttribute(
                "aria-hidden",
                "true"
            );

        }


        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );


        menuButton.setAttribute(
            "aria-label",
            "Open navigation menu"
        );


        document.body.style.overflow =
            "";

    }


    /*
     * Toggle.
     */
    menuButton.addEventListener(
        "click",
        () => {

            const isOpen =
                document.body.classList.contains(
                    "menu-open"
                );


            if (isOpen) {

                closeMenu();

            } else {

                openMenu();

            }

        }
    );


    /*
     * Overlay closes menu.
     */
    if (overlay) {

        overlay.addEventListener(
            "click",
            closeMenu
        );

    }


    /*
     * Clicking a sidebar link closes
     * the mobile menu.
     */
    sidebar
        .querySelectorAll("a")
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    closeMenu();

                }
            );

        });


    /*
     * Escape closes menu.
     */
    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                document.body.classList.contains(
                    "menu-open"
                )
            ) {

                closeMenu();

                menuButton.focus();

            }

        }
    );


    /*
     * If screen becomes desktop size,
     * reset mobile menu state.
     */
    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 900
            ) {

                closeMenu();

            }

        }
    );

}


/* =========================================================
   ACTIVE NAVIGATION
   ========================================================= */

function initActiveNavigation() {

    const currentPath =
        normalizePath(
            window.location.pathname
        );


    /*
     * Main navigation.
     */
    document
        .querySelectorAll(
            ".main-nav a"
        )
        .forEach(link => {

            const linkPath =
                normalizePath(
                    new URL(
                        link.href,
                        window.location.origin
                    ).pathname
                );


            if (
                linkPath === currentPath
            ) {

                link.classList.add(
                    "active"
                );

                link.setAttribute(
                    "aria-current",
                    "page"
                );

            } else {

                link.classList.remove(
                    "active"
                );

                link.removeAttribute(
                    "aria-current"
                );

            }

        });


    /*
     * Article sidebar.
     *
     * Do not mark the generic
     * "All Articles" link active
     * when inside an individual article.
     */
    document
        .querySelectorAll(
            ".article-sidebar nav a"
        )
        .forEach(link => {

            const href =
                link.getAttribute(
                    "href"
                );


            if (!href) {
                return;
            }


            const linkPath =
                normalizePath(
                    new URL(
                        href,
                        window.location.origin
                    ).pathname
                );


            if (
                linkPath !== "/" &&
                linkPath === currentPath
            ) {

                link.classList.add(
                    "active"
                );

                link.setAttribute(
                    "aria-current",
                    "page"
                );

            }

        });

}


/* =========================================================
   PATH NORMALIZATION
   ========================================================= */

function normalizePath(path) {

    if (!path) {
        return "/";
    }


    let normalized =
        path.split("?")[0];


    normalized =
        normalized.split("#")[0];


    normalized =
        normalized.replace(
            /\/+/g,
            "/"
        );


    /*
     * Root stays "/".
     */
    if (normalized === "/") {
        return "/";
    }


    /*
     * Add trailing slash for
     * directory-style URLs.
     */
    if (
        !normalized.endsWith("/") &&
        !normalized.includes(".")
    ) {

        normalized += "/";

    }


    return normalized;

}


/* =========================================================
   SMOOTH ANCHOR SCROLLING
   ========================================================= */

function initSmoothScrolling() {

    document
        .querySelectorAll(
            'a[href*="#"]'
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    const href =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !href ||
                        href === "#"
                    ) {

                        return;

                    }


                    let url;


                    try {

                        url =
                            new URL(
                                href,
                                window.location.href
                            );

                    } catch {

                        return;

                    }


                    /*
                     * Only smooth-scroll when
                     * the link points to this page.
                     */
                    if (
                        url.pathname !==
                        window.location.pathname
                    ) {

                        return;

                    }


                    const targetID =
                        url.hash.substring(1);


                    if (!targetID) {
                        return;
                    }


                    const target =
                        document.getElementById(
                            decodeURIComponent(
                                targetID
                            )
                        );


                    if (!target) {
                        return;
                    }


                    event.preventDefault();


                    const header =
                        document.querySelector(
                            ".site-header"
                        );


                    const headerHeight =
                        header
                            ? header.offsetHeight
                            : 0;


                    const targetPosition =
                        target.getBoundingClientRect()
                            .top +
                        window.scrollY -
                        headerHeight -
                        20;


                    window.scrollTo({
                        top:
                            Math.max(
                                0,
                                targetPosition
                            ),
                        behavior:
                            "smooth"
                    });


                    /*
                     * Update URL without
                     * forcing browser jump.
                     */
                    history.pushState(
                        null,
                        "",
                        "#" + targetID
                    );

                }
            );

        });

}


/* =========================================================
   HEADER SCROLL EFFECT
   ========================================================= */

function initHeaderScroll() {

    const header =
        document.querySelector(
            ".site-header"
        );


    if (!header) {
        return;
    }


    let ticking = false;


    function updateHeader() {

        const scrollY =
            window.scrollY ||
            window.pageYOffset;


        if (scrollY > 10) {

            header.classList.add(
                "is-scrolled"
            );

        } else {

            header.classList.remove(
                "is-scrolled"
            );

        }


        ticking = false;

    }


    window.addEventListener(
        "scroll",
        () => {

            if (!ticking) {

                window.requestAnimationFrame(
                    updateHeader
                );

                ticking = true;

            }

        },
        {
            passive: true
        }
    );


    updateHeader();

}


/* =========================================================
   EXTERNAL LINKS
   ========================================================= */

function initExternalLinks() {

    document
        .querySelectorAll(
            'a[href^="http://"], a[href^="https://"]'
        )
        .forEach(link => {

            let url;


            try {

                url =
                    new URL(
                        link.href
                    );

            } catch {

                return;

            }


            /*
             * Ignore links pointing to
             * our own website.
             */
            if (
                url.hostname ===
                window.location.hostname
            ) {

                return;

            }


            /*
             * Security for links opened
             * in a new tab.
             */
            if (
                link.target === "_blank"
            ) {

                const currentRel =
                    link.getAttribute(
                        "rel"
                    ) || "";


                const relValues =
                    new Set(
                        currentRel
                            .split(/\s+/)
                            .filter(Boolean)
                    );


                relValues.add(
                    "noopener"
                );

                relValues.add(
                    "noreferrer"
                );


                link.setAttribute(
                    "rel",
                    Array.from(
                        relValues
                    ).join(" ")
                );

            }

        });

}


/* =========================================================
   COPY BUTTONS
   ========================================================= */

function initCopyButtons() {

    document
        .querySelectorAll(
            "[data-copy]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const value =
                        button.dataset.copy;


                    if (!value) {
                        return;
                    }


                    try {

                        await copyText(
                            value
                        );


                        showTemporaryButtonText(
                            button,
                            "Copied!"
                        );


                    } catch {

                        showTemporaryButtonText(
                            button,
                            "Copy failed"
                        );

                    }

                }
            );

        });

}


/* =========================================================
   COPY TEXT
   ========================================================= */

async function copyText(text) {

    /*
     * Modern Clipboard API.
     */
    if (
        navigator.clipboard &&
        window.isSecureContext
    ) {

        await navigator.clipboard.writeText(
            text
        );

        return;

    }


    /*
     * Fallback for older browsers.
     */
    const textarea =
        document.createElement(
            "textarea"
        );


    textarea.value =
        text;


    textarea.setAttribute(
        "readonly",
        ""
    );


    textarea.style.position =
        "fixed";

    textarea.style.opacity =
        "0";

    textarea.style.pointerEvents =
        "none";


    document.body.appendChild(
        textarea
    );


    textarea.select();


    const successful =
        document.execCommand(
            "copy"
        );


    textarea.remove();


    if (!successful) {

        throw new Error(
            "Copy operation failed."
        );

    }

}


/* =========================================================
   TEMPORARY BUTTON MESSAGE
   ========================================================= */

function showTemporaryButtonText(
    button,
    message
) {

    if (!button) {
        return;
    }


    const originalText =
        button.dataset.originalText ||
        button.textContent;


    if (
        !button.dataset.originalText
    ) {

        button.dataset.originalText =
            originalText;

    }


    button.textContent =
        message;


    button.classList.add(
        "is-success"
    );


    window.setTimeout(
        () => {

            button.textContent =
                originalText;


            button.classList.remove(
                "is-success"
            );

        },
        1600
    );

}


/* =========================================================
   BACK TO TOP
   ---------------------------------------------------------
   Automatically creates a button if one does not
   already exist in the HTML.
   ========================================================= */

function initBackToTop() {

    let button =
        document.getElementById(
            "back-to-top"
        );


    /*
     * Create button automatically.
     */
    if (!button) {

        button =
            document.createElement(
                "button"
            );


        button.id =
            "back-to-top";


        button.type =
            "button";


        button.className =
            "back-to-top";


        button.setAttribute(
            "aria-label",
            "Back to top"
        );


        button.innerHTML =
            '<span class="material-symbols-rounded" aria-hidden="true">arrow_upward</span>';


        document.body.appendChild(
            button
        );

    }


    /*
     * Click behavior.
     */
    button.addEventListener(
        "click",
        () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );


    /*
     * Visibility.
     */
    let ticking = false;


    function updateButton() {

        if (
            window.scrollY > 500
        ) {

            button.classList.add(
                "is-visible"
            );

        } else {

            button.classList.remove(
                "is-visible"
            );

        }


        ticking = false;

    }


    window.addEventListener(
        "scroll",
        () => {

            if (!ticking) {

                window.requestAnimationFrame(
                    updateButton
                );

                ticking = true;

            }

        },
        {
            passive: true
        }
    );


    updateButton();

}


/* =========================================================
   ARTICLE READING PROGRESS
   ---------------------------------------------------------
   Automatically creates a thin progress bar on
   article pages.
   ========================================================= */

function initReadingProgress() {

    const article =
        document.querySelector(
            ".article-content"
        );


    if (!article) {
        return;
    }


    let progress =
        document.getElementById(
            "reading-progress"
        );


    if (!progress) {

        progress =
            document.createElement(
                "div"
            );


        progress.id =
            "reading-progress";


        progress.className =
            "reading-progress";


        progress.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.appendChild(
            progress
        );

    }


    let ticking = false;


    function updateProgress() {

        const articleTop =
            article.getBoundingClientRect()
                .top +
            window.scrollY;


        const articleHeight =
            article.offsetHeight;


        const viewportHeight =
            window.innerHeight;


        const scrollable =
            articleHeight -
            viewportHeight;


        if (
            scrollable <= 0
        ) {

            progress.style.transform =
                "scaleX(1)";

            ticking = false;

            return;

        }


        const current =
            window.scrollY -
            articleTop;


        const percentage =
            Math.min(
                1,
                Math.max(
                    0,
                    current /
                    scrollable
                )
            );


        progress.style.transform =
            `scaleX(${percentage})`;


        ticking = false;

    }


    window.addEventListener(
        "scroll",
        () => {

            if (!ticking) {

                window.requestAnimationFrame(
                    updateProgress
                );

                ticking = true;

            }

        },
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
   ARTICLE EXTERNAL SHARE LINKS
   ---------------------------------------------------------
   Supports any element using:
   data-share-url="..."
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-share-url]"
            );


        if (!button) {
            return;
        }


        const shareURL =
            button.dataset.shareUrl;


        if (!shareURL) {
            return;
        }


        event.preventDefault();


        window.open(
            shareURL,
            "_blank",
            "noopener,noreferrer,width=700,height=600"
        );

    }
);


/* =========================================================
   IMAGE ERROR HANDLING
   ---------------------------------------------------------
   Prevents broken images from producing ugly
   browser placeholders.
   ========================================================= */

document
    .querySelectorAll("img")
    .forEach(image => {

        image.addEventListener(
            "error",
            () => {

                image.classList.add(
                    "image-error"
                );

            }
        );

    });


/* =========================================================
   LAZY IMAGE LOADING
   ---------------------------------------------------------
   Images without an explicit loading attribute become
   lazy-loaded, except important hero images.
   ========================================================= */

function initLazyImages() {

    document
        .querySelectorAll(
            "img"
        )
        .forEach(image => {

            /*
             * Do not alter images that explicitly
             * request eager/high-priority loading.
             */
            if (
                image.hasAttribute(
                    "fetchpriority"
                ) ||
                image.loading === "eager"
            ) {

                return;

            }


            if (
                !image.hasAttribute(
                    "loading"
                )
            ) {

                image.loading =
                    "lazy";

            }


            if (
                !image.hasAttribute(
                    "decoding"
                )
            ) {

                image.decoding =
                    "async";

            }

        });

}


initLazyImages();


/* =========================================================
   TABLE RESPONSIVENESS
   ---------------------------------------------------------
   Adds a wrapper around tables that do not already
   have one.
   ========================================================= */

function initResponsiveTables() {

    document
        .querySelectorAll(
            ".article-content table"
        )
        .forEach(table => {

            /*
             * Already wrapped.
             */
            if (
                table.parentElement.classList.contains(
                    "article-table-wrapper"
                )
            ) {

                return;

            }


            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "article-table-wrapper";


            table.parentNode.insertBefore(
                wrapper,
                table
            );


            wrapper.appendChild(
                table
            );

        });

}


initResponsiveTables();


/* =========================================================
   CURRENT YEAR
   ---------------------------------------------------------
   Allows footer text to use:
   <span data-current-year></span>
   ========================================================= */

function initCurrentYear() {

    const year =
        new Date().getFullYear();


    document
        .querySelectorAll(
            "[data-current-year]"
        )
        .forEach(element => {

            element.textContent =
                year;

        });

}


initCurrentYear();


/* =========================================================
   PAGE VISIBILITY
   ---------------------------------------------------------
   Helps restore scroll/update state when a user returns
   to a tab.
   ========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            document
                .querySelectorAll(
                    ".site-header"
                )
                .forEach(header => {

                    if (
                        window.scrollY > 10
                    ) {

                        header.classList.add(
                            "is-scrolled"
                        );

                    }

                });

        }

    }
);


/* =========================================================
   REDUCED MOTION SUPPORT
   ========================================================= */

const prefersReducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );


if (
    prefersReducedMotion.matches
) {

    document.documentElement.classList.add(
        "reduce-motion"
    );

}


prefersReducedMotion.addEventListener(
    "change",
    event => {

        document.documentElement.classList.toggle(
            "reduce-motion",
            event.matches
        );

    }
);


/* =========================================================
   CONSOLE BRANDING
   ========================================================= */

if (
    typeof console !== "undefined"
) {

    console.log(
        "%cElectrical Engineering by Prasun Barua",
        "font-weight:600;font-size:14px;"
    );

    console.log(
        "Site JavaScript loaded successfully."
    );

}
