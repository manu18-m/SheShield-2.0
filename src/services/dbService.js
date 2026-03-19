// src/services/dbService.js — localStorage (no Firestore needed, works offline)

const get = (key) => { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } };
const set = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// ── CONTACTS ──────────────────────────────────────────────────
export const addContact = async (userId, contact) => {
  const all = get("ss_contacts");
  all.push({ ...contact, userId, active: true, id: uid(), createdAt: new Date().toISOString() });
  set("ss_contacts", all);
};

export const updateContact = async (contactId, data) => {
  const all = get("ss_contacts").map(c => c.id === contactId ? { ...c, ...data } : c);
  set("ss_contacts", all);
};

export const deleteContact = async (contactId) => {
  set("ss_contacts", get("ss_contacts").filter(c => c.id !== contactId));
};

export const listenToContacts = (userId, callback) => {
  const run = () => callback(get("ss_contacts").filter(c => c.userId === userId));
  run();
  const id = setInterval(run, 800);
  return () => clearInterval(id);
};

// ── INCIDENTS ─────────────────────────────────────────────────
export const addIncident = async (userId, incident) => {
  const all = get("ss_incidents");
  all.unshift({ ...incident, userId, id: uid(), createdAt: new Date().toISOString() });
  set("ss_incidents", all);
};

export const deleteIncident = async (incidentId) => {
  set("ss_incidents", get("ss_incidents").filter(i => i.id !== incidentId));
};

export const listenToIncidents = (userId, callback) => {
  const run = () => callback(get("ss_incidents").filter(i => i.userId === userId));
  run();
  const id = setInterval(run, 800);
  return () => clearInterval(id);
};

// ── SOS LOGS ──────────────────────────────────────────────────
export const logSOSEvent = async (userId, locationData) => {
  const all = get("ss_sos_logs");
  all.unshift({ userId, location: locationData, triggeredAt: new Date().toISOString(), id: uid() });
  set("ss_sos_logs", all);
};