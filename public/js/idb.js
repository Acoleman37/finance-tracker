// Variable to hold db connection
let db;

// Establish connection to indexedDB database called 'finance-tracker' set to version 1
const request = indexedDB.open('finance-tracker', 1);

// Event will emit if the db version changes
request.onupgradeneeded = function(event) {

    // Save a reference to the database
    const db = event.target.result;

    // Creates an object store (table) called 'new_transaction', set to have auto incrementing primary key of sorts
    db.createObjectSTore('new_transaction', { autoIncrement: true });
};


request.onsuccess = function(event) {

    // When db is successufully created with its object store or established connection, save reference to db in global variable
    db = event.target.result;

    // Check if app is online, if yes run uploadTransaction() function to send all local db data to api
    if (navigator.onLine) {
        // todo: uploadTransaction();
    }
};

request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
};

// This function will be executed if we attempt to submit a new transaction and there's no internet connection
function saveRecord(record) {

    // Open a new transaction with the database with read and write permissions
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    // Access the object store for `new_transaction`
    const  budgetObjectStore = transaction.objectStore('new_transaction');

    // Add record to your store with add method
    budgetObjectStore.add(record);
}; 