// ===========================================
// OOP STRUCTURE - ENCAPSULATION & INHERITANCE
// ===========================================

// Base Account Class (Abstraction)
class BaseAccount {
    constructor(accountNumber, initialBalance = 0) {
        this._accountNumber = accountNumber;
        this._balance = initialBalance;
        this._observers = [];
        this._transactionHistory = [];
    }

    // Encapsulation - Private properties with getters/setters
    get balance() {
        return this._balance;
    }

    get accountNumber() {
        return this._accountNumber;
    }

    get transactionHistory() {
        return [...this._transactionHistory]; // Return copy for encapsulation
    }

    // Observer Pattern - Subject methods
    addObserver(observer) {
        this._observers.push(observer);
    }

    removeObserver(observer) {
        this._observers = this._observers.filter(obs => obs !== observer);
    }

    notifyObservers(transaction) {
        this._observers.forEach(observer => observer.update(transaction));
    }

    // Abstract method - to be implemented by subclasses
    calculateInterest() {
        throw new Error("calculateInterest must be implemented by subclass");
    }

    // Deposit method
    deposit(amount, description = "Deposit") {
        if (amount <= 0) {
            throw new Error("Amount must be positive");
        }
        this._balance += amount;
        const transaction = new Transaction("deposit", amount, description, this._balance);
        this._transactionHistory.push(transaction);
        this.notifyObservers(transaction);
        return transaction;
    }

    // Withdraw method
    withdraw(amount, description = "Withdrawal") {
        if (amount <= 0) {
            throw new Error("Amount must be positive");
        }
        if (amount > this._balance) {
            throw new Error("Insufficient balance");
        }
        this._balance -= amount;
        const transaction = new Transaction("withdraw", amount, description, this._balance);
        this._transactionHistory.push(transaction);
        this.notifyObservers(transaction);
        return transaction;
    }
}

// Savings Account - Inheritance
class SavingsAccount extends BaseAccount {
    constructor(accountNumber, initialBalance = 0) {
        super(accountNumber, initialBalance);
        this._interestRate = 4.5; // 4.5% annual interest
    }

    // Polymorphism - Override calculateInterest
    calculateInterest() {
        return (this._balance * this._interestRate) / 100;
    }

    get interestRate() {
        return this._interestRate;
    }
}

// Current Account - Inheritance
class CurrentAccount extends BaseAccount {
    constructor(accountNumber, initialBalance = 0) {
        super(accountNumber, initialBalance);
        this._interestRate = 2.0; // 2% annual interest
    }

    // Polymorphism - Override calculateInterest
    calculateInterest() {
        return (this._balance * this._interestRate) / 100;
    }

    get interestRate() {
        return this._interestRate;
    }
}

// Fixed Deposit Account - Inheritance
class FixedDepositAccount extends BaseAccount {
    constructor(accountNumber, initialBalance = 0, tenure = 12) {
        super(accountNumber, initialBalance);
        this._tenure = tenure; // months
        this._interestRate = 7.5; // 7.5% annual interest
    }

    // Polymorphism - Override calculateInterest
    calculateInterest() {
        return (this._balance * this._interestRate * this._tenure) / (12 * 100);
    }

    get interestRate() {
        return this._interestRate;
    }

    get tenure() {
        return this._tenure;
    }
}

// Transaction Class - Encapsulation
class Transaction {
    constructor(type, amount, description, balance, timestamp = new Date()) {
        this._type = type;
        this._amount = amount;
        this._description = description;
        this._balance = balance;
        this._timestamp = timestamp;
        this._id = Date.now() + Math.random();
    }

    get type() { return this._type; }
    get amount() { return this._amount; }
    get description() { return this._description; }
    get balance() { return this._balance; }
    get timestamp() { return this._timestamp; }
    get id() { return this._id; }
}

// Customer Class - Observer
class Customer {
    constructor(name, email) {
        this._name = name;
        this._email = email;
        this._notifications = [];
    }

    get name() { return this._name; }
    get email() { return this._email; }
    get notifications() { return [...this._notifications]; }

