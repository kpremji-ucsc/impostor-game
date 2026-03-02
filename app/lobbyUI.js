import { View } from 'react-native';
import { Text } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect  } from "react";
import { kick, leave, ready, useLobbyListener, startGame, usePlayerDisconnectListener, useStartGameListener, useRedirectIfNotPresent} from './lobbyCalls.js'
import { LobbyPlayers } from './components/lobbyPlayers.js';
import { styles } from '../styles/Styles.js';
import { chooseImpostor,pushUserName } from '../dbActions.js';
import { chooseImpostor } from '../dbActions.js';
import { DisplayNameModal } from './components/displayNamePopUp.js';
import { AppButton } from './components/appButton.js';
import { MovingDiagonalBackground } from './components/movingBackground.js';

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
    const [displayName, setDisplayName] = useState(() => {
      return typeof window !== 'undefined' ? localStorage.getItem("displayName") || "" : ""}
    );

    useEffect(() => {
  const savedName = localStorage.getItem("displayName")?.trim() ?? "";
  if (savedName) {
    setDisplayName(savedName);
    setShowPopup(false);
    return;
  }

  setShowPopup(true);
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
    <View style={{ flex: 1 }}>
      <MovingDiagonalBackground/>
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
            <AppButton
              disabled={!allReady}
              mode="contained" 
              onPress={() => {
                startGame(roomCode)
                chooseImpostor(roomCode)
              }}
            >
              Start Game
            </AppButton>
            ) : !isPreview ? (
            <AppButton 
              mode="contained" 
              style={styles.button} 
              onPress={() => {ready(roomCode, playerId, isReady)}}
            >
              {isReady ? "Unready" : "Ready Up"}
            </AppButton> ) : null
          }

            <AppButton 
              mode="outlined"
              onPress={() => {
                if (isPreview) {
                  router.replace("/");
                  return;
                }
                leave(checkHost, roomCode, playerId, router);
              }}
            > 
              {isPreview ? "Return" : checkHost ? 'Close Lobby' : 'Leave Lobby'}
            </AppButton>

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
          if(localStorage.getItem("userId")!= null ) {
              pushUserName (localStorage.getItem("userId"), displayName.trim())
          }
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
