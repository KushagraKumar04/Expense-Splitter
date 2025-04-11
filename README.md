
# Expense Splitter Application

## Overview
The **Expense Splitter** is a web-based application designed to help users easily split expenses among a group of people. This tool simplifies expense management by allowing users to enter expenses, select different split methods, and calculate balances and settlements efficiently.

## Features
- **User-Friendly Interface**: Leveraging Bootstrap for a clean, responsive design.
- **Multiple Split Types**:
  - Equal sharing among all participants.
  - Unequal distribution by specific amounts.
  - Division by shares or percentages.
- **Real-Time Calculations**:
  - Track remaining amounts or percentages while entering details.
  - Instantly displays the balance for each participant.
- **Settlement Details**:
  - Automatically calculates and displays who owes whom and how much, simplifying the payment settlement process.

## How to Use
1. **Input Participant Names**:
   - Enter the names of participants in a comma-separated format in the **Names** field.
2. **Add an Expense**:
   - Provide the **description**, select the **payer**, and enter the **total amount**.
   - Choose a **split type** from the following options:
     - **Equally**: Distribute the amount evenly.
     - **Unequally (by Amount)**: Enter specific amounts for each participant.
     - **By Shares**: Allocate shares that will determine each person's portion.
     - **By Percentages**: Define a percentage for each participant.
3. **Calculate Balances**:
   - Click the **Calculate Balances** button to see the updated balances for each participant.
4. **View Settlements**:
   - Review the **Settlement Details** section to know who needs to pay whom and how much.

## Installation
1. **Download or Clone** this repository to your local system.
2. Open the `index.html` file in your preferred web browser.

## File Structure
```plaintext
expense-splitter/
├── READ.md
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── ui.js
│   ├── logic.js
│   ├── export.js
│   └── darkMode.js
└── assets/
    └── icons/
        ├── edit.png
        └── delete.png
```

## Code Highlights
- **HTML** for structure, with **Bootstrap** for a responsive and polished design.
- **JavaScript** handles dynamic interactions, such as updating the payer options, real-time calculation of amounts and percentages, and generating the settlement details.

### Key JavaScript Functions
- **`updatePayerOptions()`**: Updates the list of payers based on entered names.
- **`showSplitDetails()`**: Displays appropriate input fields for the selected split type.
- **`addExpense()`**: Adds an expense to the table and updates the list of expenses.
- **`calculateBalances()`**: Calculates and displays the balances for each participant and generates settlement details to show who needs to pay whom.

## Example Use Case
Imagine a trip where three friends, Alice, Bob, and Charlie, share various expenses (e.g., meals, transport, accommodation). Using this tool, they can:
- Input expenses and specify the payer for each expense.
- Choose how to split each expense (e.g., equally, by shares).
- View the balance summary and determine who owes whom.

## Screenshots
<img width="1680" alt="image" src="https://github.com/user-attachments/assets/ca617c59-7968-4f5d-a9c4-97f3671b3fb6">
<img width="1680" alt="image" src="https://github.com/user-attachments/assets/cc79ddca-77b6-470d-bd0d-6806e74cff62">


## Technologies Used
- **HTML5** and **CSS3** for structure and styling.
- **Bootstrap 4** for a responsive and modern UI.
- **JavaScript** and **jQuery** for client-side logic and interactivity.

## License
This project is licensed under the MIT License. Feel free to use and modify it as per your requirements.

## Contact
For further questions or feedback, please contact [vantough@gmail.com](mailto:vantough@gmail.com).

---

Enjoy using the **Expense Splitter** to simplify your expense management and ensure fair sharing among participants!