    // Observer Pattern - Update method
    update(transaction) {
        const notification = {
            id: Date.now(),
            message: `Transaction on account ${transaction.balance}: ${transaction.type.toUpperCase()} of ₹${transaction.amount}`,
            timestamp: new Date(),
            transaction: transaction
        };
        this._notifications.push(notification);
        this.displayNotification(notification);
    }

    displayNotification(notification) {
        // This will be implemented to show UI notifications
        console.log(`Notification for ${this._name}: ${notification.message}`);
    }
}

// ===========================================
// STRATEGY PATTERN - INTEREST CALCULATION
// ===========================================

// Interest Strategy Interface
class InterestStrategy {
    calculate(account) {
        throw new Error("calculate method must be implemented");
    }
}

// Concrete Strategies
class SavingsInterestStrategy extends InterestStrategy {
    calculate(account) {
        return (account.balance * 4.5) / 100;
    }
}

class CurrentInterestStrategy extends InterestStrategy {
    calculate(account) {
        return (account.balance * 2.0) / 100;
    }
}

class FixedDepositInterestStrategy extends InterestStrategy {
    calculate(account) {
        return (account.balance * 7.5 * 12) / (12 * 100);
    }
}

// Interest Calculator Context
class InterestCalculator {
    constructor() {
        this._strategy = null;
    }

    setStrategy(strategy) {
        this._strategy = strategy;
    }

    calculateInterest(account) {
        if (!this._strategy) {
            throw new Error("Strategy not set");
        }
        return this._strategy.calculate(account);
    }
}

// ===========================================
// COMMAND PATTERN - TRANSACTIONS WITH UNDO
// ===========================================

// Command Interface
class Command {
    execute() {
        throw new Error("execute method must be implemented");
    }

    undo() {
        throw new Error("undo method must be implemented");
    }
}

// Concrete Commands
class DepositCommand extends Command {
    constructor(account, amount, description) {
        super();
        this._account = account;
        this._amount = amount;
        this._description = description;
        this._executed = false;
    }

    execute() {
        if (this._executed) {
            throw new Error("Command already executed");
        }
        const transaction = this._account.deposit(this._amount, this._description);
        this._executed = true;
        return transaction;
    }

    undo() {
        if (!this._executed) {
            throw new Error("Command not executed yet");
        }
        this._account.withdraw(this._amount, `Undo: ${this._description}`);
        this._executed = false;
    }
}

class WithdrawCommand extends Command {
    constructor(account, amount, description) {
        super();
        this._account = account;
        this._amount = amount;
        this._description = description;
        this._executed = false;
    }

    execute() {
        if (this._executed) {
            throw new Error("Command already executed");
        }
        const transaction = this._account.withdraw(this._amount, this._description);
        this._executed = true;
        return transaction;
    }

    undo() {
        if (!this._executed) {
            throw new Error("Command not executed yet");
        }
        this._account.deposit(this._amount, `Undo: ${this._description}`);
        this._executed = false;
    }
}

class TransferCommand extends Command {
    constructor(fromAccount, toAccount, amount, description) {
        super();
        this._fromAccount = fromAccount;
        this._toAccount = toAccount;
        this._amount = amount;
        this._description = description;
        this._executed = false;
    }

    execute() {
        if (this._executed) {
            throw new Error("Command already executed");
        }
        this._fromAccount.withdraw(this._amount, `Transfer to ${this._toAccount.accountNumber}`);
        this._toAccount.deposit(this._amount, `Transfer from ${this._fromAccount.accountNumber}`);
        this._executed = true;
    }

    undo() {
        if (!this._executed) {
            throw new Error("Command not executed yet");
        }
        this._toAccount.withdraw(this._amount, `Undo: Transfer from ${this._fromAccount.accountNumber}`);
        this._fromAccount.deposit(this._amount, `Undo: Transfer to ${this._toAccount.accountNumber}`);
        this._executed = false;
    }
}

// Command Invoker
class CommandInvoker {
    constructor() {
        this._history = [];
    }

    executeCommand(command) {
        try {
            command.execute();
            this._history.push(command);
            return true;
        } catch (error) {
            console.error("Command execution failed:", error.message);
            return false;
        }
    }

