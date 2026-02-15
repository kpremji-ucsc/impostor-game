import { ref, set, remove, update, runTransaction } from "firebase/database";
import { db } from "./firebaseConfig";


export const CreateRoom = async (playerName, numPlayers, numImposters) => {
    const roomCode = Math.random().toString(20).substring(2,6).toUpperCase();
    const roomRef = ref(db, `rooms/${roomCode}`);
    const hostId = Date.now().toString();

    try{
        await set(roomRef, {
            roomCode: roomCode,
            numImposters: numImposters,
            numPlayers: numPlayers,
            status: "waiting",
            createdAt: Date.now(),
            hostId: hostId,
            players: {
                [hostId]: {name: playerName, isReady: true, isHost: true}
            }
        });
        return ({roomCode, hostId, isHost: true});
    } 
    catch(e){ 
        console.error("Creation failed with error: ", e);
        throw e;
    }
}

export const JoinRoom = async (roomCode, playerName) => {
    const roomRef = ref(db, `rooms/${roomCode}`);
    const newPlayerId = Date.now().toString();
    try{
            const status = await runTransaction(roomRef, (room) => {
            // check if room exists, then check
            if (room === null ) {return room;}

            if (room.status !== "waiting") {return;}

            const MAX_PLAYERS = room.numPlayers;
            const currentPlayers = room.players ? Object.keys(room.players) : [];
            if (currentPlayers.length >= MAX_PLAYERS) {return;}

            room.players[newPlayerId] = {
                name: playerName,
                isReady: false,
                isHost: false,
            };
            return room;
        });

        if (!status.committed) {throw new Error("Lobby not found, or is full!"); }
        return ({roomCode, newPlayerId, isHost: false});
    } catch(e) {
        console.error(" Join failed with error: ", e);
        throw e;
    }
};

export const ReadyUp = async (roomCode, playerId, currentReadyStatus) => {

    try{
        const playerRef = ref(db, `rooms/${roomCode}/players/${playerId}`);
        await update(playerRef, {isReady: !currentReadyStatus});
    } catch(e) {
        console.error("Failed to update ready status!: ", e)
    }
}

export const LeaveRoom = async(roomCode, playerId, isHost) =>{
    try{
        if (isHost){
            const roomRef = ref(db, `rooms/${roomCode}`);
            await remove(roomRef);
        }
        const player = ref(db, `rooms/${roomCode}/players/${playerId}`);
        await remove(player);
        return true;
    } catch(e) {
        console.error("Failed to leave: ", e);
        throw e;
    }
}