function exportToCSV() {
    let csvContent = 'Description,Payer,Amount';

    // Retrieve names from chips
    const chipContainer = document.getElementById('chipContainer');
    const names = Array.from(chipContainer.querySelectorAll('.chip')).map(chip => 
        chip.textContent.replace('×', '').trim()
    );

    // Add headers for each person
    names.forEach(name => {
        csvContent += `,${name}`;
    });
    csvContent += '\n';

    // Add each expense row
    expenses.forEach(expense => {
        const { description, payer, amount, splitDetails } = expense;
        csvContent += `${description},${payer},${amount}`;

        names.forEach(name => {
            csvContent += `,${splitDetails[name] || 0}`;
        });
        csvContent += '\n';
    });

        // Add recorded payments
    if (payments.length > 0) {
        csvContent += '\nRecorded Payments\n';
        payments.forEach(payment => {
            csvContent += `${payment.payer} paid ₹${payment.amount} to ${payment.payee}\n`;
        });
    }

    // Append settlement details
    csvContent += '\nSettlement Details\n';
    const settlementDetailsDiv = document.getElementById('settlementDetails');
    const settlementDetails = settlementDetailsDiv.innerText.split('\n');
    settlementDetails.forEach(detail => {
        if (detail) {
            csvContent += `${detail}\n`;
        }
    });

    // Create a Blob from the CSV string
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'expense_settlement_details.csv';

    // Append the link, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function copySettlementDetailsAsText() {
    console.log("Attempting to copy expense table and settlement details...");
    
    const settlementDiv = document.getElementById('settlementDetails');
    const expensesTable = document.getElementById('expensesTable');
    const copyIcon = document.getElementById('copyexport');
    
    if (!settlementDiv || !expensesTable || !copyIcon) {
        console.error("Required elements not found.");
        showToastMessage("Failed to copy!", "error");
        return;
    }

    let textToCopy = "\n💰 Expense Summary 💰\n\n";

    // Extract Expense Table Data
    const rows = expensesTable.querySelectorAll("tbody tr");
    if (rows.length === 0) {
        textToCopy += "No expenses recorded.\n\n";
    } else {
        textToCopy += "Description | Payer | Amount | Split Details\n";
        textToCopy += "-------------------------------------------\n";

        rows.forEach(row => {
            const columns = row.querySelectorAll("td");
            if (columns.length >= 4) {
                const description = columns[1].innerText.trim();
                const payer = columns[2].innerText.trim();
                const amount = columns[3].innerText.trim();
                
                let splitDetails = columns[4].innerText.trim();
                try {
                    const parsedDetails = JSON.parse(splitDetails);
                    splitDetails = Object.entries(parsedDetails)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(", ");
                } catch (e) {
                    console.warn("Split details not in JSON format, keeping as-is.");
                }
                
                textToCopy += `${description} | ${payer} | ${amount} | ${splitDetails}\n`;
            }
        });
        textToCopy += "\n";
    }

    // Extract Settlement Details
    let settlementText = settlementDiv.innerText.trim();
    textToCopy += "📌 Settlement Details 📌\n";
    textToCopy += settlementText ? `${settlementText}\n` : "No settlements needed.\n";

    console.log("Formatted text for copying:", textToCopy);

    // Change icon to success state (SVG 2)
    copyIcon.innerHTML = '<path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>';
    copyIcon.classList.add("icon-animate");

    // Copy to Clipboard
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                console.log("Clipboard API copy successful.");
                showToastMessage("Copied to clipboard!", "success");
            })
            .catch(err => {
                console.error("Clipboard write failed:", err);
                fallbackCopyText(textToCopy);
            });
    } else {
        fallbackCopyText(textToCopy);
    }

    // Revert back to original icon after 1 second
    setTimeout(() => {
        copyIcon.innerHTML = '<path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/>';
        copyIcon.classList.remove("icon-animate");
    }, 1000);
}

// Fallback for Older Browsers
function fallbackCopyText(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        console.log("Fallback copy successful.");
        showToastMessage("Copied to clipboard!", "success");
    } catch (err) {
        console.error("Fallback copy failed:", err);
        showToastMessage("Failed to copy!", "error");
    }
    document.body.removeChild(textArea);
}



// Expose the function to be accessible globally
window.exportToCSV = exportToCSV;
window.copySettlementDetailsAsText = copySettlementDetailsAsText;

