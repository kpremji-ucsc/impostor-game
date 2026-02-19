import { ReadyUp, LeaveRoom, CreateRoom } from '../dbActions.js';
import { Platform, Alert } from 'react-native';
import { useEffect } from 'react';
import { ref, onValue, onDisconnect } from 'firebase/database';
import { db } from '../firebaseConfig.js';

// db-touching functions separated from original lobby.js file to keep it as pure as possible


// useEffect wrapper, custom hooks must start with use as per react rules of hooks
export function useLobbySync(roomCode, playerId, checkHost, router, setPlayers) {
    // useEffect() is a react function that is used with listeners to interact
    // with external components (i.e, listening to a DB), and returns a cleanup
    // function to kill the listener when done

    // pass roomCode to useEffect(), create listener with firebase ref(), update onValue.
    // onDisconnect() is a firebase listener to disconnect users if they close their websocket connection
    useEffect(() => {
      const roomRef = ref(db, `rooms/${roomCode}`);
      const myPlayerRef = ref(db, `rooms/${roomCode}/players/${playerId}`);

      // if player disconnects from app, we need to also make them leave. onDisconnect is our listener for this
      if (checkHost){
        onDisconnect(roomRef).remove();
      }
      else{
        onDisconnect(myPlayerRef).remove();
      }
      // define cleanup function
      const killListener = onValue(roomRef, (snapshot) => {
        if (!snapshot.exists()){
          Alert.alert("Lobby closed!", "The host has closed the lobby.")
          router.replace("/");
          return;
          }
        const freshPlayers = snapshot.val();
        if (freshPlayers) {
          const playersArray= Object.entries(freshPlayers.players).map(([id, data]) => ({
            id: id,
            name: data.name,
            isHost: data.isHost,
            isReady: data.isReady,
        }));
        const isPresent = playersArray.some((player) => player.id === playerId);
        if (!isPresent && !checkHost) {
          Alert.alert('Kicked', 'You have been kicked from the lobby! ');
          router.replace('/');
          return;
          }
          setPlayers(playersArray);
        }
      });

      return() => killListener(); // cleanup function as per useEffect()
    }, [roomCode, playerId, checkHost, router, setPlayers]);
}

// ReadyUp wrapper, abstracting the catch blocks and error catching
export const ready = async(checkHost, roomCode, playerId) => {
  try { 
        await ReadyUp(checkHost, roomCode, playerId); 
  } 
  catch(e) {
        console.log("Ready up failed: ", e.message);
        throw e;
    }
}
// LeaveRoom wrapper, abstracting the catch blocks and error catching
export const kick = async(roomCode, targetId) => {
  try{
        await LeaveRoom(roomCode, targetId, false);
  }
  catch(e) {
        console.log("Kicking player failed: ", e.message);
        throw e;
  }
}

// leave function. pass true to LeaveRoom ifHost to delete room, false if not, then reroute user
// normally dont want to tangle the UI logic or flow with db calls but.. better to keep this atomic than struggle with timing
export const leave = async(checkHost, roomCode, playerId, router) => {
      try{
        if (checkHost){
          // for testing purposes on web, Alert.alert() in the else block is only for mobile devices so it wont display anything
          if (Platform.OS === 'web'){
            const confirmed = window.confirm("This will delete the lobby for everybody. Are you sure?");
            if (confirmed){
              await LeaveRoom(roomCode, playerId, true);
              router.replace("/");
            }
          }
          else{
          Alert.alert(
            "Are you sure you want to close the lobby?",
            "As the host, this will close it for everyone.",
            [
              {text: "No, take me back!", style: "cancel",},
              {text: "Close Lobby",
               style : "destructive",
               onPress: async () => {
                try{
                    await LeaveRoom(roomCode, playerId, true);
                    router.replace("/")
                }
                catch(e){
                  console.log("Lobby closure failed: ", e.message);
                }
               }
              }
            ]
          );}
        }
        else{
          try{
              await LeaveRoom(roomCode, playerId, false);
              router.replace("/")
          }
          catch(e){
            console.log("Lobby leave failed: ", e.message);
          }
        }
      }
      catch(e) {
        console.log("Lobby leave failed, please try again.")
      }
    }

export const createCall = async (lobbySize, impostors) => {
      try {
          // later change when we have SQLite to handle display name and persist locally
          const username = "Player" + Math.random().toString(20).substring(2,6).toUpperCase();

          const { roomCode, hostId, isHost } = await CreateRoom(
            username, 
            parseInt(lobbySize), 
            parseInt(impostors)
          );
          return { roomCode, hostId, isHost }
          }
      catch (e) {
            console.error(e);
            throw e;
        }
  };