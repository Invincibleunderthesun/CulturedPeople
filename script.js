// script.js - Cultured People (corrected)
// Requirements in index.html:
// - Buttons / inputs with ids: nameInput, scoreInput, addBtn, toggleViewBtn, saveViewBtn,
//   viewsSelect, loadViewBtn, deleteViewBtn, exportBtn, importBtn, useFirebase
// - Divs: graph (id="graph"), laugh-container (id="laugh-container")

/* ================== CONFIG ================== */
const MEMES = [
    "memes/indian1.webp",
    "memes/indian2.webp",
    "memes/indian3.webp",
    "memes/indian4.webp"
];

const FIREBASE_PATH = "/cultured_people/data";

/* ================== STATE ================== */
let people = JSON.parse(localStorage.getItem("people") || "[]");
let views = JSON.parse(localStorage.getItem("views") || "{}");
let leaderboard = false;
let lastLocalWriteAt = 0;

/* ================== DOM REFS (safe) ================== */
const $ = id => document.getElementById(id);

// core
const graph = $("graph");
const nameInput = $("nameInput");
const scoreInput = $("scoreInput");
const addBtn = $("addBtn");

// controls
const toggleViewBtn = $("toggleViewBtn");
const saveViewBtn = $("saveViewBtn");
const viewsSelect = $("viewsSelect");
const loadViewBtn = $("loadViewBtn");
const deleteViewBtn = $("deleteViewBtn");
const exportBtn = $("exportBtn");
const importBtn = $("importBtn");
const useFirebaseCheckbox = $("useFirebase");
const laughContainer = $("laugh-container");

/* gracefully handle missing elements */
if (!graph) throw new Error("Missing #graph element in index.html");
if (!laughContainer) console.warn("Missing #laugh-container; meme popups will not display.");

/* ================== HELPERS ================== */
const uid = () => Math.random().toString(36).slice(2, 9);

function saveLocal() {
    localStorage.setItem("people", JSON.stringify(people));
    lastLocalWriteAt = Date.now();
}

function saveViews() {
    localStorage.setItem("views", JSON.stringify(views));
}

