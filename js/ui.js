document.addEventListener("DOMContentLoaded", () => {
    const chipInput = document.getElementById("chipInput");
    const chipContainer = document.getElementById("chipContainer");
    const names = [];
    
    // Use both `input` and `keydown` events to handle chip creation on both mobile and desktop
    chipInput.addEventListener("input", function () {
        if (this.value.includes(",")) {
            addChip(this.value.replace(",", "").trim());
            this.value = "";
        }
    });

    chipInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            addChip(this.value.trim());
            this.value = "";
        } else if ((event.key === "Backspace" || event.key === "Delete") && this.value === "") {
            removeLastChip();
        }
    });

    function addChip(name) {
        if (name && !names.includes(name)) {
            names.push(name);

            // Create a chip element
            const chip = document.createElement("div");
            chip.classList.add("chip");
            chip.innerText = name;

            // Create a close button for each chip
            const closeButton = document.createElement("button");
            closeButton.classList.add("close-btn");
            closeButton.innerHTML = "&times;";
            closeButton.onclick = () => removeChip(name, chip);

            chip.appendChild(closeButton);
            chipContainer.insertBefore(chip, chipInput);

            updatePayerOptions(); // Refresh the "payer" dropdown when a chip is added
            updatePayerAndPayeeOptions(); // Refresh the "payer" and "payee" dropdowns when a chip is added
        }
        else {
            showToastMessage("Duplicate or invalid name.", "warning");
        }
    }

    function showToastMessage(message, type = "error") {
        const toast = document.createElement("div");
        toast.className = `toast-message ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add("visible"), 100);
        setTimeout(() => {
            toast.classList.remove("visible");
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    function removeChip(name, chipElement) {
        const index = names.indexOf(name);
        if (index > -1) {
            names.splice(index, 1);
            chipElement.style.animation = "fadeOut 0.6s ease";
            chipElement.addEventListener("animationend", () => {
                chipElement.remove();
                updatePayerOptions(); // Refresh the "payer" dropdown when a chip is removed
                updatePayerAndPayeeOptions(); // Refresh the "payer" and "payee" dropdowns when a chip is added
            });
        }
    }

    function removeLastChip() {
        const lastChip = chipContainer.querySelector(".chip:last-child");
        if (lastChip) {
            const name = lastChip.innerText.trim();
            removeChip(name, lastChip);
        }
    }
});

/* Update the "Payer" dropdown with the list of names in the chips */
function updatePayerOptions() {
    const chipContainer = document.getElementById("chipContainer");
    const payerSelect = document.getElementById("payer");

    // Clear existing options in the "payer" dropdown
    payerSelect.innerHTML = '<option value="">Select Payer</option>';

    // Populate dropdown with names from chips
    const chips = chipContainer.querySelectorAll(".chip");
    chips.forEach(chip => {
        const name = chip.textContent.replace("×", "").trim();

        // Add each name as an option in the dropdown
        const option = document.createElement("option");
        option.value = name;
        option.text = name;
        payerSelect.add(option);
    });
}

function updatePayerAndPayeeOptions() {
    const chipContainer = document.getElementById("chipContainer");
    const payerSelect = document.getElementById("paymentPayer");
    const payeeSelect = document.getElementById("paymentPayee");

    // Clear existing options in the "payer" and "payee" dropdowns
    payerSelect.innerHTML = '<option value="">Select Payer</option>';
    payeeSelect.innerHTML = '<option value="">Select Payee</option>';

    // Populate dropdown with names from chips
    const chips = chipContainer.querySelectorAll(".chip");
    chips.forEach(chip => {
        const name = chip.textContent.replace("×", "").trim();

        // Add each name as an option in the dropdown
        const payerOption = document.createElement("option");
        payerOption.value = name;
        payerOption.text = name;
        payerSelect.add(payerOption);

        const payeeOption = document.createElement("option");
        payeeOption.value = name;
        payeeOption.text = name;
        payeeSelect.add(payeeOption);
    });
}

/* Show split details input fields based on the selected split type */
function showSplitDetails() {
    const splitType = document.getElementById("splitType").value;
    const splitDetailsDiv = document.getElementById("splitDetails");
    splitDetailsDiv.innerHTML = ""; // Clear previous details

    if (splitType !== "equal") {
        const chipContainer = document.getElementById("chipContainer");
        const chips = chipContainer.querySelectorAll(".chip");
        let html = "";

        if (splitType === "unequal") {
            html += '<div class="form-group"><label>Enter amounts for each person:</label>';
            chips.forEach(chip => {
                const name = chip.textContent.replace("×", "").trim();
                html += `
                    <div class="input-group mb-2">
                            <div class="input-group-prepend">
                            <div class="input-group-text name-label">${name}</div>
                        </div>
                        <input type="number" class="form-control split-value" data-name="${name}" placeholder="Amount for ${name}" oninput="updateRemainingAmount()">
                    </div>
                `;
            });
            html += `
                <div class="remaining-container">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="splitRemaining">
                        <label class="form-check-label" for="splitRemaining">Split remaining balance equally among the rest</label>
                    </div>
                    <div id="remainingAmount" class="remaining">Remaining: ₹0.00</div>
                </div>
            `;
        } else if (splitType === "percentages") {
            html += '<div class="form-group"><label>Enter percentages for each person:</label>';
            chips.forEach(chip => {
                const name = chip.textContent.replace("×", "").trim();
                html += `
                    <div class="input-group mb-2">
                        <div class="input-group-prepend">
                            <div class="input-group-text name-label">${name}</div>
                        </div>
                        <input type="number" class="form-control split-value" data-name="${name}" placeholder="Percentage for ${name}" oninput="updateRemainingPercentage()">
                    </div>
                `;
            });
            html += `<div id="remainingPercentage" class="remaining">Remaining: 100%</div>`;
        } else if (splitType === "shares") {
            html += '<div class="form-group"><label>Enter shares for each person:</label>';
            chips.forEach(chip => {
                const name = chip.textContent.replace("×", "").trim();
                html += `
                    <div class="input-group mb-2">
                        <div class="input-group-prepend">
                            <div class="input-group-text name-label">${name}</div>
                        </div>
                        <input type="number" class="form-control split-value" data-name="${name}" placeholder="Shares for ${name}">
                    </div>
                `;
            });
        }
        splitDetailsDiv.innerHTML = html;
        splitDetailsDiv.style.display = "block";
    } else {
        splitDetailsDiv.style.display = "none";
    }
}

/* Clear balances and settlement information */
function clearBalancesAndSettlement() {
    const balancesTableBody = document.getElementById("balancesTable").getElementsByTagName("tbody")[0];
    balancesTableBody.innerHTML = "";
    document.getElementById("settlementDetails").innerHTML = "";
}
