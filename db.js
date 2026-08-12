 const DB_USERS_KEY = 'hopiCrunchUsers';
const DB_ORDERS_KEY = 'hopiCrunchOrders';
const DB_CURRENT_USER_KEY = 'hopiCrunchCurrentUser';

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
  if (window.remoteDbEnabled) {
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
      console.warn('Remote user save failed:', error);
    }
  }
}

function getOrdersLocal() {
  return JSON.parse(localStorage.getItem(DB_ORDERS_KEY) || '[]');
}

function saveOrdersLocal(orders) {
  localStorage.setItem(DB_ORDERS_KEY, JSON.stringify(orders));
}

async function getOrders() {
  if (window.remoteDbEnabled && window.firebaseDb) {
    try {
      const snapshot = await window.firebaseDb.collection('orders').orderBy('createdAt', 'desc').get();
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return { id: doc.id, ...data }; // Attach Firestore document ID
      });
    } catch (error) {
      console.warn('Remote order fetch failed:', error);
    }
  }

  return getOrdersLocal();
}

async function saveOrder(order) {
  const orders = getOrdersLocal();
  // Generate a local ID if not present
  if (!order.id) {
    order.id = 'order_' + Date.now();
  }
  
  orders.push(order);
  saveOrdersLocal(orders);

  if (window.remoteDbEnabled && window.firebaseDb) {
    try {
      const docRef = await window.firebaseDb.collection('orders').add(order);
      // Update local storage object to hold the real Firestore document ID
      order.id = docRef.id;
      saveOrdersLocal(orders);
    } catch (error) {
      console.warn('Remote order save failed:', error);
    }
  }
}

/**
 * Updates an existing order's status or data both locally and in Firestore.
 */
async function updateOrder(orderId, updateData) {
  // 1. Update in LocalStorage
  const orders = getOrdersLocal();
  const index = orders.findIndex((order) => order.id === orderId);
  if (index !== -1) {
    orders[index] = { ...orders[index], ...updateData };
    saveOrdersLocal(orders);
  }

  // 2. Update in Firestore Remote DB
  if (window.remoteDbEnabled && window.firebaseDb) {
    try {
      await window.firebaseDb.collection('orders').doc(orderId).update(updateData);
    } catch (error) {
      console.warn('Remote order update failed:', error);
    }
  }
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem(DB_CURRENT_USER_KEY) || 'null');
}

function setCurrentUser(user) {
  localStorage.setItem(DB_CURRENT_USER_KEY, JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem(DB_CURRENT_USER_KEY);
}
