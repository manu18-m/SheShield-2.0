// src/services/dbService.js — localStorage version (no Firestore needed)

const get = (key) => JSON.parse(localStorage.getItem(key) || "[]");
const set = (key, val) => localStorage.setItem(key, JSON.stringify(val));
const uid = () => Math.random().toString(36).slice(2) + Date.now();

// ── CONTACTS ──────────────────────────────────────────────────

export const addContact = async (userId, contact) => {
  const all = get("contacts");
  all.push({ ...contact, userId, active: true, id: uid(), createdAt: new Date().toISOString() });
  set("contacts", all);
};

export const updateContact = async (contactId, data) => {
  const all = get("contacts").map(c => c.id === contactId ? { ...c, ...data } : c);
  set("contacts", all);
};

export const deleteContact = async (contactId) => {
  set("contacts", get("contacts").filter(c => c.id !== contactId));
};

export const listenToContacts = (userId, callback) => {
  const all = get("contacts").filter(c => c.userId === userId);
  callback(all);
  const interval = setInterval(() => {
    callback(get("contacts").filter(c => c.userId === userId));
  }, 1000);
  return () => clearInterval(interval);
};

// ── INCIDENTS ─────────────────────────────────────────────────

export const addIncident = async (userId, incident) => {
  const all = get("incidents");
  all.unshift({ ...incident, userId, id: uid(), createdAt: new Date().toISOString() });
  set("incidents", all);
};

export const deleteIncident = async (incidentId) => {
  set("incidents", get("incidents").filter(i => i.id !== incidentId));
};

export const listenToIncidents = (userId, callback) => {
  const all = get("incidents").filter(i => i.userId === userId);
  callback(all);
  const interval = setInterval(() => {
    callback(get("incidents").filter(i => i.userId === userId));
  }, 1000);
  return () => clearInterval(interval);
};

// ── SOS LOGS ──────────────────────────────────────────────────

export const logSOSEvent = async (userId, locationData) => {
  const all = get("sos_logs");
  all.unshift({ userId, location: locationData, triggeredAt: new Date().toISOString(), id: uid() });
  set("sos_logs", all);
};