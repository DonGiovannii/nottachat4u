// Load Firebase SDK via script tag in index.html
const firebaseConfig = {
  apiKey: "AIzaSyAgdj8D_bQsa70-tgXJiel88Ukn3MeHgqA",
  authDomain: "nottachat4u.firebaseapp.com",
  databaseURL: "https://nottachat4u-default-rtdb.firebaseio.com",
  projectId: "nottachat4u",
  storageBucket: "nottachat4u.appspot.com",
  messagingSenderId: "592381449590",
  appId: "1:592381449590:web:6582c43e29ab29b3901657"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

