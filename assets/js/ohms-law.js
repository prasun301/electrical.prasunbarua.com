/**
 * Ohm's Law Interactive Calculator
 * Electrical Engineering by Prasun Barua
 *
 * Formula:
 * V = I × R
 *
 * The user can change any one value.
 * The calculator determines the corresponding value.
 */

(function () {

    "use strict";


    function initOhmsLaw() {

        /* =====================================================
           GET ELEMENTS
        ===================================================== */

        const voltageInput =
            document.getElementById("ohms-voltage");

        const currentInput =
            document.getElementById("ohms-current");

        const resistanceInput =
            document.getElementById("ohms-resistance");


        const voltageDisplay =
            document.getElementById("ohms-v-display");

        const currentDisplay =
            document.getElementById("ohms-i-display");

        const resistanceDisplay =
            document.getElementById("ohms-r-display");


        const resultDisplay =
            document.getElementById("ohms-result");

        const resetButton =
            document.getElementById("ohms-reset");


        /* =====================================================
           CHECK REQUIRED ELEMENTS
        ===================================================== */

        if (
            !voltageInput ||
            !currentInput ||
            !resistanceInput ||
            !voltageDisplay ||
            !currentDisplay ||
            !resistanceDisplay ||
            !resultDisplay ||
            !resetButton
        ) {

            console.error(
                "Ohm's Law calculator: Required HTML elements were not found."
            );

            return;

        }


        /* =====================================================
           DEFAULT VALUES
        ===================================================== */

        const DEFAULTS = {

            voltage: 12,

            current: 2,

            resistance: 6

        };


        /* =====================================================
           FORMAT NUMBER
        ===================================================== */

        function formatNumber(value) {

            if (!Number.isFinite(value)) {

                return "—";

            }

            return Number(value).toFixed(2);

        }


        /* =====================================================
           GET NUMBER
        ===================================================== */

        function getNumber(input) {

            const value =
                parseFloat(input.value);

            return Number.isFinite(value)
                ? value
                : null;

        }


        /* =====================================================
           UPDATE TOP EQUATION
        ===================================================== */

        function updateDisplays(
            voltage,
            current,
            resistance
        ) {

            voltageDisplay.textContent =
                `${formatNumber(voltage)} V`;

            currentDisplay.textContent =
                `${formatNumber(current)} A`;

            resistanceDisplay.textContent =
                `${formatNumber(resistance)} Ω`;

        }


        /* =====================================================
           UPDATE RESULT
        ===================================================== */

        function updateResult(
            value,
            unit,
            label
        ) {

            const resultLabel =
                document.querySelector(
                    ".ohms-result-label"
                );

            const resultUnit =
                document.querySelector(
                    ".ohms-result-value span:last-child"
                );

            const resultDescription =
                document.querySelector(
                    ".ohms-result-box p"
                );


            resultDisplay.textContent =
                formatNumber(value);


            if (resultLabel) {

                resultLabel.textContent =
                    `Calculated ${label}`;

            }


            if (resultUnit) {

                resultUnit.textContent =
                    unit;

            }


            if (resultDescription) {

                if (label === "Current") {

                    resultDescription.textContent =
                        "Current = Voltage ÷ Resistance";

                }

                else if (label === "Voltage") {

                    resultDescription.textContent =
                        "Voltage = Current × Resistance";

                }

                else if (label === "Resistance") {

                    resultDescription.textContent =
                        "Resistance = Voltage ÷ Current";

                }

            }

        }


        /* =====================================================
           CALCULATE
        ===================================================== */

        function calculate(changedField) {

            let voltage =
                getNumber(voltageInput);

            let current =
                getNumber(currentInput);

            let resistance =
                getNumber(resistanceInput);


            /* =================================================
               VOLTAGE CHANGED
            ================================================= */

            if (changedField === "voltage") {

                if (
                    voltage === null ||
                    resistance === null ||
                    resistance <= 0
                ) {

                    return;

                }


                current =
                    voltage / resistance;


                currentInput.value =
                    formatNumber(current);


                updateResult(
                    current,
                    "A",
                    "Current"
                );

            }


            /* =================================================
               CURRENT CHANGED
            ================================================= */

            else if (changedField === "current") {

                if (
                    current === null ||
                    resistance === null ||
                    resistance <= 0
                ) {

                    return;

                }


                voltage =
                    current * resistance;


                voltageInput.value =
                    formatNumber(voltage);


                updateResult(
                    voltage,
                    "V",
                    "Voltage"
                );

            }


            /* =================================================
               RESISTANCE CHANGED
            ================================================= */

            else if (changedField === "resistance") {

                if (
                    voltage === null ||
                    resistance === null ||
                    resistance <= 0
                ) {

                    return;

                }


                current =
                    voltage / resistance;


                currentInput.value =
                    formatNumber(current);


                updateResult(
                    current,
                    "A",
                    "Current"
                );

            }


            /* =================================================
               FINAL VALUES
            ================================================= */

            voltage =
                getNumber(voltageInput);

            current =
                getNumber(currentInput);

            resistance =
                getNumber(resistanceInput);


            /* =================================================
               UPDATE EQUATION DISPLAY
            ================================================= */

            updateDisplays(
                voltage,
                current,
                resistance
            );

        }


        /* =====================================================
           VOLTAGE INPUT
        ===================================================== */

        voltageInput.addEventListener(
            "input",
            function () {

                calculate("voltage");

            }
        );


        /* =====================================================
           CURRENT INPUT
        ===================================================== */

        currentInput.addEventListener(
            "input",
            function () {

                calculate("current");

            }
        );


        /* =====================================================
           RESISTANCE INPUT
        ===================================================== */

        resistanceInput.addEventListener(
            "input",
            function () {

                calculate("resistance");

            }
        );


        /* =====================================================
           RESET
        ===================================================== */

        resetButton.addEventListener(
            "click",
            function () {

                voltageInput.value =
                    DEFAULTS.voltage;

                currentInput.value =
                    DEFAULTS.current;

                resistanceInput.value =
                    DEFAULTS.resistance;


                updateDisplays(
                    DEFAULTS.voltage,
                    DEFAULTS.current,
                    DEFAULTS.resistance
                );


                updateResult(
                    DEFAULTS.current,
                    "A",
                    "Current"
                );

            }
        );


        /* =====================================================
           INITIAL DISPLAY
        ===================================================== */

        updateDisplays(
            DEFAULTS.voltage,
            DEFAULTS.current,
            DEFAULTS.resistance
        );


        updateResult(
            DEFAULTS.current,
            "A",
            "Current"
        );


        console.log(
            "Ohm's Law interactive calculator initialized successfully."
        );

    }


    /* =========================================================
       DOM READY
    ========================================================= */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initOhmsLaw,
            {
                once: true
            }
        );

    }

    else {

        initOhmsLaw();

    }

})();
