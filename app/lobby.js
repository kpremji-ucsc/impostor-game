import { StyleSheet, Platform, Alert, View } from 'react-native';
import { Button, Text } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { ref, onValue, onDisconnect } from 'firebase/database';
import { db } from '../firebaseConfig.js';
import { ReadyUp, LeaveRoom } from '../lobbyActions.js'
import LobbyPlayers from './components/lobbyPlayers';

export default function Lobby() {
    const router = useRouter();
    const { roomCode, playerId, isHost} = useLocalSearchParams();
    const [players, setPlayers]  = useState(null);
    const checkHost = isHost === 'true';
    const myReady = players ? players.find(p => p.id === playerId): null;
    const isReady = myReady ? myReady.isReady : false;

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
          const playerNames = Object.entries(freshPlayers.players).map(([id, data]) => ({
            id: id,
            name: data.name,
            isHost: data.isHost,
            isReady: data.isReady,
        }));
          setPlayers(playerNames);
        }
      })

      return() => killListener(); // cleanup function as per useEffect()
    }, [roomCode]);

    // leave function. pass true to LeaveRoom ifHost to delete room, false if not, then reroute user
    const leave = async() => {
      try{
        if (checkHost){
          // for testing purposes on web, Alert.alert() in the else block is only for mobile devices so it wont display anything
          if (Platform.OS === 'web'){
            const confirmed = window.confirm("Will delete, r u sure?");
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
    


    return (
    <View style={styles.container}>
        <Text style={{marginBottom: 20, fontSize: 28, fontWeight: 600}} variant="headlineMedium"> Join with Game PIN: {roomCode} </Text>
        <LobbyPlayers players={players} />

        {checkHost ? 
        (<Button mode="contained" 
        style={styles.button} 
        onPress={() => router.push("/home")}>
            Start Game
        </Button>)
        :
        (<Button mode="contained" 
        style={styles.button} 
        onPress={() => {ReadyUp(roomCode, playerId, isReady)}}>
            {isReady ? "Unready" : "Ready Up"}
        </Button>)
        }

        {checkHost ?
        (<Button mode="outlined"
        onPress={leave}
        style={styles.button}
        > 
          Close Lobby 
        </Button>)
        :
        (<Button mode="outlined"
        onPress={leave}
        style={styles.button}
        > 
          Leave Lobby 
        </Button>)
        }


    </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  button: {borderRadius: 5}
});
