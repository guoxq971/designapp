export function useLoginConfig() {
  return {};
}

const LOCAL_TOKEN = 'token';
function setLocalToken(value) {
  localStorage.setItem(LOCAL_TOKEN, value);
}
function getLocalToken() {
  return localStorage.getItem(LOCAL_TOKEN);
}
function removeLocalToken() {
  localStorage.removeItem(LOCAL_TOKEN);
}

const LOCAL_TAB_ID = 'local_tab_id';
function setLocalTabId(value) {
  localStorage.setItem(LOCAL_TAB_ID, value);
}
function getLocalTabId() {
  return localStorage.getItem(LOCAL_TAB_ID);
}
function removeLocalTabId() {
  localStorage.removeItem(LOCAL_TAB_ID);
}

const SESSION_TAB_id = 'session_tab_id';
function setSessionTabId(value) {
  sessionStorage.setItem(SESSION_TAB_id, value);
}
function getSessionTabId() {
  return sessionStorage.getItem(SESSION_TAB_id);
}
function removeSessionTabId() {
  sessionStorage.removeItem(SESSION_TAB_id);
}
