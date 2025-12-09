// firebase-config.js
// This file initializes Firebase (Realtime Database) for the site.
// If you don't want it in repo, remove it and create one locally on your machine.

var firebaseConfig = {
    apiKey: "AIzaSyD4goil1g4YfoRcG5_mLqmm4WksCiIA0U8",
    authDomain: "culturedpeople-33e26.firebaseapp.com",
    projectId: "culturedpeople-33e26",
    storageBucket: "culturedpeople-33e26.firebasestorage.app",
    messagingSenderId: "689023478724",
    appId: "1:689023478724:web:c507759c80ae30a45e1291",
    measurementId: "G-8HNB2SWEN4",
    databaseURL: "https://culturedpeople-33e26-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize firebase (compat style loaded by index.html)
if (window.firebase && window.firebase.initializeApp) {
    try {
        window.firebase.initializeApp(firebaseConfig);
    } catch (e) {
        // ignore if already initialized
    }
}
