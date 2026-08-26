document.addEventListener("DOMContentLoaded", function () {

    const voltageInput = document.getElementById("ohms-voltage");
    const currentInput = document.getElementById("ohms-current");
    const resistanceInput = document.getElementById("ohms-resistance");

    const calculateSelect = document.getElementById("ohms-calculate");

    const voltageDisplay = document.getElementById("ohms-v-display");
    const currentDisplay = document.getElementById("ohms-i-display");
    const resistanceDisplay = document.getElementById("ohms-r-display");

    const resultElement = document.getElementById("ohms-result");
    const resultUnitElement = document.getElementById("ohms-result-unit");
    const resultFormulaElement = document.getElementById("ohms-result-formula");

    const errorElement = document.getElementById("ohms-error");

    const resetButton = document.getElementById("ohms-reset");

    const exampleEquation =
        document.getElementById("ohms-example-equation");

    const exampleText =
        document.getElementById("ohms-example-text");


    const defaults = {
        voltage: 12,
        current: 2,
        resistance: 6,
        calculate: "current"
    };


    function parseValue(input) {

        const value = Number.parseFloat(input.value);

        return Number.isFinite(value) ? value : null;

    }


    function formatNumber(value) {

        if (!Number.isFinite(value)) {
            return "—";
        }

        return value.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4
        });

    }


    function showError(message) {

        errorElement.textContent = message;
        errorElement.hidden = false;

    }


    function clearError() {

        errorElement.textContent = "";
        errorElement.hidden = true;

    }


    function updateDisplays() {

        const voltage = parseValue(voltageInput);
        const current = parseValue(currentInput);
        const resistance = parseValue(resistanceInput);

        voltageDisplay.textContent =
            voltage !== null
                ? `${formatNumber(voltage)} V`
                : "— V";

        currentDisplay.textContent =
            current !== null
                ? `${formatNumber(current)} A`
                : "— A";

        resistanceDisplay.textContent =
            resistance !== null
                ? `${formatNumber(resistance)} Ω`
                : "— Ω";

    }


    function calculate() {

        clearError();

        const mode = calculateSelect.value;

        let voltage = parseValue(voltageInput);
        let current = parseValue(currentInput);
        let resistance = parseValue(resistanceInput);

        let result = null;
        let unit = "";
        let formula = "";


        if (mode === "current") {

            if (voltage === null || resistance === null) {

                showError(
                    "Enter valid voltage and resistance values."
                );

                resultElement.textContent = "—";
                resultUnitElement.textContent = "";
                resultFormulaElement.textContent = "I = V ÷ R";

                updateDisplays();

                return;
            }


            if (resistance <= 0) {

                showError(
                    "Resistance must be greater than zero."
                );

                resultElement.textContent = "—";
                resultUnitElement.textContent = "";
                resultFormulaElement.textContent = "I = V ÷ R";

                return;
            }


            result = voltage / resistance;
            current = result;

            unit = "A";
            formula =
                `I = ${formatNumber(voltage)} V ÷ ${formatNumber(resistance)} Ω`;

            currentInput.value = result.toFixed(4);

        }


        if (mode === "voltage") {

            if (current === null || resistance === null) {

                showError(
                    "Enter valid current and resistance values."
                );

                resultElement.textContent = "—";
                resultUnitElement.textContent = "";
                resultFormulaElement.textContent = "V = I × R";

                updateDisplays();

                return;
            }


            result = current * resistance;
            voltage = result;

            unit = "V";
            formula =
                `V = ${formatNumber(current)} A × ${formatNumber(resistance)} Ω`;

            voltageInput.value = result.toFixed(4);

        }


        if (mode === "resistance") {

            if (voltage === null || current === null) {

                showError(
                    "Enter valid voltage and current values."
                );

                resultElement.textContent = "—";
                resultUnitElement.textContent = "";
                resultFormulaElement.textContent = "R = V ÷ I";

                updateDisplays();

                return;
            }


            if (current <= 0) {

                showError(
                    "Current must be greater than zero."
                );

                resultElement.textContent = "—";
                resultUnitElement.textContent = "";
                resultFormulaElement.textContent = "R = V ÷ I";

                return;
            }


            result = voltage / current;
            resistance = result;

            unit = "Ω";
            formula =
                `R = ${formatNumber(voltage)} V ÷ ${formatNumber(current)} A`;

            resistanceInput.value = result.toFixed(4);

        }


        resultElement.textContent = formatNumber(result);
        resultUnitElement.textContent = unit;

        resultFormulaElement.textContent = formula;

        updateDisplays();


        /* Example text */

        if (mode === "current") {

            exampleEquation.textContent =
                `I = ${formatNumber(voltage)} V ÷ ${formatNumber(resistance)} Ω = ${formatNumber(result)} A`;

            exampleText.textContent =
                `With ${formatNumber(voltage)} V across ${formatNumber(resistance)} Ω, the calculated current is ${formatNumber(result)} A.`;

        }


        if (mode === "voltage") {

            exampleEquation.textContent =
                `V = ${formatNumber(current)} A × ${formatNumber(resistance)} Ω = ${formatNumber(result)} V`;

            exampleText.textContent =
                `With ${formatNumber(current)} A flowing through ${formatNumber(resistance)} Ω, the calculated voltage is ${formatNumber(result)} V.`;

        }


        if (mode === "resistance") {

            exampleEquation.textContent =
                `R = ${formatNumber(voltage)} V ÷ ${formatNumber(current)} A = ${formatNumber(result)} Ω`;

            exampleText.textContent =
                `With ${formatNumber(voltage)} V and ${formatNumber(current)} A, the calculated resistance is ${formatNumber(result)} Ω.`;

        }

    }


    function setCalculatedInputState() {

        const mode = calculateSelect.value;

        voltageInput.readOnly = mode === "voltage";
        currentInput.readOnly = mode === "current";
        resistanceInput.readOnly = mode === "resistance";

        voltageInput.setAttribute(
            "aria-readonly",
            mode === "voltage" ? "true" : "false"
        );

        currentInput.setAttribute(
            "aria-readonly",
            mode === "current" ? "true" : "false"
        );

        resistanceInput.setAttribute(
            "aria-readonly",
            mode === "resistance" ? "true" : "false"
        );

    }


    function handleInput(event) {

        const mode = calculateSelect.value;

        const fieldId = event.target.id;


        /*
         * Prevent a calculated field from becoming the source value
         * when the user changes inputs manually.
         */

        if (
            (mode === "current" && fieldId === "ohms-current") ||
            (mode === "voltage" && fieldId === "ohms-voltage") ||
            (mode === "resistance" && fieldId === "ohms-resistance")
        ) {
            return;
        }


        calculate();

    }


    function resetCalculator() {

        voltageInput.value = defaults.voltage;
        currentInput.value = defaults.current;
        resistanceInput.value = defaults.resistance;

        calculateSelect.value = defaults.calculate;

        setCalculatedInputState();

        calculate();

    }


    calculateSelect.addEventListener("change", function () {

        setCalculatedInputState();

        calculate();

    });


    voltageInput.addEventListener("input", handleInput);
    currentInput.addEventListener("input", handleInput);
    resistanceInput.addEventListener("input", handleInput);


    resetButton.addEventListener("click", resetCalculator);


    setCalculatedInputState();
    calculate();

});