/* escape HTML for safety */
function esc(s) {
    return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

/* ================== RENDER ================== */
function updateViewsSelect() {
    if (!viewsSelect) return;
    viewsSelect.innerHTML = "";
    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = "-- saved views --";
    viewsSelect.appendChild(empty);
    Object.keys(views).forEach(k => {
        const o = document.createElement("option");
        o.value = k;
        o.textContent = k;
        viewsSelect.appendChild(o);
    });
}

function render() {
    graph.innerHTML = "";

    const list = leaderboard ? [...people].sort((a, b) => b.score - a.score) : people;
    const maxScore = Math.max(1, ...list.map(p => p.score));

    list.forEach(p => {
        const col = document.createElement("div");
        col.className = "column";

        const bar = document.createElement("div");
        bar.className = "bar";
        bar.style.height = "300px"; // total height fixed

        const fill = document.createElement("div");
        fill.className = "fill";
        const h = Math.max(4, Math.round((p.score / maxScore) * 280));
        fill.style.height = h + "px";
        fill.textContent = p.score;

        bar.appendChild(fill);

        const name = document.createElement("div");
        name.className = "name";
        name.textContent = p.name;

        // action buttons under name
        const actions = document.createElement("div");
        actions.style.display = "flex";
        actions.style.flexDirection = "column";
        actions.style.marginTop = "8px";
        actions.style.gap = "4px";

        const inc = document.createElement("button");
        inc.textContent = "+10";
        inc.onclick = () => changeScore(p.id, 10);

        const dec = document.createElement("button");
        dec.textContent = "-10";
        dec.onclick = () => changeScore(p.id, -10);

        const rem = document.createElement("button");
        rem.textContent = "X";
        rem.onclick = () => removePerson(p.id);

        actions.appendChild(inc);
        actions.appendChild(dec);
        actions.appendChild(rem);

        col.appendChild(bar);
        col.appendChild(name);
        col.appendChild(actions);

        graph.appendChild(col);
    });
}

/* ================== CRUD ================== */
function addPerson() {
    const name = nameInput?.value?.trim();
    const init = parseInt(scoreInput?.value) || 0;
    if (!name) {
        alert("Please enter a name");
        return;
    }
    const person = { id: uid(), name, score: init };
    people.push(person);
    saveLocal();
    render();
    if (useFirebaseCheckbox?.checked) pushToFirebase();
    if (nameInput) nameInput.value = "";
    if (scoreInput) scoreInput.value = "";
}

function removePerson(id) {
    people = people.filter(p => p.id !== id);
    saveLocal();
    render();
    if (useFirebaseCheckbox?.checked) pushToFirebase();
}

function changeScore(id, delta) {
    people = people.map(p => p.id === id ? { ...p, score: Math.max(0, p.score + delta) } : p);
    saveLocal();
    render();
    showLaugh();
    if (useFirebaseCheckbox?.checked) pushToFirebase();
}

/* ================== MEME POP ================== */
function showLaugh() {
    if (!laughContainer) return;
    const img = document.createElement("img");
    img.className = "laugh";
    const src = MEMES[Math.floor(Math.random() * MEMES.length)];
    img.src = src;
    laughContainer.appendChild(img);
    setTimeout(() => {
        try { img.remove(); } catch (e) { }
    }, 1200);
}

/* ================== VIEWS ================== */
function saveView() {
    const name = prompt("Name this view (unique identifier):");
    if (!name) return;
    views[name] = JSON.parse(JSON.stringify(people));
    saveViews();
    updateViewsSelect();
    alert("View saved: " + name);
}

function loadView() {
    const key = viewsSelect?.value;
    if (!key) { alert("Select a saved view"); return; }
    people = JSON.parse(JSON.stringify(views[key] || []));
    saveLocal();
    render();
}

function deleteView() {
    const key = viewsSelect?.value;
    if (!key) { alert("Select a saved view"); return; }
    if (!confirm("Delete view " + key + " ?")) return;
    delete views[key];
    saveViews();
    updateViewsSelect();
}

/* ================== EXPORT / IMPORT ================== */
function exportJSON() {
    const data = { people, views, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cultured_people_export.json";
    a.click();
    URL.revokeObjectURL(url);
}

function importJSON() {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = "application/json";
    inp.onchange = e => {
        const f = e.target.files[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = ev => {
            try {
                const obj = JSON.parse(ev.target.result);
                if (obj.people) people = obj.people;
                if (obj.views) views = obj.views;
                saveLocal();
                saveViews();
                updateViewsSelect();
                render();
                alert("Import successful");
            } catch (err) {
                alert("Invalid JSON file");
            }
        };
        r.readAsText(f);
    };
    inp.click();
}

/* ================== FIREBASE (compat) ================== */
let firebaseRef = null;
function initFirebaseIfPresent() {
    if (window.firebase && window.firebase.database) {
        const db = window.firebase.database();
        firebaseRef = db.ref(FIREBASE_PATH);

        // subscribe
        firebaseRef.on("value", snap => {
            const val = snap.val();
            if (!val) return;
            // apply remote if newer than local write
            if (!val.updatedAt || val.updatedAt > lastLocalWriteAt) {
                people = val.people || [];
                saveLocal();
                render();
            }
        });
        return true;
    }
    return false;
}

function pushToFirebase() {
    if (!firebaseRef) {
        if (!initFirebaseIfPresent()) return;
    }
    try {
        firebaseRef.set({ people, updatedAt: Date.now() });
    } catch (e) {
        console.warn("Firebase push failed:", e);
    }
}

/* ================== EVENTS and INIT ================== */
(function wire() {
    // wire buttons w/ guards
    if (addBtn) addBtn.addEventListener("click", addPerson);
    if (saveViewBtn) saveViewBtn.addEventListener("click", saveView);
    if (toggleViewBtn) toggleViewBtn.addEventListener("click", () => {
        leaderboard = !leaderboard;
        toggleViewBtn.textContent = leaderboard ? "Normal View" : "Leaderboard View";
        render();
    });
    if (loadViewBtn) loadViewBtn.addEventListener("click", loadView);
    if (deleteViewBtn) deleteViewBtn.addEventListener("click", deleteView);
    if (exportBtn) exportBtn.addEventListener("click", exportJSON);
    if (importBtn) importBtn.addEventListener("click", importJSON);

    if (useFirebaseCheckbox) {
        useFirebaseCheckbox.addEventListener("change", (e) => {
            if (e.target.checked) {
                const ok = initFirebaseIfPresent();
                if (!ok) {
                    alert("Firebase SDK/config not detected. Make sure firebase-app-compat and firebase-config.js are loaded in index.html.");
                    e.target.checked = false;
                    return;
                }
                // push current state to DB immediately
                pushToFirebase();
            } else {
                if (firebaseRef && firebaseRef.off) try { firebaseRef.off(); } catch (e) { }
            }
        });
    }

    // initial UI
    updateViewsSelect();
    render();

    // if firebase already present and checkbox pre-checked, wire it
    if (useFirebaseCheckbox && useFirebaseCheckbox.checked) {
        initFirebaseIfPresent();
    }
})();