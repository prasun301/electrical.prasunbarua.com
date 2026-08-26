/**
 * Ohm's Law Interactive Calculator
 * Electrical Engineering by Prasun Barua
 *
 * V = I × R
 * I = V ÷ R
 * R = V ÷ I
 */

(() => {
    "use strict";

    /* =========================================================
       WAIT FOR DOM
       ========================================================= */

    function initOhmsLaw() {

        /* -----------------------------------------------------
           FIND ELEMENTS
           ----------------------------------------------------- */

        const voltageInput = document.getElementById("ohm-voltage");
        const currentInput = document.getElementById("ohm-current");
        const resistanceInput = document.getElementById("ohm-resistance");

        const voltageValue = document.getElementById("ohm-voltage-value");
        const currentValue = document.getElementById("ohm-current-value");
        const resistanceValue = document.getElementById("ohm-resistance-value");

        const voltageDisplay = document.getElementById("ohm-voltage-display");
        const currentDisplay = document.getElementById("ohm-current-display");
        const resistanceDisplay = document.getElementById("ohm-resistance-display");

        const calculatedValue = document.getElementById("ohm-calculated-value");
        const calculatedUnit = document.getElementById("ohm-calculated-unit");
        const calculationText = document.getElementById("ohm-calculation-text");
        const explanation = document.getElementById("ohm-explanation");


        /* -----------------------------------------------------
           CHECK REQUIRED ELEMENTS
           ----------------------------------------------------- */

        if (
            !voltageInput ||
            !currentInput ||
            !resistanceInput
        ) {
            console.warn(
                "Ohm's Law Interactive: Required input elements were not found."
            );

            return;
        }


        /* =====================================================
           STATE
           ===================================================== */

        let activeInput = "voltage";


        /* =====================================================
           HELPERS
           ===================================================== */

        function getNumber(input) {
            const value = parseFloat(input.value);

            return Number.isFinite(value) ? value : 0;
        }


        function formatNumber(value) {

            if (!Number.isFinite(value)) {
                return "0";
            }

            if (Math.abs(value) >= 1000) {
                return value.toFixed(0);
            }

            if (Math.abs(value) >= 100) {
                return value.toFixed(1);
            }

            if (Math.abs(value) >= 10) {
                return value.toFixed(2);
            }

            return value.toFixed(2);
        }


        function updateText(element, value) {

            if (element) {
                element.textContent = value;
            }
        }


        /* =====================================================
           UPDATE DISPLAY
           ===================================================== */

        function updateDisplays() {

            const voltage = getNumber(voltageInput);
            const current = getNumber(currentInput);
            const resistance = getNumber(resistanceInput);

            updateText(
                voltageValue,
                formatNumber(voltage)
            );

            updateText(
                currentValue,
                formatNumber(current)
            );

            updateText(
                resistanceValue,
                formatNumber(resistance)
            );

            updateText(
                voltageDisplay,
                formatNumber(voltage)
            );

            updateText(
                currentDisplay,
                formatNumber(current)
            );

            updateText(
                resistanceDisplay,
                formatNumber(resistance)
            );
        }


        /* =====================================================
           CALCULATE OHM'S LAW
           ===================================================== */

        function calculate() {

            let voltage = getNumber(voltageInput);
            let current = getNumber(currentInput);
            let resistance = getNumber(resistanceInput);

            let result = 0;
            let unit = "";
            let equation = "";
            let message = "";


            /* -------------------------------------------------
               VOLTAGE IS BEING ADJUSTED
               Calculate CURRENT

               I = V / R
               ------------------------------------------------- */

            if (activeInput === "voltage") {

                if (resistance <= 0) {

                    result = 0;
                    unit = "A";

                    equation =
                        "Enter a resistance greater than 0 Ω.";

                    message =
                        "Increase the resistance above zero to calculate current.";

                } else {

                    current = voltage / resistance;

                    currentInput.value = current;

                    result = current;
                    unit = "A";

                    equation =
                        `${formatNumber(voltage)} V ÷ ` +
                        `${formatNumber(resistance)} Ω`;

                    message =
                        "Current is calculated from voltage divided by resistance.";
                }
            }


            /* -------------------------------------------------
               CURRENT IS BEING ADJUSTED
               Calculate VOLTAGE

               V = I × R
               ------------------------------------------------- */

            else if (activeInput === "current") {

                voltage = current * resistance;

                voltageInput.value = voltage;

                result = voltage;
                unit = "V";

                equation =
                    `${formatNumber(current)} A × ` +
                    `${formatNumber(resistance)} Ω`;

                message =
                    "Voltage is calculated by multiplying current by resistance.";
            }


            /* -------------------------------------------------
               RESISTANCE IS BEING ADJUSTED
               Calculate CURRENT

               I = V / R
               ------------------------------------------------- */

            else if (activeInput === "resistance") {

                if (resistance <= 0) {

                    result = 0;
                    unit = "A";

                    equation =
                        "Enter a resistance greater than 0 Ω.";

                    message =
                        "Resistance must be greater than zero.";

                } else {

                    current = voltage / resistance;

                    currentInput.value = current;

                    result = current;
                    unit = "A";

                    equation =
                        `${formatNumber(voltage)} V ÷ ` +
                        `${formatNumber(resistance)} Ω`;

                    message =
                        "Current is calculated from voltage divided by resistance.";
                }
            }


            /* -------------------------------------------------
               UPDATE INTERFACE
               ------------------------------------------------- */

            updateDisplays();

            updateText(
                calculatedValue,
                formatNumber(result)
            );

            updateText(
                calculatedUnit,
                unit
            );

            updateText(
                calculationText,
                equation
            );

            updateText(
                explanation,
                message
            );
        }


        /* =====================================================
           INPUT EVENTS
           ===================================================== */

        voltageInput.addEventListener(
            "input",
            () => {

                activeInput = "voltage";

                calculate();
            }
        );


        currentInput.addEventListener(
            "input",
            () => {

                activeInput = "current";

                calculate();
            }
        );


        resistanceInput.addEventListener(
            "input",
            () => {

                activeInput = "resistance";

                calculate();
            }
        );


        /* =====================================================
           INITIAL VALUES
           ===================================================== */

        /*
         * Default example:
         *
         * V = 12 V
         * R = 6 Ω
         * I = 2 A
         */

        if (!voltageInput.value) {
            voltageInput.value = "12";
        }

        if (!currentInput.value) {
            currentInput.value = "2";
        }

        if (!resistanceInput.value) {
            resistanceInput.value = "6";
        }


        /* =====================================================
           INITIAL DISPLAY
           ===================================================== */

        activeInput = "voltage";

        calculate();


        /* =====================================================
           READY MESSAGE
           ===================================================== */

        console.log(
            "Ohm's Law Interactive Calculator initialized successfully."
        );
    }


    /* =========================================================
       INITIALIZE AFTER PAGE LOAD
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
