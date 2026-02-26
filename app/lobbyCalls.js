import { ReadyUp, LeaveRoom, changeGameStatus } from '../dbActions.js';
import { Platform, Alert } from 'react-native';
import { useEffect, useRef } from 'react';
import { onValue, onDisconnect, child } from 'firebase/database';
import { roomRef, playerRef } from '../dbActions.js';

// db-touching functions separated from original lobby.js file to keep it as pure as possible


//// useEffect wrappers, custom hooks must start with use as per react rules of hooks
// useEffect() is a react function that is used with listeners to interact
// with external components (i.e, listening to a DB), and returns a cleanup
// function to kill the listener when done

export function useLobbyListener(roomCode, router, setPlayers) {
    useEffect(() => {
      if (!roomCode) return;
      const killListener = onValue(roomRef(roomCode), (snapshot) => {
        if (!snapshot.exists()){
          Alert.alert("Lobby closed!", "The host has closed the lobby.")
          router.replace("/");
          return;
          }

        const room = snapshot.val();
        if (!room || typeof room !== "object") return;

        const playersArray= Object.entries(room.players ?? {}).map(([id, data]) => ({
          id: id,
          name: data?.name ?? "",
          isHost: !!data?.isHost,
          isReady:!!data?.isReady,
       }));

        setPlayers(playersArray);
      });

      return() => killListener();
    }, [roomCode, router, setPlayers]);
}

export function useRedirectIfNotPresent(roomCode, playerId, router)
{
  useEffect(() => {
    const killListener = onValue(child(roomRef(roomCode), `players/${playerId}`), (snapshot) => {
      if (!snapshot.exists()){
        router.replace("/");
      }
    });

    return () => killListener();
  }, [roomCode, playerId, router]);
}

 export function usePlayerPresenceListener(roomCode, playerId, isHost){
  useEffect(() => {
    onDisconnect(isHost ? roomRef(roomCode): playerRef(roomCode, playerId)).remove()
  }, [roomCode, playerId, isHost]);
}

export function useStartGameListener(roomCode, playerId, checkHost, router) {
  const hasNavigated = useRef(false);
  useEffect(() => {
    hasNavigated.current = false;
  }, [roomCode]);

  useEffect(() => {
    const killListener = onValue(child(roomRef(roomCode), "status"), (snapshot) => {
      const status = snapshot.val();

      if (status === 'playing' && !hasNavigated.current) {
            hasNavigated.current = true;
            router.push({
              pathname: "/game",
              params: {
                roomCode: roomCode, 
                playerId: playerId,
                isHost: checkHost.toString()
              }
          });
          return;
      }
    });

    return() => killListener();
  }, [roomCode, playerId, checkHost, router]);
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
        console.log("Lobby leave failed, please try again. ")
      }
    }

  // start game wrapper, hide the catch blocks and error catching
  export const startGame = async (roomCode) => {
    try {
      await changeGameStatus(roomCode);
      return;
    } catch (e) {
      console.log("Starting game failed: ", e);
      throw e;
    }
  };