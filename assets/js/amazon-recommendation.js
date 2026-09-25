(function () {

    "use strict";


    /* =========================================================
       PRASUN BARUA
       AMAZON RECOMMENDATION ENGINE
       FOR ELECTRICAL ENGINEERING ARTICLES
       ========================================================= */


    /* =========================================================
       1. CONFIGURATION
       ========================================================= */

    const AMAZON_TAG = "prasunbaru0d7-20";

    const AMAZON_FALLBACK_LINK =
        "https://link.amazon/B08F9UQ6O";

    const WIDGET_ID =
        "prasun-amazon-auto";


    /*
     * Your article URLs use /articles/
     * The engine will not render on your homepage
     * or normal non-article pages.
     */

    const ARTICLE_URL_PATTERN =
        /\/articles\//i;


    /* =========================================================
       2. ENGINEERING RECOMMENDATION CATALOG
       ========================================================= */

    const CATALOG = [

        /* -----------------------------------------------------
           ELECTRICAL FUNDAMENTALS
        ----------------------------------------------------- */

        {
            id: "electrical-fundamentals",

            keywords: [
                "ohm's law",
                "ohms law",
                "voltage",
                "current",
                "resistance",
                "resistor",
                "dc circuit",
                "ac circuit",
                "series circuit",
                "parallel circuit",
                "kirchhoff",
                "kcl",
                "kvl",
                "circuit analysis",
                "electrical fundamentals",
                "electrical basics",
                "basic electrical"
            ],

            title:
                "Electrical Engineering Books & Resources",

            description:
                "Explore practical books and learning resources covering circuits, electrical fundamentals, calculations and engineering principles.",

            query:
                "electrical engineering circuits fundamentals book"
        },


        /* -----------------------------------------------------
           ELECTRICAL CALCULATIONS
        ----------------------------------------------------- */

        {
            id: "electrical-calculations",

            keywords: [
                "electrical calculation",
                "power calculation",
                "electrical power",
                "energy calculation",
                "voltage drop",
                "cable sizing",
                "cable size",
                "wire size",
                "conductor sizing",
                "current calculation",
                "short circuit calculation"
            ],

            title:
                "Electrical Calculation Resources",

            description:
                "Explore engineering references and practical tools for electrical calculations, cable sizing, voltage drop and system design.",

            query:
                "electrical engineering calculations cable sizing voltage drop book"
        },


        /* -----------------------------------------------------
           CABLES / WIRING
        ----------------------------------------------------- */

        {
            id: "cables",

            keywords: [
                "cable",
                "cables",
                "wire",
                "wiring",
                "cable sizing",
                "cable size",
                "conductor",
                "conductor sizing",
                "ampacity",
                "cable selection",
                "cable calculation",
                "wire sizing"
            ],

            title:
                "Electrical Cable Tools & Resources",

            description:
                "Explore practical tools, accessories and references for cable selection, preparation, sizing and electrical installation.",

            query:
                "electrical cable crimper stripper wire tools"
        },


        /* -----------------------------------------------------
           POWER SYSTEMS
        ----------------------------------------------------- */

        {
            id: "power-systems",

            keywords: [
                "power system",
                "power systems",
                "load flow",
                "power flow",
                "power system analysis",
                "grid integration",
                "generation",
                "transmission",
                "distribution",
                "power network",
                "power grid"
            ],

            title:
                "Power Systems Engineering Resources",

            description:
                "Explore engineering references covering power-system analysis, load flow, grid integration, generation and distribution.",

            query:
                "electrical power systems engineering analysis book"
        },


        /* -----------------------------------------------------
           PROTECTION
        ----------------------------------------------------- */

        {
            id: "protection",

            keywords: [
                "short circuit",
                "fault current",
                "overcurrent",
                "protection",
                "protective device",
                "protective relay",
                "relay coordination",
                "circuit protection",
                "fault analysis",
                "protection coordination"
            ],

            title:
                "Power System Protection Resources",

            description:
                "Explore references covering fault analysis, circuit protection, protective relays and coordination studies.",

            query:
                "power system protection relay fault analysis book"
        },


        /* -----------------------------------------------------
           CIRCUIT BREAKERS
        ----------------------------------------------------- */

        {
            id: "breakers",

            keywords: [
                "circuit breaker",
                "mcb",
                "mccb",
                "acb",
                "rcbo",
                "breaker sizing",
                "breaker selection",
                "miniature circuit breaker",
                "molded case circuit breaker"
            ],

            title:
                "Circuit Protection Resources",

            description:
                "Explore references and practical resources for circuit breakers, protection devices and electrical system design.",

            query:
                "electrical circuit breaker protection engineering book"
        },


        /* -----------------------------------------------------
           EARTHING / GROUNDING
        ----------------------------------------------------- */

        {
            id: "grounding",

            keywords: [
                "earthing",
                "earth system",
                "earth resistance",
                "grounding",
                "grounding system",
                "ground resistance",
                "ground rod",
                "ground electrode",
                "protective earth",
                "earth fault"
            ],

            title:
                "Grounding & Earthing Resources",

            description:
                "Explore practical references and tools for grounding, earthing-system design, resistance testing and electrical safety.",

            query:
                "electrical grounding earthing engineering book"
        },


        /* -----------------------------------------------------
           TRANSFORMERS
        ----------------------------------------------------- */

        {
            id: "transformers",

            keywords: [
                "transformer",
                "transformers",
                "transformer sizing",
                "transformer design",
                "distribution transformer",
                "power transformer",
                "transformer testing",
                "transformer protection"
            ],

            title:
                "Transformer Engineering Resources",

            description:
                "Explore practical references covering transformer selection, design, testing, protection and application.",

            query:
                "electrical transformer engineering design book"
        },


        /* -----------------------------------------------------
           SWITCHGEAR / SUBSTATION
        ----------------------------------------------------- */

        {
            id: "switchgear",

            keywords: [
                "switchgear",
                "substation",
                "medium voltage",
                "high voltage",
                "mv switchgear",
                "hv switchgear",
                "switchboard",
                "busbar",
                "substation design"
            ],

            title:
                "Switchgear & Substation Resources",

            description:
                "Explore engineering references covering switchgear, substations, busbars, medium-voltage and high-voltage systems.",

            query:
                "electrical switchgear substation engineering book"
        },


        /* -----------------------------------------------------
           SOLAR PV
        ----------------------------------------------------- */

        {
            id: "solar-pv",

            keywords: [
                "solar pv",
                "solar photovoltaic",
                "photovoltaic",
                "solar panel",
                "pv system",
                "pv array",
                "pv module",
                "solar inverter",
                "pvsyst",
                "solar plant",
                "solar energy"
            ],

            title:
                "Solar PV Engineering Resources",

            description:
                "Explore practical references for photovoltaic system design, installation, sizing, analysis and performance.",

            query:
                "solar photovoltaic engineering design installation book"
        },


        /* -----------------------------------------------------
           BESS
        ----------------------------------------------------- */

        {
            id: "bess",

            keywords: [
                "bess",
                "battery energy storage",
                "battery energy storage system",
                "energy storage system",
                "battery sizing",
                "battery storage",
                "lithium battery",
                "battery bank",
                "battery system",
                "energy storage"
            ],

            title:
                "BESS Design & Sizing Resources",

            description:
                "Explore practical references covering battery sizing, energy-storage architecture, system design and safety.",

            query:
                "battery energy storage system BESS engineering design book"
        },


        /* -----------------------------------------------------
           POWER ELECTRONICS
        ----------------------------------------------------- */

        {
            id: "power-electronics",

            keywords: [
                "power electronics",
                "mosfet",
                "igbt",
                "thyristor",
                "vfd",
                "variable frequency drive",
                "inverter",
                "converter",
                "rectifier",
                "switching device",
                "power converter"
            ],

            title:
                "Power Electronics Resources",

            description:
                "Explore engineering references covering converters, inverters, switching devices, drives and power electronics.",

            query:
                "power electronics engineering converter inverter book"
        },


        /* -----------------------------------------------------
           TESTING / COMMISSIONING
        ----------------------------------------------------- */

        {
            id: "testing",

            keywords: [
                "testing",
                "electrical testing",
                "commissioning",
                "electrical commissioning",
                "multimeter",
                "clamp meter",
                "insulation resistance",
                "megger",
                "continuity test",
                "electrical measurement",
                "test equipment"
            ],

            title:
                "Electrical Testing Equipment & Resources",

            description:
                "Explore practical test equipment and technical references for electrical testing, troubleshooting and commissioning.",

            query:
                "professional electrical testing multimeter insulation tester tools"
        },


        /* -----------------------------------------------------
           DATA CENTERS / UPS
        ----------------------------------------------------- */

        {
            id: "data-center",

            keywords: [
                "data center",
                "data centre",
                "server room",
                "ups",
                "uninterruptible power supply",
                "critical power",
                "power backup",
                "data center electrical",
                "data center infrastructure"
            ],

            title:
                "Critical Power & UPS Resources",

            description:
                "Explore engineering references covering UPS systems, critical power, backup systems and electrical infrastructure.",

            query:
                "UPS critical power data center electrical engineering book"
        }

    ];


    /* =========================================================
       3. SHARED CSS
       ========================================================= */

    const CSS = `

        :host {

            display: block;

            width: 100%;

            max-width: 100%;

            margin: 34px 0;

            padding: 0;

            background: transparent;

            font-family:
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                Roboto,
                Helvetica,
                Arial,
                sans-serif;

            color-scheme: light;

        }


        *,
        *::before,
        *::after {

            box-sizing: border-box;

        }


        .amz-card {

            width: 100%;

            max-width: 760px;

            margin: 0 auto;

            padding:
                19px 20px 14px;

            background:
                #ffffff;

            border:
                1px solid #e3e6e8;

            border-radius:
                14px;

            color:
                #1d1d1f;

            box-shadow:
                0 2px 12px
                rgba(15,17,17,.055);

            overflow:
                hidden;

            transition:
                background-color .25s ease,
                border-color .25s ease,
                color .25s ease,
                box-shadow .25s ease;

        }


        .amz-card:hover {

            border-color:
                #cfd3d6;

            box-shadow:
                0 5px 19px
                rgba(15,17,17,.085);

        }


        /* =====================================================
           HEADER
        ====================================================== */

        .amz-header {

            display:
                flex;

            align-items:
                center;

            justify-content:
                space-between;

            gap:
                14px;

            margin-bottom:
                17px;

        }


        .amz-brand {

            display:
                inline-flex;

            align-items:
                center;

            gap:
                9px;

            color:
                #1d1d1f;

        }


        .amz-icon {

            display:
                inline-flex;

            align-items:
                center;

            justify-content:
                center;

            width:
                31px;

            height:
                31px;

            flex:
                0 0 31px;

            border-radius:
                8px;

            background:
                #fff7df;

            color:
                #33383b;

        }


        .amz-brand-text {

            font-size:
                14px;

            line-height:
                1;

            font-weight:
                700;

            letter-spacing:
                -.01em;

        }


        .amz-available {

            padding:
                6px 9px;

            border:
                1px solid #e2e5e7;

            border-radius:
                999px;

            background:
                #f7f8f8;

            color:
                #62676b;

            font-size:
                9px;

            line-height:
                1;

            font-weight:
                700;

            letter-spacing:
                .045em;

            text-transform:
                uppercase;

            white-space:
                nowrap;

        }


        /* =====================================================
           MAIN CONTENT
        ====================================================== */

        .amz-main {

            display:
                grid;

            grid-template-columns:
                minmax(0,1fr) auto;

            align-items:
                center;

            gap:
                24px;

        }


        .amz-copy {

            min-width:
                0;

        }


        .amz-kicker {

            margin:
                0 0 5px;

            padding:
                0;

            color:
                #e47911;

            font-size:
                10px;

            line-height:
                1.3;

            font-weight:
                700;

            letter-spacing:
                .06em;

            text-transform:
                uppercase;

        }


        .amz-title {

            margin:
                0 0 6px;

            padding:
                0;

            color:
                #1d1d1f;

            font-size:
                17px;

            line-height:
                1.35;

            font-weight:
                650;

            letter-spacing:
                -.015em;

        }


        .amz-description {

            margin:
                0;

            padding:
                0;

            max-width:
                580px;

            color:
                #5f6367;

            font-size:
                12.5px;

            line-height:
                1.55;

        }


        /* =====================================================
           BUTTON
        ====================================================== */

        .amz-action {

            display:
                flex;

            align-items:
                center;

            justify-content:
                center;

            flex-shrink:
                0;

        }


        .amz-action-wrap {

            display:
                flex;

            flex-direction:
                column;

            align-items:
                center;

        }


        .amz-button {

            display:
                inline-flex;

            align-items:
                center;

            justify-content:
                center;

            gap:
                8px;

            min-height:
                41px;

            padding:
                10px 17px;

            border:
                1px solid #fcd200;

            border-radius:
                999px;

            background:
                #ffd814;

            color:
                #0f1111 !important;

            text-decoration:
                none !important;

            font-size:
                12.5px;

            line-height:
                1;

            font-weight:
                700;

            white-space:
                nowrap;

            box-shadow:
                0 1px 2px
                rgba(15,17,17,.10);

            cursor:
                pointer;

            transition:
                background-color .18s ease,
                border-color .18s ease,
                transform .16s ease,
                box-shadow .18s ease;

        }


        .amz-button:hover {

            background:
                #f7ca00;

            border-color:
                #f2c200;

            color:
                #0f1111 !important;

            text-decoration:
                none !important;

            transform:
                translateY(-1px);

            box-shadow:
                0 3px 8px
                rgba(15,17,17,.14);

        }


        .amz-button:active {

            transform:
                translateY(0);

        }


        .amz-arrow {

            transition:
                transform .18s ease;

        }


        .amz-button:hover
        .amz-arrow {

            transform:
                translateX(2px);

        }


        .amz-paid {

            margin-top:
                6px;

            color:
                #777c80;

            font-size:
                9px;

            line-height:
                1.2;

            white-space:
                nowrap;

        }


        /* =====================================================
           DISCLOSURE
        ====================================================== */

        .amz-disclosure {

            margin-top:
                14px;

            padding-top:
                10px;

            border-top:
                1px solid #eaedef;

            color:
                #73787c;

            font-size:
                9.5px;

            line-height:
                1.45;

            text-align:
                right;

        }


        /* =====================================================
           DARK MODE
        ====================================================== */

        @media (prefers-color-scheme: dark) {

            :host {

                color-scheme:
                    dark;

            }


            .amz-card {

                background:
                    #151a20;

                border-color:
                    #2d3741;

                color:
                    #f2f4f5;

                box-shadow:
                    0 4px 16px
                    rgba(0,0,0,.30);

            }


            .amz-card:hover {

                border-color:
                    #3b4651;

                box-shadow:
                    0 6px 22px
                    rgba(0,0,0,.38);

            }


            .amz-icon {

                background:
                    #292414;

                color:
                    #f2f4f5;

            }


            .amz-brand-text {

                color:
                    #f2f4f5;

            }


            .amz-available {

                background:
                    #202832;

                border-color:
                    #35414d;

                color:
                    #c1c8ce;

            }


            .amz-kicker {

                color:
                    #ffad36;

            }


            .amz-title {

                color:
                    #f2f4f5;

            }


            .amz-description {

                color:
                    #c4cbd1;

            }


            .amz-paid {

                color:
                    #9aa3aa;

            }


            .amz-disclosure {

                border-top-color:
                    #2b3540;

                color:
                    #929ba5;

            }

        }


        /* =====================================================
           RESPONSIVE
        ====================================================== */

        @media (max-width: 620px) {

            :host {

                margin:
                    26px 0;

            }


            .amz-card {

                padding:
                    17px 16px 14px;

                border-radius:
                    12px;

            }


            .amz-header {

                align-items:
                    flex-start;

                flex-direction:
                    column;

                gap:
                    10px;

                margin-bottom:
                    15px;

            }


            .amz-main {

                grid-template-columns:
                    1fr;

                gap:
                    15px;

            }


            .amz-description {

                max-width:
                    none;

            }


            .amz-action {

                width:
                    100%;

            }


            .amz-action-wrap {

                width:
                    100%;

            }


            .amz-button {

                width:
                    100%;

                min-height:
                    44px;

            }


            .amz-paid {

                text-align:
                    center;

            }


            .amz-disclosure {

                text-align:
                    left;

            }

        }


        @media (max-width: 380px) {

            .amz-brand-text {

                font-size:
                    13px;

            }


            .amz-title {

                font-size:
                    16px;

            }


            .amz-description {

                font-size:
                    12px;

            }

        }

    `;


    /* =========================================================
       4. GENERIC SHOPPING ICON
       ========================================================= */

    const SHOPPING_ICON = `

        <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            aria-hidden="true">

            <path
                d="M4 5h2l1.6 10.1a2 2 0 0 0 2 1.7h7.5a2 2 0 0 0 1.9-1.5L21 8H7"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
                stroke-linejoin="round"/>

            <circle
                cx="10"
                cy="20"
                r="1.2"
                fill="#ff9900"/>

            <circle
                cx="18"
                cy="20"
                r="1.2"
                fill="#ff9900"/>

        </svg>

    `;


    /* =========================================================
       5. ARROW
       ========================================================= */

    const ARROW_ICON = `

        <svg
            class="amz-arrow"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            aria-hidden="true">

            <path
                d="M5 12h13"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"/>

            <path
                d="m13 6 6 6-6 6"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"/>

        </svg>

    `;


    /* =========================================================
       6. TEXT NORMALIZATION
       ========================================================= */

    function normalizeText(value) {

        return String(value || "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();

    }


    /* =========================================================
       7. GET ARTICLE PAGE
       ========================================================= */

    function isArticlePage() {

        const path =
            window.location.pathname || "";


        /*
         * Your articles use /articles/
         */

        if (
            ARTICLE_URL_PATTERN.test(
                path
            )
        ) {

            return true;

        }


        /*
         * Fallback for an article page
         * that may not use /articles/
         */

        return !!(
            document.querySelector(
                "article"
            ) ||

            document.querySelector(
                ".article-content"
            ) ||

            document.querySelector(
                ".post-content"
            )
        );

    }


    /* =========================================================
       8. FIND ARTICLE CONTAINER
       ========================================================= */

    function getArticleElement() {

        return (

            document.querySelector(
                ".article-content"
            ) ||

            document.querySelector(
                "article.article"
            ) ||

            document.querySelector(
                "article"
            ) ||

            document.querySelector(
                ".post-content"
            ) ||

            document.querySelector(
                ".entry-content"
            )

        );

    }


    /* =========================================================
       9. GET ARTICLE TITLE
       ========================================================= */

    function getArticleTitle(
        article
    ) {

        if (!article) {

            return "";

        }


        const titleElement =

            article.querySelector(
                "h1"
            ) ||

            document.querySelector(
                "main h1"
            ) ||

            document.querySelector(
                "h1"
            );


        if (
            titleElement
        ) {

            return (
                titleElement.textContent ||
                titleElement.innerText ||
                ""
            )
            .replace(/\s+/g, " ")
            .trim();

        }


        return (
            document.title || ""
        )
        .replace(/\s*\|.*$/, "")
        .trim();

    }


    /* =========================================================
       10. GET ARTICLE TEXT
       ========================================================= */

    function getArticleText(
        article
    ) {

        if (!article) {

            return "";

        }


        return (
            article.textContent ||
            article.innerText ||
            ""
        );

    }


    /* =========================================================
       11. GET OPTIONAL CATEGORY
       ========================================================= */

    function getCategoryHint() {

        const metaCategory =
            document.querySelector(
                'meta[name="article:section"]'
            );


        if (
            metaCategory &&
            metaCategory.content
        ) {

            return normalizeText(
                metaCategory.content
            );

        }


        const categoryElement =

            document.querySelector(
                ".article-category"
            ) ||

            document.querySelector(
                "[data-category]"
            );


        if (
            categoryElement
        ) {

            return normalizeText(
                categoryElement.dataset.category ||
                categoryElement.textContent
            );

        }


        return "";

    }


    /* =========================================================
       12. GET URL HINT
       ========================================================= */

    function getURLHint() {

        return normalizeText(
            window.location.pathname
        );

    }


    /* =========================================================
       13. FIND RECOMMENDATION
       ========================================================= */

    function findRecommendation() {

        const article =
            getArticleElement();


        if (!article) {

            return null;

        }


        const title =
            normalizeText(
                getArticleTitle(
                    article
                )
            );


        const articleText =
            normalizeText(
                getArticleText(
                    article
                )
            );


        const category =
            getCategoryHint();


        const url =
            getURLHint();


        if (
            !title &&
            !articleText
        ) {

            return null;

        }


        let best =
            null;


        let bestScore =
            0;


        CATALOG.forEach(
            function (
                item
            ) {

                let score =
                    0;


                item.keywords.forEach(
                    function (
                        keyword
                    ) {

                        const key =
                            normalizeText(
                                keyword
                            );


                        /*
                         * TITLE = strongest signal
                         */

                        if (
                            title.includes(
                                key
                            )
                        ) {

                            score += 12;

                        }


                        /*
                         * URL = strong supporting signal
                         */

                        if (
                            url.includes(
                                key
                            )
                        ) {

                            score += 9;

                        }


                        /*
                         * CATEGORY = strong supporting signal
                         */

                        if (
                            category.includes(
                                key
                            )
                        ) {

                            score += 9;

                        }


                        /*
                         * BODY = weaker signal
                         */

                        if (
                            articleText.includes(
                                key
                            )
                        ) {

                            score += 1;

                        }

                    }
                );


                if (
                    score > bestScore
                ) {

                    bestScore =
                        score;

                    best =
                        item;

                }

            }
        );


        /*
         * Avoid showing a misleading
         * recommendation if the topic
         * does not match sufficiently.
         */

        if (
            !best ||
            bestScore < 3
        ) {

            return {

                id:
                    "general-electrical",

                title:
                    "Electrical Engineering Resources",

                description:
                    "Explore books, tools and technical resources related to electrical engineering.",

                query:
                    "electrical engineering books tools"

            };

        }


        return best;

    }


    /* =========================================================
       14. AMAZON LINK
       ========================================================= */

    function buildAmazonLink(
        recommendation,
        container
    ) {

        /*
         * OPTIONAL DIRECT ASIN

         * You can later use:
         *
         * <div
         *   id="prasun-amazon-auto"
         *   data-amazon-asin="B0XXXXXXXX">
         * </div>
         */

        const asin =
            container &&
            container.dataset
                ? container.dataset.amazonAsin
                : "";


        if (
            asin
        ) {

            return (
                "https://www.amazon.com/dp/" +
                encodeURIComponent(
                    asin
                ) +
                "?tag=" +
                encodeURIComponent(
                    AMAZON_TAG
                )
            );

        }


        /*
         * Topic-specific search link.
         */

        if (
            recommendation &&
            recommendation.query
        ) {

            return (
                "https://www.amazon.com/s?k=" +
                encodeURIComponent(
                    recommendation.query
                ) +
                "&tag=" +
                encodeURIComponent(
                    AMAZON_TAG
                )
            );

        }


        /*
         * Final fallback:
         * supplied SiteStripe link.
         */

        return AMAZON_FALLBACK_LINK;

    }


    /* =========================================================
       15. CREATE WIDGET CONTAINER
       ========================================================= */

    function getWidgetContainer() {

        /*
         * First look for an explicitly
         * placed placeholder.
         */

        let container =
            document.getElementById(
                WIDGET_ID
            );


        if (
            container
        ) {

            return container;

        }


        /*
         * Otherwise insert automatically
         * after the article.
         */

        const article =
            getArticleElement();


        if (!article) {

            return null;

        }


        container =
            document.createElement(
                "div"
            );


        container.id =
            WIDGET_ID;


        article.insertAdjacentElement(
            "afterend",
            container
        );


        return container;

    }


    /* =========================================================
       16. RENDER
       ========================================================= */

    function render() {

        if (
            !isArticlePage()
        ) {

            return;

        }


        const container =
            getWidgetContainer();


        if (
            !container
        ) {

            return;

        }


        /*
         * Prevent duplicate widgets.
         */

        if (
            container.dataset.amazonRendered ===
            "true"
        ) {

            return;

        }


        const recommendation =
            findRecommendation();


        if (
            !recommendation
        ) {

            return;

        }


        /*
         * Create Shadow DOM.
         *
         * This prevents your site's
         * existing CSS/theme from
         * overriding the Amazon card.
         */

        if (
            !container.attachShadow
        ) {

            return;

        }


        let shadow;


        try {

            shadow =
                container.attachShadow({
                    mode: "open"
                });

        } catch (
            error
        ) {

            return;

        }


        /* =====================================================
           SYSTEM THEME
        ====================================================== */

        const mediaQuery =
            window.matchMedia
                ? window.matchMedia(
                    "(prefers-color-scheme: dark)"
                )
                : null;


        if (
            mediaQuery &&
            mediaQuery.matches
        ) {

            container.dataset.theme =
                "dark";

        } else {

            container.dataset.theme =
                "light";

        }


        /* =====================================================
           STYLE
        ====================================================== */

        const style =
            document.createElement(
                "style"
            );


        style.textContent =
            CSS;


        shadow.appendChild(
            style
        );


        /* =====================================================
           CARD
        ====================================================== */

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "amz-card";


        const amazonURL =
            buildAmazonLink(
                recommendation,
                container
            );


        card.innerHTML = `

            <div class="amz-header">

                <div class="amz-brand">

                    <span class="amz-icon">

                        ${SHOPPING_ICON}

                    </span>

                    <span class="amz-brand-text">
                        Amazon
                    </span>

                </div>


                <span class="amz-available">
                    Available at Amazon
                </span>

            </div>


            <div class="amz-main">

                <div class="amz-copy">

                    <p class="amz-kicker">
                        Recommended resource
                    </p>


                    <h3 class="amz-title">
                        ${escapeHTML(
                            recommendation.title
                        )}
                    </h3>


                    <p class="amz-description">
                        ${escapeHTML(
                            recommendation.description
                        )}
                    </p>

                </div>


                <div class="amz-action">

                    <div class="amz-action-wrap">

                        <a
                            class="amz-button"
                            href="${escapeAttribute(
                                amazonURL
                            )}"
                            target="_blank"
                            rel="sponsored nofollow noopener noreferrer"
                            aria-label="See recommended resources on Amazon">

                            <span>
                                See options
                            </span>

                            ${ARROW_ICON}

                        </a>


                        <span class="amz-paid">
                            (paid link)
                        </span>

                    </div>

                </div>

            </div>


            <div class="amz-disclosure">

                As an Amazon Associate I earn from qualifying purchases.

            </div>

        `;


        shadow.appendChild(
            card
        );


        container.dataset.amazonRendered =
            "true";


        /* =====================================================
           LIVE SYSTEM THEME CHANGE
        ====================================================== */

        if (
            mediaQuery
        ) {

            const updateTheme =
                function () {

                    if (
                        mediaQuery.matches
                    ) {

                        container.dataset.theme =
                            "dark";

                    } else {

                        container.dataset.theme =
                            "light";

                    }

                };


            if (
                typeof mediaQuery.addEventListener ===
                "function"
            ) {

                mediaQuery.addEventListener(
                    "change",
                    updateTheme
                );

            } else if (
                typeof mediaQuery.addListener ===
                "function"
            ) {

                mediaQuery.addListener(
                    updateTheme
                );

            }

        }

    }


    /* =========================================================
       17. HTML ESCAPING
       ========================================================= */

    function escapeHTML(
        value
    ) {

        return String(
            value || ""
        )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

    }


    function escapeAttribute(
        value
    ) {

        return escapeHTML(
            value
        );

    }


    /* =========================================================
       18. INITIALIZE
       ========================================================= */

    function initialize() {

        render();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    } else {

        initialize();

    }

})();
