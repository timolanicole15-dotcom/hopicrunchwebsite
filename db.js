const DB_USERS_KEY = 'hopiCrunchUsers';
const DB_ORDERS_KEY = 'hopiCrunchOrders';
const DB_CURRENT_USER_KEY = 'hopiCrunchCurrentUser';

function getUsers() {
  return JSON.parse(localStorage.getItem(DB_USERS_KEY) || '[]');
}

function saveUsers(users) {
  localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
}

function findUserByUsername(username) {
  return getUsers().find((user) => user.username === username);
}

function getOrders() {
  return JSON.parse(localStorage.getItem(DB_ORDERS_KEY) || '[]');
}

function saveOrders(orders) {
  localStorage.setItem(DB_ORDERS_KEY, JSON.stringify(orders));
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