    undoLastCommand() {
        if (this._history.length === 0) {
            throw new Error("No commands to undo");
        }
        const lastCommand = this._history.pop();
        lastCommand.undo();
    }

    get history() {
        return [...this._history];
    }
}

// ===========================================
// GLOBAL STATE & UTILITY FUNCTIONS
// ===========================================

// Global state
let accounts = {};
let customer = null;
let commandInvoker = null;
let interestCalculator = null;
let currentFilter = 'all';

// Utility functions
function formatAmount(amount) {
    return "₹" + amount.toLocaleString("en-IN", {minimumFractionDigits: 2});
}

function updateBalances() {
    document.getElementById("savingsBalance").textContent = formatAmount(accounts.savings.balance);
    document.getElementById("currentBalance").textContent = formatAmount(accounts.current.balance);
    document.getElementById("fdBalance").textContent = formatAmount(accounts.fd.balance);
}

function validateAmount(amount, min = 0, max = null) {
    if (isNaN(amount) || amount <= min) {
        return { valid: false, message: `Amount must be greater than ${min}` };
    }
    if (max && amount > max) {
        return { valid: false, message: `Amount cannot exceed ${formatAmount(max)}` };
    }
    return { valid: true };
}

function clearFormInputs() {
    const inputs = ['depositAmount', 'withdrawAmount', 'transferAmount', 'paymentAmount', 'paymentDescription'];
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = "";
    });
}

function getAllTransactions() {
    let allTransactions = [];
    Object.values(accounts).forEach(account => {
        allTransactions = allTransactions.concat(account.transactionHistory);
    });
    return allTransactions.sort((a, b) => b.timestamp - a.timestamp);
}

function showNotification(type, message) {
    const notifications = document.getElementById("notifications");
    if (!notifications) return;
    
    const note = document.createElement("div");
    note.className = `notification ${type} fade-in`;
    note.innerHTML = `
        <div class="notification-header">
            <div class="notification-title">${type.toUpperCase()}</div>
            <button class="notification-close">×</button>
        </div>
        <div class="notification-message">${message}</div>
    `;
    notifications.appendChild(note);

    note.querySelector(".notification-close").addEventListener("click", () => {
        note.remove();
    });

    setTimeout(() => note.remove(), 5000);
}

function updateAnalytics() {
    updateTotalBalance();
    updateAccountDistribution();
    updateTransactionCount();
    updateMonthlySpending();
    updateMonthlyGrowth();
    updateInterestCalculations();
}

function updateTotalBalance() {
    const total = Object.values(accounts).reduce((sum, account) => sum + account.balance, 0);
    const element = document.getElementById("totalBalance");
    if (element) element.textContent = formatAmount(total);
}

function updateAccountDistribution() {
    const total = Object.values(accounts).reduce((sum, account) => sum + account.balance, 0);
    
    const savingsPercent = Math.round((accounts.savings.balance / total) * 100);
    const currentPercent = Math.round((accounts.current.balance / total) * 100);
    const fdPercent = Math.round((accounts.fd.balance / total) * 100);
    
    const savingsElement = document.getElementById("savingsPercent");
    const currentElement = document.getElementById("currentPercent");
    const fdElement = document.getElementById("fdPercent");
    
    if (savingsElement) savingsElement.textContent = `${savingsPercent}%`;
    if (currentElement) currentElement.textContent = `${currentPercent}%`;
    if (fdElement) fdElement.textContent = `${fdPercent}%`;
    
    const savingsBar = document.querySelector('[data-account="savings"]');
    const currentBar = document.querySelector('[data-account="current"]');
    const fdBar = document.querySelector('[data-account="fd"]');
    
    if (savingsBar) savingsBar.style.width = `${savingsPercent}%`;
    if (currentBar) currentBar.style.width = `${currentPercent}%`;
    if (fdBar) fdBar.style.width = `${fdPercent}%`;
}

function updateTransactionCount() {
    const allTransactions = getAllTransactions();
    const element = document.getElementById("transactionCount");
    if (element) element.textContent = allTransactions.length;
}

