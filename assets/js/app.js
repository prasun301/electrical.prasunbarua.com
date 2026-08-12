/* =========================================================
   ELECTRICAL ENGINEERING
   Prasun Barua
   Main Site JavaScript
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const menuToggle = document.querySelector("#menu-toggle");
    const sidebar = document.querySelector("#site-sidebar");
    const sidebarOverlay = document.querySelector("#sidebar-overlay");
    const sidebarClose = document.querySelector("#sidebar-close");

    const searchForm = document.querySelector("#site-search-form");
    const searchInput = document.querySelector("#site-search");
    const searchMessage = document.querySelector("#search-message");

    /* =====================================================
       MOBILE SIDEBAR
       ===================================================== */

    function openSidebar() {
        if (!sidebar) return;

        sidebar.classList.add("is-open");

        if (sidebarOverlay) {
            sidebarOverlay.classList.add("is-visible");
        }

        document.body.classList.add("sidebar-open");

        if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", "true");
        }
    }

    function closeSidebar() {
        if (!sidebar) return;

        sidebar.classList.remove("is-open");

        if (sidebarOverlay) {
            sidebarOverlay.classList.remove("is-visible");
        }

        document.body.classList.remove("sidebar-open");

        if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", "false");
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener("click", () => {

            if (sidebar && sidebar.classList.contains("is-open")) {
                closeSidebar();
            } else {
                openSidebar();
            }

        });
    }

    if (sidebarClose) {
        sidebarClose.addEventListener("click", closeSidebar);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", closeSidebar);
    }

    /* =====================================================
       CLOSE MOBILE MENU AFTER CLICKING A LINK
       ===================================================== */

    if (sidebar) {

        const sidebarLinks = sidebar.querySelectorAll("a");

        sidebarLinks.forEach(link => {

            link.addEventListener("click", () => {
                closeSidebar();
            });

        });

    }

    /* =====================================================
       ESCAPE KEY
       ===================================================== */

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            closeSidebar();
        }

    });

    /* =====================================================
       PREVENT BACKGROUND SCROLL WHEN SIDEBAR IS OPEN
       ===================================================== */

    function updateBodyScroll() {

        if (
            sidebar &&
            sidebar.classList.contains("is-open")
        ) {
            document.body.classList.add("sidebar-open");
        } else {
            document.body.classList.remove("sidebar-open");
        }

    }

    /* =====================================================
       SEARCH
       ===================================================== */

    if (searchForm && searchInput) {

        searchForm.addEventListener("submit", event => {

            event.preventDefault();

            const query = searchInput.value.trim();

            if (!query) {

                if (searchMessage) {
                    searchMessage.textContent =
                        "Please enter a topic to search.";
                }

                searchInput.focus();

                return;
            }

            /*
             * Main article search.
             *
             * GitHub Pages / static hosting does not have a
             * server-side search engine, so we send the user
             * to the site's article search page.
             */

            const searchURL =
                "/articles/?q=" +
                encodeURIComponent(query);

            window.location.href = searchURL;

        });

    }

    /* =====================================================
       SEARCH MESSAGE CLEAR
       ===================================================== */

    if (searchInput && searchMessage) {

        searchInput.addEventListener("input", () => {

            searchMessage.textContent = "";

        });

    }

    /* =====================================================
       ACTIVE NAVIGATION
       ===================================================== */

    const currentPath =
        window.location.pathname.replace(/\/+$/, "") || "/";

    const navigationLinks =
        document.querySelectorAll(
            ".main-nav a, .sidebar-nav a"
        );

    navigationLinks.forEach(link => {

        const linkURL = new URL(
            link.href,
            window.location.origin
        );

        let linkPath =
            linkURL.pathname.replace(/\/+$/, "") || "/";

        /*
         * Remove existing active state.
         */

        link.classList.remove("active");

        /*
         * Home page.
         */

        if (
            currentPath === "/" &&
            linkPath === "/"
        ) {

            link.classList.add("active");

            return;
        }

        /*
         * Category/article pages.
         */

        if (
            linkPath !== "/" &&
            currentPath.startsWith(linkPath)
        ) {

            link.classList.add("active");

        }

    });

    /* =====================================================
       SMOOTH INTERNAL NAVIGATION
       ===================================================== */

    const internalLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );

    internalLinks.forEach(link => {

        link.addEventListener("click", event => {

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

            const header =
                document.querySelector(".site-header");

            const headerHeight =
                header
                    ? header.offsetHeight
                    : 0;

            const targetPosition =
                target.getBoundingClientRect().top +
                window.scrollY -
                headerHeight -
                16;

            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });

            /*
             * Close mobile navigation after
             * selecting a section.
             */

            closeSidebar();

        });

    });

    /* =====================================================
       CATEGORY COLLAPSIBLE GROUPS
       ===================================================== */

    const categoryButtons =
        document.querySelectorAll(
            "[data-category-toggle]"
        );

    categoryButtons.forEach(button => {

        button.addEventListener("click", () => {

            const targetID =
                button.getAttribute(
                    "data-category-toggle"
                );

            if (!targetID) {
                return;
            }

            const target =
                document.getElementById(targetID);

            if (!target) {
                return;
            }

            const isOpen =
                target.classList.contains("is-expanded");

            /*
             * Close other category groups.
             */

            document
                .querySelectorAll(".category-submenu.is-expanded")
                .forEach(menu => {

                    if (menu !== target) {
                        menu.classList.remove(
                            "is-expanded"
                        );
                    }

                });

            /*
             * Toggle selected category.
             */

            target.classList.toggle(
                "is-expanded",
                !isOpen
            );

            button.setAttribute(
                "aria-expanded",
                String(!isOpen)
            );

        });

    });

    /* =====================================================
       BACK TO TOP
       ===================================================== */

    const backToTop =
        document.querySelector("#back-to-top");

    if (backToTop) {

        const updateBackToTop =
            () => {

                if (window.scrollY > 500) {

                    backToTop.classList.add(
                        "is-visible"
                    );

                } else {

                    backToTop.classList.remove(
                        "is-visible"
                    );

                }

            };

        window.addEventListener(
            "scroll",
            updateBackToTop,
            { passive: true }
        );

        updateBackToTop();

        backToTop.addEventListener(
            "click",
            () => {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    }

    /* =====================================================
       EXTERNAL LINKS
       ===================================================== */

    const externalLinks =
        document.querySelectorAll("a[href]");

    externalLinks.forEach(link => {

        try {

            const url =
                new URL(
                    link.href,
                    window.location.origin
                );

            if (
                url.origin !==
                window.location.origin
            ) {

                link.setAttribute(
                    "rel",
                    "noopener noreferrer"
                );

            }

        } catch (error) {

            /*
             * Ignore malformed/non-standard URLs.
             */

        }

    });

    /* =====================================================
       IMAGE LAZY LOADING
       ===================================================== */

    const images =
        document.querySelectorAll(
            "img"
        );

    images.forEach(image => {

        /*
         * Do not override explicitly eager-loaded
         * images.
         */

        if (
            !image.hasAttribute(
                "loading"
            )
        ) {

            image.setAttribute(
                "loading",
                "lazy"
            );

        }

        /*
         * Improve decoding performance.
         */

        if (
            !image.hasAttribute(
                "decoding"
            )
        ) {

            image.setAttribute(
                "decoding",
                "async"
            );

        }

    });

    /* =====================================================
       EXTERNAL IMAGE ERROR HANDLING
       ===================================================== */

    images.forEach(image => {

        image.addEventListener(
            "error",
            () => {

                image.classList.add(
                    "image-load-error"
                );

            }
        );

    });

    /* =====================================================
       CURRENT YEAR
       ===================================================== */

    const yearElements =
        document.querySelectorAll(
            "[data-current-year]"
        );

    yearElements.forEach(element => {

        element.textContent =
            new Date().getFullYear();

    });

    /* =====================================================
       REDUCE MOTION SUPPORT
       ===================================================== */

    const prefersReducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

    if (prefersReducedMotion) {

        document.documentElement.classList.add(
            "reduce-motion"
        );

    }

    /* =====================================================
       INITIAL BODY STATE
       ===================================================== */

    updateBodyScroll();

});
