import {ref, set, get, update} from "firebase/database";
import {db} from "./firebaseConfig";


// firebase RTDB will handle lobby logic.
export const CreateRoom = async (playerName) => {
    const roomCode = Math.random().toString(20).substring(2,6).toUpperCase();
    const roomRef = ref(db, `rooms/${roomCode}`);

    const hostId = Date.now().toString();

    try{
        await set(roomRef, {
            roomCode: roomCode,
            status: "waiting",
            createdAt: Date.now(),
            hostId: hostId,
            players: {
                [hostId]: {name: playerName, isReady: true, isHost: true}
            }
        });
        return ({roomCode, hostId});
    } 
    catch(error){ 
        console.error("Creation failed with error: ", error);
        throw error;
    }
}
export const JoinRoom = async (roomCode, playerName) => {
    const roomRef = ref(db, `rooms/${roomCode}`);

    try{
        const checkRoom = await get(roomRef);

        if (checkRoom.exists()){
            await update(ref(db, `rooms/${roomCode}/players`), {[Date.now()]: {name: playerName, isReady: false}});
            console.log("Room join successful.");
        } else {alert("Room not found!");}
    }
    catch(error){
        console.error(" Join failed with error: ", error)
    }
};