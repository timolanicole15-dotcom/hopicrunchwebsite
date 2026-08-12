 const DB_USERS_KEY = 'hopiCrunchUsers';
const DB_ORDERS_KEY = 'hopiCrunchOrders';
const DB_CURRENT_USER_KEY = 'hopiCrunchCurrentUser';

/* ==========================================
   USER MANAGEMENT FUNCTIONS
========================================== */

function getUsersLocal() {
  return JSON.parse(localStorage.getItem(DB_USERS_KEY) || '[]');
}

function saveUsersLocal(users) {
  localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
}

async function getUserRemote(username) {
  if (!window.remoteDbEnabled || !window.firebaseDb) return null;

  try {
    const doc = await window.firebaseDb.collection('users').doc(username).get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    console.warn('Remote user lookup failed:', error);
    return null;
  }
}

async function findUserByUsername(username) {
  if (window.remoteDbEnabled && window.firebaseDb) {
    const remoteUser = await getUserRemote(username);
    if (remoteUser) {
      return remoteUser;
    }
  }

  return getUsersLocal().find((user) => user.username === username) || null;
}

async function saveUser(user) {
  const users = getUsersLocal();
  const existingIndex = users.findIndex((item) => item.username === user.username);

  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }

  saveUsersLocal(users);

  if (window.remoteDbEnabled && window.firebaseDb) {
    try {
      await window.firebaseDb.collection('users').doc(user.username).set(user);
    } catch (error) {
      console.error('Remote user save failed:', error);
    }
  }
}

/* ==========================================
   ORDER MANAGEMENT FUNCTIONS
========================================== */

function getOrdersLocal() {
  return JSON.parse(localStorage.getItem(DB_ORDERS_KEY) || '[]');
}

function saveOrdersLocal(orders) {
  localStorage.setItem(DB_ORDERS_KEY, JSON.stringify(orders));
}

/**
 * Fetches all orders directly from Firestore across networks
 */
async function getOrders() {
  if (window.remoteDbEnabled && window.firebaseDb) {
    try {
      const snapshot = await window.firebaseDb.collection('orders').orderBy('createdAt', 'desc').get();
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return { ...data, id: doc.id }; // Attach real Firestore Document ID
      });
    } catch (error) {
      console.error('Remote order fetch failed (Check Firebase Rules):', error);
    }
  }

  return getOrdersLocal();
}

/**
 * Saves order to Firestore FIRST to guarantee a universal Document ID across networks
 */
async function saveOrder(order) {
  // Ensure default status is set
  if (!order.status) {
    order.status = 'pending';
  }

  if (window.remoteDbEnabled && window.firebaseDb) {
    try {
      // Save directly to Firestore to obtain auto-generated document ID
      const docRef = await window.firebaseDb.collection('orders').add(order);
      order.id = docRef.id;
    } catch (error) {
      console.error('Remote order save failed (Check Firebase Rules):', error);
      if (!order.id) order.id = 'order_' + Date.now();
    }
  } else {
    if (!order.id) order.id = 'order_' + Date.now();
  }

  // Backup to local storage
  const orders = getOrdersLocal();
  orders.push(order);
  saveOrdersLocal(orders);
}

/**
 * Updates order status globally in Firestore by document ID
 */
async function updateOrder(orderId, updateData) {
  if (!orderId) {
    console.error('Cannot update order: orderId is missing or invalid.');
    return;
  }

  // Update Firestore across network
  if (window.remoteDbEnabled && window.firebaseDb) {
    try {
      await window.firebaseDb.collection('orders').doc(orderId).update(updateData);
      console.log(`Order ${orderId} successfully updated in Firestore:`, updateData);
    } catch (error) {
      console.error('Remote order status update failed:', error);
    }
  }

  // Fallback / Local sync
  const orders = getOrdersLocal();
  const index = orders.findIndex((order) => order.id === orderId);
  if (index !== -1) {
    orders[index] = { ...orders[index], ...updateData };
    saveOrdersLocal(orders);
  }
}

/* ==========================================
   SESSION / CURRENT USER FUNCTIONS
========================================== */

function getCurrentUser() {
  return JSON.parse(localStorage.getItem(DB_CURRENT_USER_KEY) || 'null');
}

function setCurrentUser(user) {
  localStorage.setItem(DB_CURRENT_USER_KEY, JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem(DB_CURRENT_USER_KEY);
}
