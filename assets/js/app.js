"use strict";

/**
 * ELECTRICAL.PRASUNBARUA.COM
 * Main Application Script
 */

document.addEventListener("DOMContentLoaded", () => {

    // =========================================================
    // 1. SITE SEARCH SYSTEM
    // =========================================================

    const searchForm = document.getElementById("site-search-form");
    const searchInput = document.getElementById("site-search");
    const searchMessage = document.getElementById("search-message");

    if (searchForm && searchInput) {

        searchForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const query = searchInput.value.trim();

            if (!query) {

                if (searchMessage) {
                    searchMessage.textContent =
                        "Please enter an engineering topic or formula to search.";
                    searchMessage.style.display = "block";
                }

                searchInput.focus();
                return;
            }

            if (searchMessage) {
                searchMessage.textContent = "";
                searchMessage.style.display = "none";
            }

            const siteDomain = "electrical.prasunbarua.com";

            const searchUrl =
                "https://www.google.com/search?q=" +
                encodeURIComponent(`site:${siteDomain} ${query}`);

            window.open(
                searchUrl,
                "_blank",
                "noopener,noreferrer"
            );
        });
    }


    // =========================================================
    // 2. ACTIVE NAVIGATION LINK HIGHLIGHTER
    // =========================================================

    const currentPath = window.location.pathname;

    const navLinks = document.querySelectorAll(".main-nav a");

    navLinks.forEach((link) => {

        const linkPath = new URL(
            link.href,
            window.location.origin
        ).pathname;

        const isHome =
            currentPath === "/" &&
            (linkPath === "/" || linkPath.endsWith("/index.html"));

        const isCurrentPage =
            currentPath === linkPath;

        if (isHome || isCurrentPage) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });


    // =========================================================
    // 3. EXTERNAL LINK SECURITY
    // =========================================================

    const externalLinks = document.querySelectorAll(
        'a[href^="http"]'
    );

    externalLinks.forEach((link) => {

        const url = new URL(link.href);

        if (url.hostname !== window.location.hostname) {

            link.setAttribute("target", "_blank");
            link.setAttribute(
                "rel",
                "noopener noreferrer"
            );
        }
    });

});
