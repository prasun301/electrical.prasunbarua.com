/**
 * Ohm's Law Interactive Calculator
 * Electrical Engineering by Prasun Barua
 *
 * Formula:
 * V = I × R
 *
 * The user can change any two values.
 * The third value is calculated automatically.
 */

(function () {
    "use strict";

    function initOhmsLaw() {

        /* =====================================================
           GET ELEMENTS
        ===================================================== */

        const voltageInput = document.getElementById("ohms-voltage");
        const currentInput = document.getElementById("ohms-current");
        const resistanceInput = document.getElementById("ohms-resistance");

        const voltageDisplay = document.getElementById("ohms-v-display");
        const currentDisplay = document.getElementById("ohms-i-display");
        const resistanceDisplay = document.getElementById("ohms-r-display");

        const resultDisplay = document.getElementById("ohms-result");

        const resetButton = document.getElementById("ohms-reset");


        /* =====================================================
           CHECK ELEMENTS
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
           STATE
        ===================================================== */

        let lastChanged = "voltage";


        /* =====================================================
           NUMBER HELPERS
        ===================================================== */

        function getNumber(input) {

            const value = parseFloat(input.value);

            return Number.isFinite(value) ? value : null;
        }


        function formatNumber(value, decimals = 2) {

            if (!Number.isFinite(value)) {
                return "—";
            }

            return value.toFixed(decimals);
        }


        /* =====================================================
           UPDATE DISPLAY
        ===================================================== */

        function updateDisplays(voltage, current, resistance) {

            voltageDisplay.textContent =
                `${formatNumber(voltage, 2)} V`;

            currentDisplay.textContent =
                `${formatNumber(current, 2)} A`;

            resistanceDisplay.textContent =
                `${formatNumber(resistance, 2)} Ω`;
        }


        /* =====================================================
           CALCULATE
        ===================================================== */

        function calculate(changedField) {

            let voltage = getNumber(voltageInput);
            let current = getNumber(currentInput);
            let resistance = getNumber(resistanceInput);


            /* -----------------------------------------------
               VOLTAGE CHANGED
               Calculate current from V ÷ R
            ------------------------------------------------ */

            if (changedField === "voltage") {

                if (
                    voltage === null ||
                    resistance === null ||
                    resistance <= 0
                ) {
                    return;
                }

                current = voltage / resistance;

                currentInput.value =
                    formatNumber(current, 2);
            }


            /* -----------------------------------------------
               CURRENT CHANGED
               Calculate voltage from I × R
            ------------------------------------------------ */

            else if (changedField === "current") {

                if (
                    current === null ||
                    resistance === null
                ) {
                    return;
                }

                voltage = current * resistance;

                voltageInput.value =
                    formatNumber(voltage, 2);
            }


            /* -----------------------------------------------
               RESISTANCE CHANGED
               Calculate current from V ÷ R
            ------------------------------------------------ */

            else if (changedField === "resistance") {

                if (
                    voltage === null ||
                    resistance === null ||
                    resistance <= 0
                ) {
                    return;
                }

                current = voltage / resistance;

                currentInput.value =
                    formatNumber(current, 2);
            }


            /* -----------------------------------------------
               GET FINAL VALUES
            ------------------------------------------------ */

            voltage = getNumber(voltageInput);
            current = getNumber(currentInput);
            resistance = getNumber(resistanceInput);


            /* -----------------------------------------------
               UPDATE EQUATION
            ------------------------------------------------ */

            updateDisplays(
                voltage,
                current,
                resistance
            );


            /* -----------------------------------------------
               UPDATE RESULT
            ------------------------------------------------ */

            if (
                voltage !== null &&
                resistance !== null &&
                resistance > 0
            ) {

                const calculatedCurrent =
                    voltage / resistance;

                resultDisplay.textContent =
                    formatNumber(calculatedCurrent, 2);

            } else {

                resultDisplay.textContent = "—";

            }

        }


        /* =====================================================
           INPUT EVENTS
        ===================================================== */

        voltageInput.addEventListener(
            "input",
            function () {

                lastChanged = "voltage";

                calculate("voltage");

            }
        );


        currentInput.addEventListener(
            "input",
            function () {

                lastChanged = "current";

                calculate("current");

            }
        );


        resistanceInput.addEventListener(
            "input",
            function () {

                lastChanged = "resistance";

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

                lastChanged = "voltage";

                updateDisplays(
                    DEFAULTS.voltage,
                    DEFAULTS.current,
                    DEFAULTS.resistance
                );

                resultDisplay.textContent =
                    formatNumber(
                        DEFAULTS.voltage /
                        DEFAULTS.resistance,
                        2
                    );

            }
        );


        /* =====================================================
           INITIAL CALCULATION
        ===================================================== */

        updateDisplays(
            DEFAULTS.voltage,
            DEFAULTS.current,
            DEFAULTS.resistance
        );

        resultDisplay.textContent =
            formatNumber(
                DEFAULTS.voltage /
                DEFAULTS.resistance,
                2
            );


        console.log(
            "Ohm's Law interactive calculator initialized successfully."
        );

    }


    /* =========================================================
       DOM READY
       ========================================================= */

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initOhmsLaw,
            { once: true }
        );

    } else {

        initOhmsLaw();

    }

})();
