// src/drivers/SupabaseDriver.js
// Minimal stub to implement storage interface. Fill with real supabase client logic when ready.

export default class SupabaseDriver {
  constructor({ supabaseClient = null } = {}) {
    this.client = supabaseClient;
    // NOTE: do not include keys here. Use server-side functions or environment variables.
  }

  async load() {
    // Example: return { tasks: {}, prefs: {} }
    // Replace with your Supabase queries (auth required)
    console.warn('SupabaseDriver used but not implemented. Falling back to empty.');
    return { tasks: {}, prefs: {} };
  }

  async save({ tasks, prefs }) {
    // Replace with insert/update logic; consider upserts and conflict resolution.
    console.warn('SupabaseDriver.save called but not implemented.');
    return false;
  }
}
