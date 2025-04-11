let expenses = [];
let payments = [];  
let hasCalculated = false; // Track if "calculate" has been clicked at least once.

function showToastMessage(message, type = "error") {
    const toast = document.createElement("div");
    toast.className = `toast-message ${type}`;

    // Create a span for the message text
    const textSpan = document.createElement("span");
    textSpan.className = "toast-text";
    textSpan.innerText = message;

    // Create a dismiss button for manual dismissal
    const dismissBtn = document.createElement("button");
    dismissBtn.className = "toast-close";
    dismissBtn.innerText = "×";
    
    // Declare timeout variables so they can be cleared if dismissed manually
    let showTimeout, hideTimeout;

    dismissBtn.addEventListener("click", () => {
        clearTimeout(showTimeout);
        clearTimeout(hideTimeout);
        toast.classList.remove("visible");
        setTimeout(() => toast.remove(), 500);
    });

    // Append text and dismiss button to the toast element
    toast.appendChild(textSpan);
    toast.appendChild(dismissBtn);

    document.body.appendChild(toast);

    // Show the toast after a short delay
    showTimeout = setTimeout(() => {
        toast.classList.add("visible");
    }, 100);

    // Automatically hide the toast after 3 seconds
    hideTimeout = setTimeout(() => {
        toast.classList.remove("visible");
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

const API_ENDPOINT = window.location.hostname.includes('localhost')
    ? 'http://localhost:3000/api/random-track'
    : '/api/random-track';

window.addEventListener('DOMContentLoaded', () => {
    fetch(API_ENDPOINT)
      .then(response => response.json())
      .then(data => {
        document.querySelector('#spotify-card img').src = data.albumCover;
        document.querySelector('.track-name').textContent = data.name;
        document.querySelector('.track-artist').textContent = data.artist;
        document.querySelector('#spotify-link').href = data.spotifyUrl;

        document.getElementById('spotify-card').style.display = 'flex';
      })
      .catch(err => {
        console.error('Failed to load track', err);
        document.getElementById('spotify-card').style.display = 'none';
      });
});

document.addEventListener("DOMContentLoaded", () => {
    const icons = document.querySelectorAll(".icon-container");

    icons.forEach(icon => {
        const tooltip = icon.querySelector(".tooltip");

        if (!tooltip) return;

        icon.addEventListener("mouseenter", () => {
            if (!icon.classList.contains("tooltip-disabled")) {
                tooltip.style.visibility = "visible";
                tooltip.style.opacity = "1";
            }
        });

        icon.addEventListener("mouseleave", () => {
            tooltip.style.visibility = "hidden";
            tooltip.style.opacity = "0";
            icon.classList.remove("tooltip-disabled"); // Allow tooltip to show again
        });

        icon.addEventListener("click", () => {
            tooltip.style.visibility = "hidden";
            tooltip.style.opacity = "0";
            icon.classList.add("tooltip-disabled"); // Prevent tooltip from showing again until hover exit
        });
    });
});


document.addEventListener("DOMContentLoaded", () => {
    attachFocusListeners();
});


function attachFocusListeners() {
    const descriptionInput = document.getElementById('description');
    const payerSelect = document.getElementById('payer');
    const amountInput = document.getElementById('amount');
    const splitTypeSelect = document.getElementById('splitType');
    const chipInput = document.getElementById('chipInput');

    const paymentPayerSelect = document.getElementById('paymentPayer');
    const paymentPayeeSelect = document.getElementById('paymentPayee');
    const paymentAmountInput = document.getElementById('paymentAmount');

    [descriptionInput, payerSelect, amountInput, splitTypeSelect, chipInput, paymentPayerSelect, paymentPayeeSelect, paymentAmountInput].forEach(field => {
        field.addEventListener('focus', () => {
            removeError(field);
        });
    });
}

function attachSplitFieldFocusListeners() {
    const splitFields = document.querySelectorAll('.split-value');
    splitFields.forEach(field => {
        field.addEventListener('focus', () => {
            removeError(field);
        });
    });
}

function showError(field) {
    field.classList.add('error-field');
    const parent = field.closest('.form-group') || field.parentNode;
    parent.classList.add('has-error');
}

function removeError(field) {
    field.classList.remove('error-field');
    const parent = field.closest('.form-group') || field.parentNode;
    parent.classList.remove('has-error');
}

function addExpense() {
    const descriptionInput = document.getElementById('description');
    const payerSelect = document.getElementById('payer');
    const amountInput = document.getElementById('amount');
    const splitTypeSelect = document.getElementById('splitType');
    const chipContainer = document.getElementById('chipContainer');
    const chipInput = document.getElementById('chipInput');

    const description = descriptionInput.value.trim();
    const payer = payerSelect.value.trim();
    const amount = parseFloat(amountInput.value.trim());
    const splitType = splitTypeSelect.value.trim();
    const names = Array.from(chipContainer.querySelectorAll('.chip'))
        .map(chip => chip.textContent.replace('×', '').trim())
        .filter(name => name !== '');

    let isValid = true;

    if (!description) { showError(descriptionInput); isValid = false; }
    if (!payer) { showError(payerSelect); isValid = false; }
    if (isNaN(amount) || amount <= 0) { showError(amountInput); isValid = false; }
    if (!splitType) { showError(splitTypeSelect); isValid = false; }
    if (names.length === 0) { showError(chipInput); isValid = false; }

    if (!isValid) {
        showToastMessage("Please fix the highlighted errors.", "error");
        return;
    }

    let splitDetails = {};

    if (splitType === 'equal') {
        const perPerson = amount / names.length;
        names.forEach(name => {
            splitDetails[name] = perPerson;
        });
    } else if (splitType === 'unequal') {
        const inputs = document.querySelectorAll('.split-value');
        let sum = 0;
        let splitValues = {};
        let nullNames = [];
        let invalidNumbers = false;

        inputs.forEach(input => {
            const name = input.getAttribute('data-name');
            const value = input.value;
            const amountValue = value === '' ? 0 : parseFloat(value);

            if (isNaN(amountValue)) {
                showError(input);
                invalidNumbers = true;
            }
            
            splitValues[name] = amountValue;
            if (amountValue === 0) {
                nullNames.push(name);
            }
            sum += amountValue;
        });

        if (invalidNumbers) return;

        const remaining = amount - sum;
        const splitRemaining = document.getElementById('splitRemaining').checked;

        if (remaining < 0) {
            showToastMessage("Split amounts exceed total amount.", "error");
            return;
        }

        if (splitRemaining && nullNames.length > 0) {
            const perPerson = remaining / nullNames.length;
            nullNames.forEach(name => {
                splitValues[name] = perPerson;
            });
        } else {
            nullNames.forEach(name => {
                splitValues[name] = 0;
            });
            if (remaining !== 0) {
                showToastMessage("Split amounts don't match total.", "warning");
                return;
            }
        }

        splitDetails = splitValues;
    } else if (splitType === 'percentages') {
        const inputs = document.querySelectorAll('.split-value');
        let totalPercentage = 0;
        let splitValues = {};
        let invalidPercent = false;

        inputs.forEach(input => {
            const name = input.getAttribute('data-name');
            const value = input.value === '' ? 0 : parseFloat(input.value);
            if (isNaN(value)) {
                showError(input);
                invalidPercent = true;
            }
            const percentageValue = isNaN(value) ? 0 : value;
            splitValues[name] = percentageValue;
            totalPercentage += percentageValue;
        });

        if (invalidPercent) return;
        if (Math.abs(totalPercentage - 100) > 0.01) {
            showToastMessage("Percentages must sum to 100%.", "error");
            return;
        }

        for (const [name, percentage] of Object.entries(splitValues)) {
            splitDetails[name] = (percentage / 100) * amount;
        }
    }
    else if (splitType === 'shares') {
        const inputs = document.querySelectorAll('.split-value');
        let totalShares = 0;
        let shareValues = {};
        let invalidShares = false;
    
        // Calculate total shares and validate input
        inputs.forEach(input => {
            const name = input.getAttribute('data-name');
            const value = input.value === '' ? 0 : parseFloat(input.value);
    
            if (isNaN(value)) {
                showError(input);
                invalidShares = true;
            }
    
            shareValues[name] = value;
            totalShares += value;
        });
    
        if (invalidShares) return;
    
        if (totalShares === 0) {
            showToastMessage("Total shares cannot be zero.", "error");
            return;
        }
    
        // Calculate the split based on shares
        for (const [name, share] of Object.entries(shareValues)) {
            splitDetails[name] = (amount / totalShares) * share;
        }
    }
    

    expenses.push({ description, payer, amount, splitDetails });
    showToastMessage("Expense added successfully.", "success");
    addExpenseToTable(description, payer, amount, splitDetails);
    updateTotalExpense();


    const elementIds = ["expenseTable", "calculateButton", "total-expense-summary", "table-header"];
    elementIds.forEach(id => {
        document.getElementById(id).style.display = "block";
    });

    clearExpenseForm();

    // If already calculated once before, auto-update balances
    if (hasCalculated) {
        calculateBalances();
    }
}

function updateTotalExpense() {
    const totalExpense = expenses.reduce((total, expense) => total + expense.amount, 0);
    document.getElementById('totalExpense').innerText = `₹${totalExpense.toFixed(2)}`;
}

function calculateBalances() {
    const chipContainer = document.getElementById('chipContainer');
    const names = Array.from(chipContainer.querySelectorAll('.chip')).map(chip => 
        chip.textContent.replace('×', '').trim()
    );

    let balances = {};
    names.forEach(name => balances[name] = 0);

    // Calculate the net balance
    expenses.forEach(expense => {
        const payer = expense.payer;
        const amount = expense.amount;
        const splitDetails = expense.splitDetails;

        for (const [name, share] of Object.entries(splitDetails)) {
            if (name === payer) {
                balances[name] += amount - share;
            } else {
                balances[name] -= share;
            }
        }
    });

    // Include payments
    payments.forEach(payment => {
        balances[payment.payer] += payment.amount;
        balances[payment.payee] -= payment.amount;
    });

    // Populate balance table
    const tableBody = document.getElementById('balancesTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    for (const [name, balance] of Object.entries(balances)) {
        const row = tableBody.insertRow();
        row.insertCell(0).innerText = name;

        const balanceCell = row.insertCell(1);
        balanceCell.innerText = `₹${balance.toFixed(2)}`;
        
        // Color coding
        if (balance > 0) {
            balanceCell.classList.add('balance-positive');
        } else if (balance < 0) {
            balanceCell.classList.add('balance-negative');
        } else {
            balanceCell.classList.add('balance-zero');
        }
    }

    manageSettlement(balances);

    // Show the balances & split details section
    document.getElementById("balanceandsplit").style.display = "block";

    // Mark that calculation is done at least once
    hasCalculated = true;
}

function togglePaymentForm() {
    const paymentFormContent = document.getElementById("paymentFormContent");
    const toggleIcon = document.getElementById("togglePaymentForm");
    const iconPath = toggleIcon.querySelector('path');

    if (paymentFormContent.style.display === "none" || paymentFormContent.style.display === "") {
        paymentFormContent.style.display = "flex";
        paymentFormContent.classList.add("slide-in");
        iconPath.setAttribute('d', 'M480-530.26 287.33-337.59 224.93-400 480-655.07 735.07-400l-62.4 62.41L480-530.26Z'); 
    } else {
        paymentFormContent.classList.add("slide-out");
        iconPath.setAttribute('d', 'M480-328.93 224.93-584l62.4-62.41L480-453.74l192.67-192.67 62.4 62.41L480-328.93Z');

        setTimeout(() => {
            paymentFormContent.style.display = "none";
            paymentFormContent.classList.remove("slide-out");
        }, 300); 
    }
}

function recordPayment() {
    const paymentPayerSelect = document.getElementById('paymentPayer');
    const paymentPayeeSelect = document.getElementById('paymentPayee');
    const paymentAmountInput = document.getElementById('paymentAmount');

    const payer = paymentPayerSelect.value.trim();
    const payee = paymentPayeeSelect.value.trim();
    const amount = parseFloat(paymentAmountInput.value.trim());

    let isValid = true;
    if (!payer) {
        showError(paymentPayerSelect);
        isValid = false;
    }
    if (!payee) {
        showError(paymentPayeeSelect);
        isValid = false;
    }
    if (isNaN(amount) || amount <= 0) {
        showError(paymentAmountInput);
        isValid = false;
    }
    if (payer && payee && payer === payee) {
        showError(paymentPayerSelect);
        showError(paymentPayeeSelect);
        isValid = false;
    }

    if (!isValid) return;

    const payment = { payer, payee, amount };
    payments.push(payment);

    displayPayments();
    updateBalances(payer, payee, amount);

    // Clear the form fields after recording payment
    resetPaymentForm();

    // If calculation has been done before, auto-update balances
    if (hasCalculated) {
        calculateBalances();
    }

    showToastMessage("Payment recorded successfully!", "success");
}

function updateBalances(payer, payee, amount) {
    let balances = {};

    // Update balances based on the payer and payee
    expenses.forEach(expense => {
        const splitDetails = expense.splitDetails;

        // If payer is making a payment, adjust their balance
        if (splitDetails[payer]) {
            balances[payer] = (balances[payer] || 0) - amount;
        }

        // If payee is receiving the payment, adjust their balance
        if (splitDetails[payee]) {
            balances[payee] = (balances[payee] || 0) + amount;
        }
    });

    // After payment, update the balance for each user (either reduce or increase)
    const tableBody = document.getElementById('balancesTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    // Recalculate balances and display them
    for (const [name, balance] of Object.entries(balances)) {
        const row = tableBody.insertRow();
        row.insertCell(0).innerText = name;
        const balanceCell = row.insertCell(1);
        balanceCell.innerText = `₹${balance.toFixed(2)}`;
        balanceCell.classList.add(balance > 0 ? 'balance-positive' : (balance < 0 ? 'balance-negative' : 'balance-zero'));
    }
}


function resetPaymentForm() {
    const payerField = document.getElementById('paymentPayer');
    const payeeField = document.getElementById('paymentPayee');
    const amountField = document.getElementById('paymentAmount');

    if (!payerField || !payeeField || !amountField) {
        console.error("Payment form fields not found. Ensure correct IDs in HTML.");
        return;
    }

    console.log("Resetting payment form fields...");

    // Clear values
    payerField.value = '';
    payeeField.value = '';
    amountField.value = '';

    console.log("Form fields cleared: ", {
        paymentPayer: payerField.value,
        paymentPayee: payeeField.value,
        paymentAmount: amountField.value,
    });

    // Remove error highlights
    [payerField, payeeField, amountField].forEach((field) => removeError(field));
}


function displayPayments() {
    const paymentsList = document.getElementById('paymentsList');
    paymentsList.innerHTML = '';
    payments.forEach((payment, index) => {
        const paymentText = `${payment.payer} paid ₹${payment.amount} to ${payment.payee}.`;

        const paymentRow = document.createElement('div');
        paymentRow.classList.add('payment-row');
        paymentRow.innerHTML = `${paymentText} <a href="#" onclick="removePayment(${index})">Remove</a>`;

        paymentsList.appendChild(paymentRow);
    });

    togglePaymentsVisibility();
}

function togglePaymentsVisibility() {
    const paymentsSection = document.getElementById('paymentsList');
    const recordedPaymentsHeader = document.getElementById('recordedPaymentsHeader');

    if (payments.length > 0) {
        paymentsSection.style.display = 'block';
        recordedPaymentsHeader.style.display = 'block';
    } else {
        paymentsSection.style.display = 'none';
        recordedPaymentsHeader.style.display = 'none';
    }
}

function removePayment(index) {
    payments.splice(index, 1);
    displayPayments();

    if (hasCalculated) {
        calculateBalances();
    }
}


function manageSettlement(balances) {
    let creditors = [];
    let debtors = [];
    for (const [name, balance] of Object.entries(balances)) {
        if (balance > 0) {
            creditors.push({ name, balance });
        } else if (balance < 0) {
            debtors.push({ name, balance: -balance });
        }
    }

    creditors.sort((a, b) => b.balance - a.balance);
    debtors.sort((a, b) => b.balance - a.balance);

    let settlementDetails = '';
    while (creditors.length > 0 && debtors.length > 0) {
        let creditor = creditors[0];
        let debtor = debtors[0];
        let amount = Math.min(creditor.balance, debtor.balance);

        settlementDetails += `<p>${debtor.name} needs to pay ₹${amount.toFixed(2)} to ${creditor.name}</p>`;

        creditor.balance -= amount;
        debtor.balance -= amount;

        if (creditor.balance === 0) creditors.shift();
        if (debtor.balance === 0) debtors.shift();
    }

    document.getElementById('settlementDetails').innerHTML = settlementDetails || '<p>No settlements needed.</p>';
}

function editExpense(index) {
    const expense = expenses[index];

    document.getElementById("description").value = expense.description;
    document.getElementById("payer").value = expense.payer;
    document.getElementById("amount").value = expense.amount;
    document.getElementById("splitType").value = "equal"; 
    showSplitDetails();

    const chips = Array.from(document.getElementById("chipContainer").querySelectorAll(".chip")).map(chip =>
        chip.textContent.replace("×", "").trim()
    );

    const splitDetailsDiv = document.getElementById("splitDetails");
    const splitDetails = expense.splitDetails;
    chips.forEach(name => {
        const inputField = splitDetailsDiv.querySelector(`[data-name="${name}"]`);
        if (inputField) {
            inputField.value = splitDetails[name] || 0;
        }
    });

    // Remove the expense from the array and update the table row indexes
    expenses.splice(index, 1);
    updateExpenseTable();

    clearBalancesAndSettlement();
    updateTotalExpense();

    if (hasCalculated) {
        calculateBalances();
    }
}

function updateExpenseTable() {
    const tableBody = document.getElementById("expensesTable").getElementsByTagName("tbody")[0];
    tableBody.innerHTML = ""; // Clear current table

    expenses.forEach((expense, index) => {
        const row = tableBody.insertRow();

        const actionCell = row.insertCell(0);
        actionCell.className = "sticky-action";

        const editButton = document.createElement("button");
        editButton.className = "icon-btn";
        editButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EAC452"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>';
        editButton.onclick = function () {
            editExpense(index);
        };

        const deleteButton = document.createElement("button");
        deleteButton.className = "icon-btn";
        deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#BB271A"><path d="M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-48v-72h192v-48h192v48h192v72h-48v479.57Q720-186 698.85-165T648-144H312Zm336-552H312v480h336v-480ZM384-288h72v-336h-72v336Zm120 0h72v-336h-72v336ZM312-696v480-480Z"/></svg>';
        deleteButton.onclick = function () {
            deleteExpense(index, row);
        };

        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);

        row.insertCell(1).innerText = expense.description || "No description provided";
        row.insertCell(2).innerText = expense.payer || "No payer selected";
        row.insertCell(3).innerText = expense.amount ? `₹${expense.amount.toFixed(2)}` : "₹0.00";
        row.insertCell(4).innerText = expense.splitDetails ? JSON.stringify(expense.splitDetails, null, 2) : "No split details provided";
    });
}

function deleteExpense(index, row) {
    expenses.splice(index, 1);
    row.remove();
    clearBalancesAndSettlement();
    updateTotalExpense();

    if (hasCalculated) {
        calculateBalances();
    }
}

function clearExpenseForm() {
    document.getElementById("description").value = "";
    document.getElementById("payer").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("splitType").value = "equal";
    document.getElementById("splitDetails").style.display = "none";
    document.getElementById("splitDetails").innerHTML = "";
}

function clearBalancesAndSettlement() {
    const balancesTableBody = document.getElementById("balancesTable").getElementsByTagName("tbody")[0];
    balancesTableBody.innerHTML = "";
    document.getElementById("settlementDetails").innerHTML = "";
}

function updateRemainingAmount() {
    const amount = parseFloat(document.getElementById("amount").value) || 0;
    const inputs = document.querySelectorAll(".split-value");
    let sum = 0;
    inputs.forEach(input => {
        const value = parseFloat(input.value);
        if (!isNaN(value)) sum += value;
    });
    const remaining = amount - sum;
    document.getElementById("remainingAmount").innerText = `Remaining: ₹${remaining.toFixed(2)}`;
}

function updateRemainingPercentage() {
    const inputs = document.querySelectorAll(".split-value");
    let sum = 0;
    inputs.forEach(input => {
        const value = parseFloat(input.value);
        if (!isNaN(value)) sum += value;
    });
    const remaining = 100 - sum;
    document.getElementById("remainingPercentage").innerText = `Remaining: ${remaining.toFixed(2)}%`;
}

function addExpenseToTable(description, payer, amount, splitDetails) {
    const tableBody = document.getElementById("expensesTable").getElementsByTagName("tbody")[0];
    
    // Check if tableBody is properly targeted
    if (!tableBody) {
        console.error("Table body not found");
        return;
    }

    const row = tableBody.insertRow();

    // Index of the current expense (last one added)
    const rowIndex = expenses.length - 1;

    const actionCell = row.insertCell(0);
    actionCell.className = "sticky-action";

    // Edit and Delete buttons
    const editButton = document.createElement("button");
    editButton.className = "icon-btn";
    editButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EAC452"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>';
    editButton.onclick = function () {
        editExpense(rowIndex);
    };

    const deleteButton = document.createElement("button");
    deleteButton.className = "icon-btn";
    deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#BB271A"><path d="M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-48v-72h192v-48h192v48h192v72h-48v479.57Q720-186 698.85-165T648-144H312Zm336-552H312v480h336v-480ZM384-288h72v-336h-72v336Zm120 0h72v-336h-72v336ZM312-696v480-480Z"/></svg>';
    deleteButton.onclick = function () {
        deleteExpense(rowIndex, row);
    };

    actionCell.appendChild(editButton);
    actionCell.appendChild(deleteButton);

    row.insertCell(1).innerText = description || "No description provided";
    row.insertCell(2).innerText = payer || "No payer selected";
    row.insertCell(3).innerText = amount ? `₹${amount.toFixed(2)}` : "₹0.00";
    row.insertCell(4).innerText = splitDetails
        ? JSON.stringify(splitDetails, null, 2)
        : "No split details provided";
}

// Export functions if needed
window.addExpense = addExpense;
window.calculateBalances = calculateBalances;
window.manageSettlement = manageSettlement;
window.updateTotalExpense = updateTotalExpense;
window.recordPayment = recordPayment;
window.showToastMessage = showToastMessage;

// Update chip input placeholder based on chip presence
function updateChipPlaceholder() {
    const chipContainer = document.getElementById("chipContainer");
    const chipInput = document.getElementById("chipInput");
    setTimeout(() => {
        const hasChips = chipContainer.querySelectorAll(".chip").length > 0;
        chipInput.placeholder = hasChips ? "" : "Add names, comma separated";
    }, 50);
}

document.addEventListener("DOMContentLoaded", () => {
    const chipContainer = document.getElementById("chipContainer");
    if (chipContainer) {
        chipContainer.addEventListener("DOMSubtreeModified", updateChipPlaceholder);
    }
});
