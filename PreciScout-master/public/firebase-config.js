// ============================================================
// CONFIGURACIÓN DE FIREBASE — PreciScout
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyDf95Y1zVT6yklZ525P_c17mK8wRKn-Ypo",
    authDomain: "preciscout.firebaseapp.com",
    projectId: "preciscout",
    storageBucket: "preciscout.firebasestorage.app",
    messagingSenderId: "416390667345",
    appId: "1:416390667345:web:d0602f17c02f4d298cec70",
    measurementId: "G-JJRJZ7H2M8"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Exportar servicios
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();