function updateMonthlySpending() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const allTransactions = getAllTransactions();
    
    const monthlySpending = allTransactions
        .filter(tx => {
            const txDate = new Date(tx.timestamp);
            return txDate.getMonth() === currentMonth && 
                   txDate.getFullYear() === currentYear && 
                   (tx.type === 'withdraw' || tx.type === 'payment');
        })
        .reduce((sum, tx) => sum + tx.amount, 0);
    
    const element = document.getElementById("monthlySpending");
    if (element) element.textContent = formatAmount(monthlySpending);
}

function updateMonthlyGrowth() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const allTransactions = getAllTransactions();
    
    const currentMonthDeposits = allTransactions
        .filter(tx => {
            const txDate = new Date(tx.timestamp);
            return txDate.getMonth() === currentMonth && 
                   txDate.getFullYear() === currentYear && 
                   tx.type === 'deposit';
        })
        .reduce((sum, tx) => sum + tx.amount, 0);
    
    const currentMonthWithdrawals = allTransactions
        .filter(tx => {
            const txDate = new Date(tx.timestamp);
            return txDate.getMonth() === currentMonth && 
                   txDate.getFullYear() === currentYear && 
                   (tx.type === 'withdraw' || tx.type === 'payment');
        })
        .reduce((sum, tx) => sum + tx.amount, 0);
    
    const netGrowth = currentMonthDeposits - currentMonthWithdrawals;
    const growthPercent = netGrowth > 0 ? 
        `+${Math.round((netGrowth / (currentMonthDeposits || 1)) * 100)}%` : 
        `${Math.round((netGrowth / (currentMonthWithdrawals || 1)) * 100)}%`;
    
    const element = document.getElementById("monthlyGrowth");
    if (element) {
        element.textContent = growthPercent;
        element.style.color = netGrowth >= 0 ? 'var(--accent)' : 'var(--danger)';
    }
}

function updateInterestCalculations() {
    // Calculate and display simple interest for each account
    const savingsInterest = accounts.savings.calculateInterest();
    const currentInterest = accounts.current.calculateInterest();
    const fdInterest = accounts.fd.calculateInterest();
    
    // Update account cards with interest information
    updateAccountCardInterest('savings', savingsInterest);
    updateAccountCardInterest('current', currentInterest);
    updateAccountCardInterest('fd', fdInterest);
}

function updateAccountCardInterest(accountType, interest) {
    const accountCard = document.querySelector(`[data-account="${accountType}"]`);
    if (accountCard) {
        let interestElement = accountCard.querySelector('.account-interest');
        if (!interestElement) {
            interestElement = document.createElement('div');
            interestElement.className = 'account-interest';
            const accountChange = accountCard.querySelector('.account-change');
            if (accountChange) {
                accountChange.parentNode.insertBefore(interestElement, accountChange.nextSibling);
            }
        }
        interestElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 600; opacity: 0.9;">
                <span>💰</span>
                <span>Interest: ${formatAmount(interest)}/year</span>
            </div>
        `;
    }
}

function renderTransactions() {
    const transactionsList = document.getElementById("transactionsList");
    if (!transactionsList) return;
    
    let allTransactions = getAllTransactions();
    let filteredTransactions = allTransactions;
    
    // Apply search filter
    const searchInput = document.querySelector(".search-input");
    if (searchInput && searchInput.value.trim()) {
        const searchTerm = searchInput.value.toLowerCase();
        filteredTransactions = allTransactions.filter(t => 
            t.description.toLowerCase().includes(searchTerm) ||
            t.type.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply type filter
    if (currentFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.type === currentFilter);
    }

    transactionsList.innerHTML = "";
    
    if (filteredTransactions.length === 0) {
        transactionsList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--gray-500);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📋</div>
                <div>No transactions found</div>
            </div>
        `;
        return;
    }

    filteredTransactions.forEach(transaction => {
        const transactionElement = document.createElement("div");
        transactionElement.className = "transaction fade-in";
        transactionElement.innerHTML = `
            <div class="transaction-icon ${transaction.type}">
                ${transaction.type === "deposit" ? "⬆️" : 
                  transaction.type === "withdraw" ? "⬇️" : 
                  transaction.type === "transfer" ? "🔄" : 
                  transaction.type === "payment" ? "💳" : "📊"}
            </div>
            <div class="transaction-details">
                <div class="transaction-title">${transaction.description}</div>
                <div class="transaction-subtitle">Account: ${transaction.balance}</div>
                <div class="transaction-meta">
                    <span>${transaction.timestamp.toLocaleString()}</span>
                    <span>•</span>
                    <span>Balance: ${formatAmount(transaction.balance)}</span>
                </div>
            </div>
            <div class="transaction-amount">
                <div class="transaction-value ${transaction.type === "withdraw" ? "negative" : "positive"}">
                    ${transaction.type === "withdraw" ? "-" : "+"}${formatAmount(transaction.amount)}
                </div>
                <div class="transaction-status status-completed">completed</div>
            </div>
        `;
        transactionsList.appendChild(transactionElement);
    });
}

