let db;

const request = indexDB.open('budget_tracker', 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;

    db.createObjectStore('new_record', { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        uploadRecord();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_record'], 'readwrite');
    const recordObjectStore = transaction.objectStore('new_record');
    
    recordObjectStore.add(record);
};

function uploadRecord() {
    const transaction = db.transaction(['new_record'], 'readwrite');
    const recordObjectStore = transaction.objectStore('rew_record');
    const getAll = recordObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
            })
            .then((response) => response.json())
            .then((serverResponse) => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_record'], 'readwrite');
                const recordObjectStore = transaction.objectStore('new_record');

                recordObjectStore.clear();
                alert('All records have been saved.');
            })
            .catch(err => {
                console.log(err);
            });
        }
    };
};

window.addEventListener('online', uploadRecord);