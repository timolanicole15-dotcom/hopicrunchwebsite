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
      return snapshot.docs.map((doc) => doc.data());
    } catch (error) {
      console.warn('Remote order fetch failed:', error);
    }
  }

  return getOrdersLocal();
}

async function saveOrder(order) {
  const orders = getOrdersLocal();
  orders.push(order);
  saveOrdersLocal(orders);

  if (window.remoteDbEnabled && window.firebaseDb) {
    try {
      await window.firebaseDb.collection('orders').add(order);
    } catch (error) {
      console.warn('Remote order save failed:', error);
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
