// Utkarsh Kumar
// Add & Edit Transaction

const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const type = document.getElementById("type");

const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const balanceEl = document.getElementById("balance");

const transactionsEl = document.getElementById("transactions");

let transactions =
JSON.parse(localStorage.getItem("transactions")) || [];

let editId = null;

form.addEventListener("submit", function(e){

    e.preventDefault();

    if(text.value === "" || amount.value === ""){
        alert("Fill all fields");
        return;
    }

    if(editId !== null){

        transactions = transactions.map(item => {

            if(item.id === editId){

                return {
                    ...item,
                    text:text.value,
                    amount:Number(amount.value),
                    type:type.value
                };

            }

            return item;

        });

        editId = null;

    }else{

        transactions.push({
            id:Date.now(),
            text:text.value,
            amount:Number(amount.value),
            type:type.value
        });

    }

    form.reset();

    saveData();

});


// Bharat Sharma
// Delete Transaction

function deleteTransaction(id){

    transactions = transactions.filter(item => item.id !== id);

    saveData();

}


// Rahul Verma
// localStorage & Summary

function saveData(){

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

    renderTransactions();
    updateSummary();

}

function updateSummary(){

    const income = transactions
    .filter(item => item.type === "income")
    .reduce((total,item) => total + item.amount,0);

    const expense = transactions
    .filter(item => item.type === "expense")
    .reduce((total,item) => total + item.amount,0);

    incomeEl.textContent = "₹" + income;
    expenseEl.textContent = "₹" + expense;
    balanceEl.textContent = "₹" + (income - expense);

}


// Aryan Singh
// UI Rendering

function renderTransactions(){

    transactionsEl.innerHTML = "";

    transactions.forEach(item => {

        const div = document.createElement("div");

        div.className = "transaction";

        div.innerHTML = `
            <div>
                <h3>${item.text}</h3>
                <p>₹${item.amount} (${item.type})</p>
            </div>

            <div class="actions">
                <button class="edit-btn" onclick="editTransaction(${item.id})">
                    Edit
                </button>

                <button class="delete-btn" onclick="deleteTransaction(${item.id})">
                    Delete
                </button>
            </div>
        `;

        transactionsEl.appendChild(div);

    });

}

function editTransaction(id){

    const item = transactions.find(
        transaction => transaction.id === id
    );

    text.value = item.text;
    amount.value = item.amount;
    type.value = item.type;

    editId = id;

}

renderTransactions();
updateSummary();