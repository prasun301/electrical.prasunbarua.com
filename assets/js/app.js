"use strict";

/*
 * ELECTRICAL.PRASUNBARUA.COM
 * Main JavaScript
 */

document.addEventListener("DOMContentLoaded", () => {

    const searchInput =
        document.getElementById("site-search");

    const searchButton =
        document.getElementById("search-button");

    const searchMessage =
        document.getElementById("search-message");


    function performSearch() {

        const query =
            searchInput.value.trim();

        if (!query) {

            searchMessage.textContent =
                "Please enter a topic to search.";

            searchInput.focus();

            return;
        }


        /*
         * Temporary search system.
         *
         * We will replace this with the site's
         * real article search after the article
         * structure is created.
         */

        const searchUrl =
            "https://www.google.com/search?q=" +
            encodeURIComponent(
                "site:electrical.prasunbarua.com " +
                query
            );

        window.location.href = searchUrl;
    }


    searchButton.addEventListener(
        "click",
        performSearch
    );


    searchInput.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                performSearch();

            }

        }
    );

});