// Initialize accounts
function initializeAccounts() {
    // Create account instances
    accounts.savings = new SavingsAccount("****4589", 245750);
    accounts.current = new CurrentAccount("****9210", 85420);
    accounts.fd = new FixedDepositAccount("****3344", 400000, 12);

    // Create customer and add as observer
    customer = new Customer("2303A52336", "john.doe@email.com");
    Object.values(accounts).forEach(account => {
        account.addObserver(customer);
    });

    // Initialize command invoker and interest calculator
    commandInvoker = new CommandInvoker();
    interestCalculator = new InterestCalculator();
}

// Add sample transactions using Command Pattern
function addSampleTransactions() {
    const sampleTransactions = [
        { type: "deposit", account: "savings", amount: 5000, description: "Salary Credit" },
        { type: "withdraw", account: "current", amount: 2500, description: "ATM Withdrawal" },
        { type: "transfer", account: "savings", amount: 10000, description: "Transfer to Current" },
        { type: "payment", account: "current", amount: 1500, description: "Electricity Bill Payment" },
        { type: "deposit", account: "savings", amount: 2000, description: "Interest Credit" },
        { type: "withdraw", account: "savings", amount: 3000, description: "Shopping" },
        { type: "payment", account: "current", amount: 800, description: "Internet Bill" },
        { type: "deposit", account: "current", amount: 15000, description: "Freelance Payment" }
    ];
    
    sampleTransactions.forEach((tx, index) => {
        setTimeout(() => {
            try {
                let command;
                if (tx.type === "deposit") {
                    command = new DepositCommand(accounts[tx.account], tx.amount, tx.description);
                } else if (tx.type === "withdraw" || tx.type === "payment") {
                    command = new WithdrawCommand(accounts[tx.account], tx.amount, tx.description);
                } else if (tx.type === "transfer") {
                    command = new TransferCommand(accounts[tx.account], accounts.current, tx.amount, tx.description);
                }
                
                if (command) {
                    commandInvoker.executeCommand(command);
                }
            } catch (error) {
                console.error("Sample transaction failed:", error.message);
            }
        }, index * 100);
    });
}

// Initialize the banking system
function initBanking() {
    initializeAccounts();
    updateBalances();
    updateAnalytics();
    addSampleTransactions();
    
    // Add some initial transactions
    setTimeout(() => {
        renderTransactions();
    }, 1000);
}

// Export for use in other files
window.BankingSystem = {
    BaseAccount,
    SavingsAccount,
    CurrentAccount,
    FixedDepositAccount,
    Transaction,
    Customer,
    InterestStrategy,
    SavingsInterestStrategy,
    CurrentInterestStrategy,
    FixedDepositInterestStrategy,
    InterestCalculator,
    Command,
    DepositCommand,
    WithdrawCommand,
    TransferCommand,
    CommandInvoker,
    accounts,
    customer,
    commandInvoker,
    interestCalculator,
    currentFilter,
    formatAmount,
    updateBalances,
    validateAmount,
    clearFormInputs,
    getAllTransactions,
    showNotification,
    updateAnalytics,
    renderTransactions,
    initBanking
};
