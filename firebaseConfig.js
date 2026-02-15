import {initializeApp, getApps, getApp} from "firebase/app";
import {getDatabase} from "firebase/database";

// copied this object from firebase web init
const firebaseConfig = {
  apiKey: "AIzaSyCFHP3kBwDfcTTZAGm044w2n5GHZGDjnz8",
  authDomain: "imposter-game-7f296.firebaseapp.com",
  projectId: "imposter-game-7f296",
  storageBucket: "imposter-game-7f296.firebasestorage.app",
  messagingSenderId: "160510917447",
  appId: "1:160510917447:web:fc21cf465f07592d1eea62",
  measurementId: "G-4HXHYW3DZ3",
  databaseURL: "https://imposter-game-7f296-default-rtdb.firebaseio.com/"
};

const app = getApps().length === 0? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);
export {db};