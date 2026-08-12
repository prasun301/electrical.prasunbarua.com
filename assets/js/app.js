"use strict";

/*
 * =========================================================
 * ELECTRICAL.PRASUNBARUA.COM
 * Main Application Script
 * =========================================================
 */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       1. SITE SEARCH
       ===================================================== */

    const searchForm = document.getElementById("site-search-form");
    const searchInput = document.getElementById("site-search");
    const searchButton = document.getElementById("search-button");
    const searchMessage = document.getElementById("search-message");

    const SITE_DOMAIN = "electrical.prasunbarua.com";

    const showSearchMessage = (message) => {
        if (!searchMessage) return;

        searchMessage.textContent = message;
        searchMessage.style.display = message ? "block" : "none";
    };

    const performSearch = () => {

        if (!searchInput) return;

        const query = searchInput.value.trim();

        if (!query) {

            showSearchMessage(
                "Please enter an engineering topic, formula, or calculation."
            );

            searchInput.focus();

            return;
        }

        showSearchMessage("");

        /*
         * Search only within electrical.prasunbarua.com
         */
        const googleQuery =
            `site:${SITE_DOMAIN} ${query}`;

        const searchURL =
            `https://www.google.com/search?q=${encodeURIComponent(googleQuery)}`;

        /*
         * Open Google site search in a new tab.
         */
        window.open(
            searchURL,
            "_blank",
            "noopener,noreferrer"
        );
    };


    if (searchForm && searchInput) {

        /*
         * Prevent the browser's default form submission.
         */
        searchForm.addEventListener("submit", (event) => {

            event.preventDefault();

            performSearch();

        });


        /*
         * Clear the error message when the user starts typing.
         */
        searchInput.addEventListener("input", () => {

            if (searchMessage && searchInput.value.trim()) {
                showSearchMessage("");
            }

        });


        /*
         * Escape key clears the search field.
         */
        searchInput.addEventListener("keydown", (event) => {

            if (event.key === "Escape") {

                searchInput.value = "";

                showSearchMessage("");

            }

        });

    }


    /*
     * Keep compatibility if the button is accessed directly.
     */
    if (searchButton && !searchForm) {

        searchButton.addEventListener(
            "click",
            performSearch
        );

    }


    /* =====================================================
       2. MOBILE NAVIGATION
       ===================================================== */

    const menuToggle =
        document.querySelector(".menu-toggle");

    const mainNav =
        document.querySelector(".main-nav");

    if (menuToggle && mainNav) {

        menuToggle.addEventListener("click", () => {

            const isOpen =
                menuToggle.getAttribute("aria-expanded") === "true";

            menuToggle.setAttribute(
                "aria-expanded",
                String(!isOpen)
            );

            mainNav.classList.toggle(
                "nav-open",
                !isOpen
            );


            /*
             * Change menu icon.
             */
            const icon =
                menuToggle.querySelector(
                    ".material-symbols-rounded"
                );

            if (icon) {

                icon.textContent =
                    isOpen ? "menu" : "close";

            }

        });


        /*
         * Close mobile menu when a navigation link is clicked.
         */
        const navLinks =
            mainNav.querySelectorAll("a");

        navLinks.forEach((link) => {

            link.addEventListener("click", () => {

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

                mainNav.classList.remove(
                    "nav-open"
                );

                const icon =
                    menuToggle.querySelector(
                        ".material-symbols-rounded"
                    );

                if (icon) {
                    icon.textContent = "menu";
                }

            });

        });


        /*
         * Close menu when clicking outside.
         */
        document.addEventListener("click", (event) => {

            if (
                !mainNav.contains(event.target) &&
                !menuToggle.contains(event.target)
            ) {

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

                mainNav.classList.remove(
                    "nav-open"
                );

                const icon =
                    menuToggle.querySelector(
                        ".material-symbols-rounded"
                    );

                if (icon) {
                    icon.textContent = "menu";
                }

            }

        });


        /*
         * Close mobile menu with Escape.
         */
        document.addEventListener("keydown", (event) => {

            if (event.key === "Escape") {

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

                mainNav.classList.remove(
                    "nav-open"
                );

                const icon =
                    menuToggle.querySelector(
                        ".material-symbols-rounded"
                    );

                if (icon) {
                    icon.textContent = "menu";
                }

            }

        });

    }


    /* =====================================================
       3. ACTIVE NAVIGATION
       ===================================================== */

    const highlightActiveNavigation = () => {

        const navLinks =
            document.querySelectorAll(
                ".main-nav a"
            );

        const currentPath =
            window.location.pathname.replace(
                /\/$/,
                ""
            ) || "/";

        navLinks.forEach((link) => {

            const href =
                link.getAttribute("href");

            /*
             * Ignore anchor links such as:
             * #tutorials
             * #calculations
             * #solar
             * #about
             */
            if (!href || href.startsWith("#")) {
                return;
            }


            /*
             * Ignore external links.
             */
            if (
                href.startsWith("http://") ||
                href.startsWith("https://")
            ) {
                return;
            }


            const linkURL =
                new URL(
                    href,
                    window.location.origin
                );

            const linkPath =
                linkURL.pathname.replace(
                    /\/$/,
                    ""
                ) || "/";


            if (linkPath === currentPath) {

                link.classList.add("active");

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

    };


    highlightActiveNavigation();


    /* =====================================================
       4. SMOOTH INTERNAL NAVIGATION
       ===================================================== */

    const internalAnchorLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );

    internalAnchorLinks.forEach((link) => {

        link.addEventListener("click", (event) => {

            const targetID =
                link.getAttribute("href");

            if (
                !targetID ||
                targetID === "#"
            ) {
                return;
            }

            const target =
                document.querySelector(targetID);

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });


            /*
             * Update browser URL without jumping.
             */
            if (
                window.history &&
                window.history.pushState
            ) {

                window.history.pushState(
                    null,
                    "",
                    targetID
                );

            }

        });

    });


    /* =====================================================
       5. EXTERNAL LINK SECURITY
       ===================================================== */

    const externalLinks =
        document.querySelectorAll(
            'a[href^="http://"], a[href^="https://"]'
        );

    externalLinks.forEach((link) => {

        let url;

        try {

            url = new URL(
                link.href,
                window.location.href
            );

        } catch (error) {

            return;

        }


        /*
         * Only apply target="_blank" to
         * genuinely external domains.
         */
        if (
            url.hostname !==
            window.location.hostname
        ) {

            link.setAttribute(
                "target",
                "_blank"
            );

            link.setAttribute(
                "rel",
                "noopener noreferrer"
            );

        }

    });


    /* =====================================================
       6. KEYBOARD ACCESSIBILITY
       ===================================================== */

    /*
     * Allow "/" to focus the search box,
     * similar to many modern search interfaces.
     */
    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "/" &&
                !event.ctrlKey &&
                !event.metaKey &&
                !event.altKey
            ) {

                const activeElement =
                    document.activeElement;

                const isTyping =
                    activeElement &&
                    (
                        activeElement.tagName === "INPUT" ||
                        activeElement.tagName === "TEXTAREA" ||
                        activeElement.isContentEditable
                    );

                if (isTyping) {
                    return;
                }

                if (searchInput) {

                    event.preventDefault();

                    searchInput.focus();

                }

            }

        }
    );


    /* =====================================================
       7. SEARCH FOCUS EFFECT
       ===================================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "focus",
            () => {

                if (searchInput.parentElement) {

                    searchInput.parentElement.classList.add(
                        "search-focused"
                    );

                }

            }
        );


        searchInput.addEventListener(
            "blur",
            () => {

                if (searchInput.parentElement) {

                    searchInput.parentElement.classList.remove(
                        "search-focused"
                    );

                }

            }
        );

    }


    /* =====================================================
       8. CURRENT YEAR
       ===================================================== */

    /*
     * Automatically update elements using:
     *
     * <span data-current-year></span>
     *
     * This avoids manually changing the footer every year.
     */
    const yearElements =
        document.querySelectorAll(
            "[data-current-year]"
        );

    yearElements.forEach((element) => {

        element.textContent =
            new Date().getFullYear();

    });


    /* =====================================================
       9. REDUCED MOTION SUPPORT
       ===================================================== */

    /*
     * Respect users who prefer reduced motion.
     */
    const prefersReducedMotion =
        window.matchMedia &&
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

    if (prefersReducedMotion) {

        document.documentElement.classList.add(
            "reduce-motion"
        );

    }


    /* =====================================================
       10. INITIALIZATION COMPLETE
       ===================================================== */

    document.documentElement.classList.add(
        "js-ready"
    );

});
