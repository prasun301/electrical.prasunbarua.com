(function () {

    "use strict";


    /* =========================================================
       PRASUN BARUA
       AMAZON RECOMMENDATION ENGINE
       ELECTRICAL ENGINEERING SITE
       ========================================================= */


    /* =========================================================
       1. AMAZON CONFIGURATION
       ========================================================= */

    const AMAZON_TAG =
        "prasunbaru0d7-20";


    /*
       Your main Amazon SiteStripe / Associate short link.
       Used as the final fallback.
    */
    const AMAZON_FALLBACK_LINK =
        "https://link.amazon/B08F9UQ6O";


    /*
       Widget ID.
    */
    const WIDGET_ID =
        "prasun-amazon-auto";


    /*
       Your article URL structure.
    */
    const ARTICLE_URL_PATTERN =
        /\/articles\//i;


    /* =========================================================
       2. ELECTRICAL ENGINEERING CATALOG
       ========================================================= */

    const CATALOG = [

        /* =====================================================
           ELECTRICAL FUNDAMENTALS
        ====================================================== */

        {
            id: "electrical-fundamentals",

            folders: [
                "electrical-fundamentals"
            ],

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
                "Explore practical books and learning resources covering circuits, electrical fundamentals and engineering principles.",

            query:
                "electrical engineering circuits fundamentals book"
        },


        /* =====================================================
           ELECTRICAL CALCULATIONS
        ====================================================== */

        {
            id: "electrical-calculations",

            folders: [
                "electrical-calculations",
                "electrical-calculation"
            ],

            keywords: [
                "electrical calculation",
                "electrical calculations",
                "power calculation",
                "electrical power calculation",
                "power formula",
                "energy calculation",
                "current calculation",
                "electrical engineering calculation"
            ],

            title:
                "Electrical Engineering Calculation Resources",

            description:
                "Explore practical references, handbooks and tools for electrical power, energy, current and engineering calculations.",

            query:
                "electrical engineering calculations handbook power calculations"
        },


        /* =====================================================
           VOLTAGE DROP
        ====================================================== */

        {
            id: "voltage-drop",

            folders: [
                "voltage-drop"
            ],

            keywords: [
                "voltage drop",
                "voltage-drop calculation",
                "voltage drop calculation",
                "voltage loss"
            ],

            title:
                "Voltage Drop & Cable Sizing Resources",

            description:
                "Explore practical references and tools for voltage-drop calculations, cable selection and electrical design.",

            query:
                "electrical voltage drop cable sizing engineering book"
        },


        /* =====================================================
           CABLES / WIRING
        ====================================================== */

        {
            id: "cables",

            folders: [
                "cables",
                "cable-sizing",
                "wire-sizing"
            ],

            keywords: [
                "cable sizing",
                "cable size",
                "wire size",
                "wire sizing",
                "conductor sizing",
                "ampacity",
                "cable selection",
                "cable calculation",
                "electrical cable",
                "wiring"
            ],

            title:
                "Electrical Cable Tools & Resources",

            description:
                "Explore practical tools, accessories and references for cable selection, sizing and electrical installation.",

            query:
                "electrical cable sizing tools wire crimper engineering"
        },


        /* =====================================================
           POWER SYSTEMS
        ====================================================== */

        {
            id: "power-systems",

            folders: [
                "power-systems",
                "power-system"
            ],

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
                "Explore engineering references covering power-system analysis, load flow, grid integration and electrical networks.",

            query:
                "electrical power systems engineering analysis book"
        },


        /* =====================================================
           PROTECTION
        ====================================================== */

        {
            id: "protection",

            folders: [
                "protection",
                "power-system-protection",
                "relay"
            ],

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


        /* =====================================================
           CIRCUIT BREAKERS
        ====================================================== */

        {
            id: "breakers",

            folders: [
                "circuit-breakers",
                "circuit-breaker",
                "mcb",
                "mccb"
            ],

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


        /* =====================================================
           EARTHING / GROUNDING
        ====================================================== */

        {
            id: "grounding",

            folders: [
                "earthing",
                "grounding"
            ],

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
                "Explore practical references and tools for grounding, earthing-system design, testing and electrical safety.",

            query:
                "electrical grounding earthing engineering book"
        },


        /* =====================================================
           TRANSFORMERS
        ====================================================== */

        {
            id: "transformers",

            folders: [
                "transformers",
                "transformer"
            ],

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
                "Explore practical references covering transformer selection, design, testing, protection and applications.",

            query:
                "electrical transformer engineering design book"
        },


        /* =====================================================
           SWITCHGEAR / SUBSTATION
        ====================================================== */

        {
            id: "switchgear",

            folders: [
                "switchgear",
                "substation"
            ],

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
                "Explore engineering references covering switchgear, substations, busbars and medium- and high-voltage systems.",

            query:
                "electrical switchgear substation engineering book"
        },


        /* =====================================================
           SOLAR PV
        ====================================================== */

        {
            id: "solar-pv",

            folders: [
                "solar-pv",
                "solar",
                "photovoltaic"
            ],

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
                "Explore practical references for photovoltaic design, installation, sizing, analysis and system optimization.",

            query:
                "solar photovoltaic engineering design installation book"
        },


        /* =====================================================
           BESS
        ====================================================== */

        {
            id: "bess",

            folders: [
                "bess",
                "battery-energy-storage",
                "energy-storage"
            ],

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


        /* =====================================================
           POWER ELECTRONICS
        ====================================================== */

        {
            id: "power-electronics",

            folders: [
                "power-electronics"
            ],

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


        /* =====================================================
           TESTING / COMMISSIONING
        ====================================================== */

        {
            id: "testing",

            folders: [
                "testing-commissioning",
                "testing",
                "commissioning"
            ],

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


        /* =====================================================
           DATA CENTER / UPS
        ====================================================== */

        {
            id: "data-center",

            folders: [
                "data-center",
                "data-centre",
                "ups"
            ],

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
                "Explore engineering references covering UPS systems, critical power and electrical infrastructure.",

            query:
                "UPS critical power data center electrical engineering book"
        }

    ];


    /* =========================================================
       3. STYLES
       ========================================================= */

    const CSS = `

        :host {

            display: block !important;

            width: 100% !important;

            max-width: 100% !important;

            margin: 34px 0 !important;

            padding: 0 !important;

            background: transparent !important;

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


        /* =====================================================
           CARD
        ====================================================== */

        .amz-card {

            width: 100%;

            max-width: 760px;

            margin: 0 auto;

            padding: 19px 20px 14px;

            background: #ffffff;

            border:
                1px solid #e3e6e8;

            border-radius: 14px;

            color: #1d1d1f;

            box-shadow:
                0 2px 12px rgba(15,17,17,.055);

            overflow: hidden;

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
                0 5px 19px rgba(15,17,17,.085);
        }


        /* =====================================================
           HEADER
        ====================================================== */

        .amz-header {

            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 14px;

            margin-bottom: 17px;
        }


        .amz-brand {

            display: inline-flex;

            align-items: center;

            gap: 9px;

            color: #1d1d1f;
        }


        .amz-icon {

            display: inline-flex;

            align-items: center;

            justify-content: center;

            width: 31px;

            height: 31px;

            flex: 0 0 31px;

            border-radius: 8px;

            background: #fff7df;

            color: #34393c;
        }


        .amz-brand-text {

            font-size: 14px;

            line-height: 1;

            font-weight: 700;

            letter-spacing: -.01em;
        }


        .amz-available {

            padding: 6px 9px;

            border:
                1px solid #e2e5e7;

            border-radius: 999px;

            background: #f7f8f8;

            color: #62676b;

            font-size: 9px;

            line-height: 1;

            font-weight: 700;

            letter-spacing: .045em;

            text-transform: uppercase;

            white-space: nowrap;
        }


        /* =====================================================
           MAIN
        ====================================================== */

        .amz-main {

            display: grid;

            grid-template-columns:
                minmax(0,1fr)
                auto;

            align-items: center;

            gap: 24px;
        }


        .amz-copy {

            min-width: 0;
        }


        .amz-kicker {

            margin:
                0 0 5px;

            padding: 0;

            color: #e47911;

            font-size: 10px;

            line-height: 1.3;

            font-weight: 700;

            letter-spacing: .06em;

            text-transform: uppercase;
        }


        .amz-title {

            margin:
                0 0 6px;

            padding: 0;

            color: #1d1d1f;

            font-size: 17px;

            line-height: 1.35;

            font-weight: 650;

            letter-spacing: -.015em;
        }


        .amz-description {

            margin: 0;

            padding: 0;

            max-width: 580px;

            color: #5f6367;

            font-size: 12.5px;

            line-height: 1.55;
        }


        /* =====================================================
           ACTION
        ====================================================== */

        .amz-action {

            display: flex;

            align-items: center;

            justify-content: center;

            flex-shrink: 0;
        }


        .amz-action-wrap {

            display: flex;

            flex-direction: column;

            align-items: center;
        }


        .amz-button {

            display: inline-flex;

            align-items: center;

            justify-content: center;

            gap: 8px;

            min-height: 41px;

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

            cursor:
                pointer;

            box-shadow:
                0 1px 2px rgba(15,17,17,.10);

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
                0 3px 8px rgba(15,17,17,.14);
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


        /* =====================================================
           DISCLOSURE
        ====================================================== */

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
           SYSTEM PREFERENCE
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
                    0 4px 16px rgba(0,0,0,.30);
            }


            .amz-card:hover {

                border-color:
                    #3b4651;

                box-shadow:
                    0 6px 22px rgba(0,0,0,.38);
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
           MOBILE
        ====================================================== */

        @media (max-width: 620px) {

            :host {

                margin:
                    26px 0 !important;
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
       4. SHOPPING ICON
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
       6. NORMALIZE TEXT
       ========================================================= */

    function normalizeText(
        value
    ) {

        return String(
            value || ""
        )
        .toLowerCase()
        .replace(/[-_/]+/g, " ")
        .replace(/[^\w\s'.&]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    }


    /* =========================================================
       7. ARTICLE PAGE CHECK
       ========================================================= */

    function isArticlePage() {

        const path =
            window.location.pathname || "";


        if (
            ARTICLE_URL_PATTERN.test(
                path
            )
        ) {

            return true;

        }


        return !!(
            document.querySelector(
                ".article-content"
            ) ||

            document.querySelector(
                "article.article-main"
            ) ||

            document.querySelector(
                "article"
            )

        );

    }


    /* =========================================================
       8. FIND ARTICLE
       ========================================================= */

    function getArticleElement() {

        return (

            document.querySelector(
                ".article-content"
            )?.closest("article") ||

            document.querySelector(
                "article.article-main"
            ) ||

            document.querySelector(
                "article"
            ) ||

            document.querySelector(
                ".article-content"
            )

        );

    }


    /* =========================================================
       9. FIND ARTICLE BODY
       ========================================================= */

    function getArticleBodyElement() {

        return (

            document.querySelector(
                ".article-content"
            ) ||

            document.querySelector(
                "article .article-content"
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
       10. ARTICLE TITLE
       ========================================================= */

    function getArticleTitle() {

        const titleElement =

            document.querySelector(
                ".article-content h1"
            ) ||

            document.querySelector(
                ".article-main h1"
            ) ||

            document.querySelector(
                "article h1"
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
        .replace(
            /\s*\|.*$/,
            ""
        )
        .trim();

    }


    /* =========================================================
       11. ARTICLE BODY TEXT
       ========================================================= */

    function getArticleText() {

        const body =
            getArticleBodyElement();


        if (!body) {

            return "";

        }


        return (
            body.textContent ||
            body.innerText ||
            ""
        );

    }


    /* =========================================================
       12. ARTICLE CATEGORY
       ========================================================= */

    function getArticleCategory() {

        /*
         * Your actual article uses:
         *
         * <meta property="article:section"
         * content="Electrical Calculations">
         */

        const propertyMeta =
            document.querySelector(
                'meta[property="article:section"]'
            );


        if (
            propertyMeta &&
            propertyMeta.content
        ) {

            return normalizeText(
                propertyMeta.content
            );

        }


        /*
         * Additional support.
         */

        const nameMeta =
            document.querySelector(
                'meta[name="article:section"]'
            );


        if (
            nameMeta &&
            nameMeta.content
        ) {

            return normalizeText(
                nameMeta.content
            );

        }


        const categoryElement =
            document.querySelector(
                ".article-category-label"
            );


        if (
            categoryElement
        ) {

            return normalizeText(
                categoryElement.textContent
            );

        }


        return "";

    }


    /* =========================================================
       13. URL / FOLDER SIGNAL
       ========================================================= */

    function getURLText() {

        return normalizeText(
            window.location.pathname
        );

    }


    /* =========================================================
       14. GET ARTICLE HEADINGS
       ========================================================= */

    function getHeadingText() {

        const body =
            getArticleBodyElement();


        if (!body) {

            return "";

        }


        const headings =
            body.querySelectorAll(
                "h2, h3"
            );


        let text =
            "";


        headings.forEach(
            function (
                heading
            ) {

                text +=
                    " " +
                    (
                        heading.textContent ||
                        heading.innerText ||
                        ""
                    );

            }
        );


        return normalizeText(
            text
        );

    }


    /* =========================================================
       15. SCORE A CATALOG ITEM
       ========================================================= */

    function scoreRecommendation(
        item,
        signals
    ) {

        let score =
            0;


        /*
         * -----------------------------------------------------
         * CATEGORY
         * Strong signal.
         * -----------------------------------------------------
         */

        if (
            signals.category
        ) {

            const category =
                signals.category;


            item.keywords.forEach(
                function (
                    keyword
                ) {

                    const key =
                        normalizeText(
                            keyword
                        );


                    if (
                        category === key
                    ) {

                        score +=
                            30;

                    }


                    if (
                        category.includes(
                            key
                        )
                    ) {

                        score +=
                            12;

                    }

                }
            );

        }


        /*
         * -----------------------------------------------------
         * URL / FOLDER
         * Very strong signal.
         * -----------------------------------------------------
         */

        if (
            signals.url
        ) {

            item.folders.forEach(
                function (
                    folder
                ) {

                    const normalizedFolder =
                        normalizeText(
                            folder
                        );


                    if (
                        signals.url.includes(
                            normalizedFolder
                        )
                    ) {

                        score +=
                            22;

                    }

                }
            );

        }


        /*
         * -----------------------------------------------------
         * TITLE
         * Strongest textual signal.
         * -----------------------------------------------------
         */

        item.keywords.forEach(
            function (
                keyword
            ) {

                const key =
                    normalizeText(
                        keyword
                    );


                if (
                    signals.title.includes(
                        key
                    )
                ) {

                    score +=
                        18;

                }


                if (
                    signals.headings.includes(
                        key
                    )
                ) {

                    score +=
                        7;

                }


                /*
                 * Body is deliberately given
                 * much less weight.
                 */

                if (
                    signals.body.includes(
                        key
                    )
                ) {

                    score +=
                        1;

                }

            }
        );


        return score;

    }


    /* =========================================================
       16. FIND BEST RECOMMENDATION
       ========================================================= */

    function findRecommendation() {

        const signals = {

            title:
                normalizeText(
                    getArticleTitle()
                ),

            category:
                getArticleCategory(),

            url:
                getURLText(),

            headings:
                getHeadingText(),

            body:
                normalizeText(
                    getArticleText()
                )

        };


        if (
            !signals.title &&
            !signals.body
        ) {

            return null;

        }


        let bestItem =
            null;


        let bestScore =
            0;


        CATALOG.forEach(
            function (
                item
            ) {

                const score =
                    scoreRecommendation(
                        item,
                        signals
                    );


                if (
                    score > bestScore
                ) {

                    bestScore =
                        score;

                    bestItem =
                        item;

                }

            }
        );


        /*
         * Generic electrical-engineering
         * fallback.
         */

        if (
            !bestItem ||
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


        return bestItem;

    }


    /* =========================================================
       17. AMAZON URL
       ========================================================= */

    function buildAmazonURL(
        recommendation,
        container
    ) {

        /*
         * Optional direct ASIN.

         * Example:
         *
         * <div
         *     id="prasun-amazon-auto"
         *     data-amazon-asin="B0XXXXXXXX"
         * ></div>
         */

        const asin =
            container &&
            container.dataset
                ? (
                    container.dataset.amazonAsin ||
                    ""
                ).trim()
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
         * Topic-specific Amazon search.
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
         * Final fallback.
         */

        return AMAZON_FALLBACK_LINK;

    }


    /* =========================================================
       18. ESCAPE HTML
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


    /* =========================================================
       19. ESCAPE ATTRIBUTE
       ========================================================= */

    function escapeAttribute(
        value
    ) {

        return escapeHTML(
            value
        );

    }


    /* =========================================================
       20. FIND OR CREATE WIDGET
       ========================================================= */

    function getWidgetContainer() {

        /*
         * Explicit placeholder first.
         */

        const existing =
            document.getElementById(
                WIDGET_ID
            );


        if (
            existing
        ) {

            return existing;

        }


        /*
         * Automatic placement after
         * .article-content.
         */

        const articleBody =
            getArticleBodyElement();


        if (
            !articleBody
        ) {

            return null;

        }


        const container =
            document.createElement(
                "div"
            );


        container.id =
            WIDGET_ID;


        /*
         * Insert immediately after
         * the complete article content.
         */

        articleBody.insertAdjacentElement(
            "afterend",
            container
        );


        return container;

    }


    /* =========================================================
       21. RENDER WIDGET
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
         * Prevent duplicates.
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
         * Shadow DOM isolates this widget
         * from the site's normal CSS.
         */

        if (
            !container.attachShadow
        ) {

            return;

        }


        let shadowRoot;


        try {

            shadowRoot =
                container.attachShadow({
                    mode: "open"
                });

        } catch (
            error
        ) {

            return;

        }


        /* =====================================================
           CSS
        ====================================================== */

        const style =
            document.createElement(
                "style"
            );


        style.textContent =
            CSS;


        shadowRoot.appendChild(
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
            buildAmazonURL(
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


        shadowRoot.appendChild(
            card
        );


        /*
         * Mark rendered.
         */

        container.dataset.amazonRendered =
            "true";


        /* =====================================================
           LIVE SYSTEM THEME CHANGE
        ====================================================== */

        if (
            window.matchMedia
        ) {

            const mediaQuery =
                window.matchMedia(
                    "(prefers-color-scheme: dark)"
                );


            const updateTheme =
                function () {

                    /*
                     * The actual colors are controlled
                     * by CSS @media inside the Shadow DOM.
                     *
                     * This listener forces a repaint by
                     * touching the host property and also
                     * provides compatibility with browsers
                     * that need a DOM update.
                     */

                    container.setAttribute(
                        "data-system-theme",
                        mediaQuery.matches
                            ? "dark"
                            : "light"
                    );

                };


            updateTheme();


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
       22. INITIALIZATION
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
