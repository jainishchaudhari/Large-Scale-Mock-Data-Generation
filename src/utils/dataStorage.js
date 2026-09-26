const DB_NAME = "MockGenDB";
const DB_VERSION = 1;
const STORE_NAME = "generatedData";

const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

// --------------------------------
// Clear all generated data
// --------------------------------

export const clearGeneratedData = async () => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readwrite"
    );

    const store = transaction.objectStore(STORE_NAME);

    const request = store.clear();

    request.onsuccess = () => {
      db.close();
      resolve();
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
};

// --------------------------------
// Save one batch
// --------------------------------

export const saveBatch = async (batchNumber, data) => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readwrite"
    );

    const store = transaction.objectStore(STORE_NAME);

    const request = store.put({
      id: batchNumber,
      batchNumber,
      data,
    });

    request.onsuccess = () => {
      db.close();
      resolve();
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
};

// --------------------------------
// Get one batch
// --------------------------------

export const getBatch = async (batchNumber) => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readonly"
    );

    const store = transaction.objectStore(STORE_NAME);

    const request = store.get(batchNumber);

    request.onsuccess = () => {
      db.close();

      resolve(request.result?.data || []);
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
};

// --------------------------------
// Get all batches
// --------------------------------

export const getAllBatches = async () => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readonly"
    );

    const store = transaction.objectStore(STORE_NAME);

    const request = store.getAll();

    request.onsuccess = () => {
      db.close();

      const batches = request.result || [];

      batches.sort(
        (a, b) => a.batchNumber - b.batchNumber
      );

      resolve(batches);
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
};

// --------------------------------
// Get total generated record count
// --------------------------------

export const getGeneratedRecordCount = async () => {
  const batches = await getAllBatches();

  let totalRecords = 0;

  for (const batch of batches) {
    if (Array.isArray(batch.data)) {
      totalRecords += batch.data.length;
    }
  }

  return totalRecords;
};


// --------------------------------
// Get all batches one by one
// --------------------------------

export const readBatchesSequentially = async (callback) => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readonly"
    );

    const store = transaction.objectStore(STORE_NAME);

    const request = store.openCursor();

    request.onsuccess = async () => {
      const cursor = request.result;

      if (!cursor) {
        db.close();
        resolve();
        return;
      }

      try {
        await callback(cursor.value);

        cursor.continue();
      } catch (error) {
        db.close();
        reject(error);
      }
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
};