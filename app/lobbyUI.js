import { View, Modal } from 'react-native';
import { Button, Text, TextInput } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect  } from "react";
import { kick, leave, ready, useLobbyListener, startGame, usePlayerDisconnectListener, useStartGameListener, useRedirectIfNotPresent} from './lobbyCalls.js'
import { LobbyPlayers } from './components/lobbyPlayers.js';
import { styles } from '../styles/Styles.js';
import { chooseImpostor } from '../dbActions.js';

export default function Lobby() {
    const router = useRouter();
    const { roomCode, playerId, isHost, preview } = useLocalSearchParams();
    const isPreview = preview === "true";

    const [players, setPlayers]  = useState([]);
    const playerList = players ? Object.values(players) : [];

    const myPlayer = players.find(p => p.id === playerId);
    const isReady = myPlayer?.isReady ?? false;
    const allReady = 
      playerList.length > 1 && 
      playerList.every((player) => player.isReady);
    
    const checkHost = (isHost === 'true');
    const [showPopup, setShowPopup] = useState(false);
    const [displayName, setDisplayName] = useState("");
    useEffect(() => {
  const savedName = localStorage.getItem("displayName");
  if (!savedName) {
    setShowPopup(true);
  } else {
    setDisplayName(savedName);
  }
}, []);
    // Preview mode is for UI-only navigation from login without an active room.

    if (!isPreview) {
      // custom hooks must start with use as per react rules of hooks
      useLobbyListener(roomCode, router, setPlayers);
      usePlayerDisconnectListener(roomCode, playerId, isHost);
      useRedirectIfNotPresent(roomCode, playerId, router);
      useStartGameListener(roomCode, playerId, checkHost, router);
    }

    return (
    <View style={styles.container}>
        <Text style={styles.title} variant="headlineMedium">
          {isPreview ? "Lobby Preview" : `Join with Game PIN: ${roomCode}`}
        </Text>
        <LobbyPlayers 
          players={players} 
          isHost={checkHost} 
          kickCall={ (targetId) => { kick(roomCode, targetId)}} 
        />

        {checkHost && !isPreview ? (
          <Button
            disabled={!allReady}
            mode="contained" 
            style={styles.button} 
            onPress={() => {
              startGame(roomCode)
              chooseImpostor(roomCode)
            }}
          >
            Start Game
          </Button>
          ) : !isPreview ? (
          <Button 
            mode="contained" 
            style={styles.button} 
            onPress={() => {ready(roomCode, playerId, isReady)}}
          >
            {isReady ? "Unready" : "Ready Up"}
          </Button> ) : null
        }

          <Button 
            mode="outlined"
            onPress={() => {
              if (isPreview) {
                router.replace("/");
                return;
              }
              leave(checkHost, roomCode, playerId, router);
            }}
            style={styles.button}
          > 
            {isPreview ? "Return" : checkHost ? 'Close Lobby' : 'Leave Lobby'}
          </Button>
          <Button mode="contained" onPress={() => setShowPopup(true)}>
        Change Username
      </Button>

     <Modal visible={showPopup} transparent animationType="fade">
  <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}>
    <View style={{ width: "85%", backgroundColor: "#fff", padding: 16, borderRadius: 12 }}>
      <Text>Enter display name</Text>
      <TextInput value={displayName} onChangeText={setDisplayName} />
      <Button
        mode="contained"
        onPress={() => {
          if (!displayName.trim()) return;
          localStorage.setItem("displayName", displayName.trim());
          setShowPopup(false);
        }}
      >
        Save
      </Button>
    </View>
  </View>
</Modal>
    </View>
    );
}
