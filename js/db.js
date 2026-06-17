import { createClient } from '@supabase/supabase-js';
import { render } from './render.js';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

var _client  = null;
var _userId  = null;
var _ready   = false;

function init() {
  if (!SUPABASE_URL || !SUPABASE_ANON) return;

  try {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON);
  } catch (e) {
    return;
  }

  _client.auth.getSession().then(function(result) {
    var session = result && result.data && result.data.session;
    console.log("[db] getSession:", session ? "existing session" : "no session");
    if (session && session.user) {
      _userId = session.user.id;
      _ready  = true;
      render();
    } else {
      return _client.auth.signInAnonymously();
    }
  }).then(function(result) {
    if (!result) return;
    console.log("[db] signInAnonymously result:", JSON.stringify(result));
    var user = result && result.data && result.data.user;
    if (user) {
      _userId = user.id;
      _ready  = true;
      render();
    }
  }).catch(function(err) {
    console.error("[db] auth error:", err);
  });
}

function saveCurrentBrief(fields, score) {
  if (!_ready) return Promise.reject(new Error("not ready"));

  var title = (fields.name && fields.name.trim()) ? fields.name.trim() : "Untitled Brief";

  return _client
    .from("briefs")
    .insert({ user_id: _userId, title: title, fields: fields, score: score })
    .select()
    .single()
    .then(function(result) {
      if (result.error) throw result.error;
      return result.data;
    });
}

function loadSavedBriefs() {
  if (!_ready) return Promise.resolve([]);

  return _client
    .from("briefs")
    .select("id, title, score, created_at, fields")
    .order("created_at", { ascending: false })
    .then(function(result) {
      if (result.error) return [];
      return result.data || [];
    })
    .catch(function() { return []; });
}

function updateBrief(id, fields, score) {
  if (!_ready) return Promise.reject(new Error("not ready"));

  var title = (fields.name && fields.name.trim()) ? fields.name.trim() : "Untitled Brief";

  return _client
    .from("briefs")
    .update({ title: title, fields: fields, score: score })
    .eq("id", id)
    .eq("user_id", _userId)
    .select()
    .single()
    .then(function(result) {
      if (result.error) throw result.error;
      return result.data;
    });
}

function deleteBrief(id) {
  if (!_ready) return Promise.resolve(false);

  return _client
    .from("briefs")
    .delete()
    .eq("id", id)
    .then(function(result) {
      return !result.error;
    })
    .catch(function() { return false; });
}

function isReady() {
  return _ready;
}

export const db = { init, saveCurrentBrief, updateBrief, loadSavedBriefs, deleteBrief, isReady };
