"use strict";

/**
 * =========================================================
 * ELECTRICAL.PRASUNBARUA.COM
 * Main Application Script
 * =========================================================
 *
 * Features:
 * 1. Google site search
 * 2. Active navigation highlighting
 * 3. External link security
 *
 * No mobile menu / three-dot button is used.
 * =========================================================
 */

document.addEventListener("DOMContentLoaded", () => {


    // =========================================================
    // 1. SITE SEARCH
    // =========================================================

    const searchForm =
        document.getElementById("site-search-form");

    const searchInput =
        document.getElementById("site-search");

    const searchMessage =
        document.getElementById("search-message");


    if (searchForm && searchInput) {

        searchForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const query =
                searchInput.value.trim();


            // -------------------------------------------------
            // Empty search
            // -------------------------------------------------

            if (!query) {

                if (searchMessage) {

                    searchMessage.textContent =
                        "Please enter an engineering topic or formula to search.";

                    searchMessage.style.display =
                        "block";
                }

                searchInput.focus();

                return;
            }


            // -------------------------------------------------
            // Clear previous message
            // -------------------------------------------------

            if (searchMessage) {

                searchMessage.textContent =
                    "";

                searchMessage.style.display =
                    "none";
            }


            // -------------------------------------------------
            // Google site search
            // -------------------------------------------------

            const siteDomain =
                "electrical.prasunbarua.com";

            const googleSearchQuery =
                `site:${siteDomain} ${query}`;

            const searchUrl =
                "https://www.google.com/search?q=" +
                encodeURIComponent(
                    googleSearchQuery
                );


            // -------------------------------------------------
            // Open Google search in a new tab
            // -------------------------------------------------

            window.open(
                searchUrl,
                "_blank",
                "noopener,noreferrer"
            );

        });

    }


    // =========================================================
    // 2. ACTIVE NAVIGATION
    // =========================================================

    const currentPath =
        window.location.pathname;

    const navLinks =
        document.querySelectorAll(
            ".main-nav a"
        );


    navLinks.forEach((link) => {

        const linkUrl =
            new URL(
                link.href,
                window.location.origin
            );

        const linkPath =
            linkUrl.pathname;

        const linkHash =
            linkUrl.hash;


        // -----------------------------------------------------
        // Remove existing active state
        // -----------------------------------------------------

        link.classList.remove("active");

        link.removeAttribute(
            "aria-current"
        );


        // -----------------------------------------------------
        // Homepage
        // -----------------------------------------------------

        if (
            currentPath === "/" &&
            linkPath === "/"
        ) {

            link.classList.add("active");

            link.setAttribute(
                "aria-current",
                "page"
            );

            return;
        }


        // -----------------------------------------------------
        // Other pages
        // -----------------------------------------------------

        if (
            currentPath === linkPath &&
            !linkHash
        ) {

            link.classList.add("active");

            link.setAttribute(
                "aria-current",
                "page"
            );

        }

    });


    // =========================================================
    // 3. EXTERNAL LINK SECURITY
    // =========================================================

    const externalLinks =
        document.querySelectorAll(
            'a[href^="http://"], a[href^="https://"]'
        );


    externalLinks.forEach((link) => {

        try {

            const url =
                new URL(link.href);

            const isExternal =
                url.hostname !==
                window.location.hostname;


            if (isExternal) {

                link.setAttribute(
                    "target",
                    "_blank"
                );

                link.setAttribute(
                    "rel",
                    "noopener noreferrer"
                );

            }

        } catch (error) {

            // Ignore invalid URLs.

        }

    });


});
