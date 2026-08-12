"use strict";

/**
 * ELECTRICAL.PRASUNBARUA.COM
 * Main Application Script
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // =========================================================
    // 1. SITE SEARCH SYSTEM
    // =========================================================
    const searchInput = document.getElementById("site-search");
    const searchButton = document.getElementById("search-button");
    const searchMessage = document.getElementById("search-message");

    if (searchInput && searchButton) {
        
        const performSearch = () => {
            const query = searchInput.value.trim();

            if (!query) {
                if (searchMessage) {
                    searchMessage.textContent = "Please enter an engineering topic or formula to search.";
                    searchMessage.style.display = "block";
                }
                searchInput.focus();
                return;
            }

            if (searchMessage) {
                searchMessage.textContent = "";
                searchMessage.style.display = "none";
            }

            // Fallback Google Site Search
            const siteDomain = "electrical.prasunbarua.com";
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`site:${siteDomain} ${query}`)}`;

            // Open search in a new tab
            window.open(searchUrl, "_blank", "noopener,noreferrer");
        };

        // Trigger on button click
        searchButton.addEventListener("click", performSearch);

        // Trigger on Enter key press
        searchInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                performSearch();
            }
        });
    }

    // =========================================================
    // 2. ACTIVE NAVIGATION LINK HIGHLIGHTER
    // =========================================================
    const highlightActiveNav = () => {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll(".main-nav a");

        navLinks.forEach((link) => {
            // Use URL object properties to handle relative paths (../../../index.html) cleanly
            const linkPath = link.pathname;

            // Highlight exact match or root homepage match
            if (
                currentPath === linkPath ||
                (currentPath === "/" && linkPath.endsWith("index.html")) ||
                (currentPath.endsWith("index.html") && linkPath === "/")
            ) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });
    };

    highlightActiveNav();

    // =========================================================
    // 3. EXTERNAL LINK SECURITY
    // =========================================================
    // Automatically add security attributes to all external links
    const externalLinks = document.querySelectorAll(`a[href^="http"]:not([href*="${window.location.hostname}"])`);
    externalLinks.forEach((link) => {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
    });

    // =========================================================
    // 4. MOBILE MENU TOGGLE (OPTIONAL)
    // =========================================================
    const menuToggle = document.querySelector(".menu-toggle");
    const mainNav = document.querySelector(".main-nav");

    if (menuToggle && mainNav) {
        menuToggle.addEventListener("click", () => {
            const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
            menuToggle.setAttribute("aria-expanded", !isExpanded);
            mainNav.classList.toggle("nav-open");
        });
    }
});
