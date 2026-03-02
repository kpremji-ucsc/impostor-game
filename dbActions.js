import { ref, set, get, remove, update, runTransaction, push, serverTimestamp } from "firebase/database";
import { db } from "./firebaseConfig";

export const roomRef = (roomCode) =>
    ref(db, `rooms/${roomCode}/lobby`);

export const chatRef = (roomCode) =>
    ref(db, `rooms/${roomCode}/chatLog`);

export const playerRef = (roomCode, playerId) =>
    ref(db, `rooms/${roomCode}/lobby/players/${playerId}`)

export const CreateRoom = async (playerName, numPlayers, numImposters) => {
    const roomCode = Math.random().toString(20).substring(2,7).toUpperCase();
    const hostId = Date.now().toString();

    try{
        await set(roomRef(roomCode), {
            roomCode: roomCode,
            numImposters: numImposters,
            numPlayers: numPlayers,
            status: "waiting",
            createdAt: Date.now(),
            hostId: hostId,
            players: {
                [hostId]: {
                    name: playerName, 
                    isReady: true, 
                    isHost: true, 
                    isImpostor: false,
                    isSpectator: false,
                }
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
    const newPlayerId = Date.now().toString();

    const snap = await get(roomRef(roomCode));
    if (!snap.exists()) {
        throw new Error("Lobby not found!");
    }

    try{
            const status = await runTransaction(roomRef(roomCode), (room) => {
            // check if room exists, then check room status
            if (room === null ) return room;

            if (room.status !== "waiting") return;

            const MAX_PLAYERS = room.numPlayers;
            const currentPlayers = room.players ? Object.keys(room.players) : [];
            if (currentPlayers.length >= MAX_PLAYERS) {return;}

            room.players[newPlayerId] = {
                name: playerName,
                isReady: false,
                isHost: false,
                isImpostor: false,
                isSpectator: false,
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
        await update(playerRef(roomCode, playerId), {isReady: !currentReadyStatus});
    } catch(e) {
        console.error("Failed to update ready status!: ", e)
    }
}

export const LeaveRoom = async(roomCode, playerId, isHost) =>{
    try{
        if (isHost) {
            await remove(roomRef(roomCode));
            return;
        }
        else {
        const player = ref(db, `rooms/${roomCode}/lobby/players/${playerId}`);
        await remove(player);
        return;
        }
    } catch(e) {
        console.error("Failed to leave: ", e);
        throw e;
    }
}

export const chooseImpostor = async (roomCode) => {

    try{
        await runTransaction(roomRef(roomCode), (room) => {
            if (room === null) { return room; }

            const currentPlayers = room.players ? Object.keys(room.players) : [];
            // loop and reset status if this is playing again 
            currentPlayers.forEach((id) => {room.players[id].isImpostor = false; });

            // filters out spectators from imposter shuffling
            const activePlayers = currentPlayers.filter(id => !room.players[id].isSpectator);

            // math.random by default varies between 0 and 1, and sort() swaps a pair if it is given a positive number
            // by default it would all be positive and only swap items forwards
            // to get a true shuffle, we adjust the range to give us a negative number half the time
            const shuffledPlayers = activePlayers.sort(() => Math.random() - 0.5);

            // take a slice of our new shuffled players and these are now the impostors
            const numImposters = Number (room.numImposters) || 1;
            const impostors = shuffledPlayers.slice(0, numImposters);

            impostors.forEach((id) => {room.players[id].isImpostor = true });
            return room;
        });
        return;
    } catch (e) {
        throw e;
    }
}

export const changeGameStatus = async (roomCode) => {
    try {
        await runTransaction(roomRef(roomCode), (room) => {
            if (room === null) { return room; }
            if (room.status === 'waiting') {
                return {
                    ...room,
                    status: 'playing',
                };
            }
            else {
                return {
                    ...room,
                    status: 'waiting',
                };
            }
        });
        return;
    } catch (e) {
        console.error("Could not start game: ", e);
        throw e;
    }
}

export const pushMessage = async (roomCode, name, text) => {
    if (!text || !text.trim()) return;
    const chatLog = ref(db, `rooms/${roomCode}/chatLog`);

    try{
        const message = {
            name,
            text: text.trim(),
            timestamp: serverTimestamp(),
        };

        // push() from Firebase generates a unique key for each push that is also lexigraphically sorted by time. 
        // therefore, sorted by date automatically
        await push(chatLog, message);
    } catch (e) {
        console.error("Could not push message to DB: ", e);
        throw e;
    }
}

export const ToggleSpectator = async (roomCode, playerId, currentSpectatorStatus, isHost) => {
    try {
        const nextSpectatorStatus = !currentSpectatorStatus;
        await update(playerRef(roomCode, playerId), {
            isSpectator: nextSpectatorStatus,
            isReady: (!nextSpectatorStatus && isHost) ? true : false 
        });
    } catch (e) {
        console.error("Failed to toggle spectator status: ", e);
        throw e;
    }
}