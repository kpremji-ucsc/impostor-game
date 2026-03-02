import { View } from 'react-native';
import { Text } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect  } from "react";
import { kick, leave, ready, spectator, useLobbyListener, startGame, usePlayerDisconnectListener, useStartGameListener, useRedirectIfNotPresent} from './lobbyCalls.js'
import { LobbyPlayers } from './components/lobbyPlayers.js';
import { styles } from '../styles/Styles.js';
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
    const isSpectating = myPlayer?.isSpectator ?? false;
    const activePlayers = players.filter(p => !p.isSpectator);
    const allReady = 
      activePlayers.length >= 3 && 
      activePlayers.every((player) => player.isReady);
    
    const checkHost = (isHost === 'true');
    const [showPopup, setShowPopup] = useState(false);
    const [displayName, setDisplayName] = useState(() => {
      return typeof window !== 'undefined' ? localStorage.getItem("displayName") || "" : ""}
    );

    useEffect(() => {
      if (!displayName) { setShowPopup(true); }
    }, [displayName]);

    const handleSaveName = () => {
      if (!displayName.trim()) return;
      localStorage.setItem("displayName", displayName.trim());
      setShowPopup(false);
    }

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
              {isSpectating ? "Start Game (as Spectator)" : "Start Game"}
            </AppButton>
            ) : !isPreview ? (
            <AppButton 
              disabled={isSpectating}
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

            <AppButton 
              mode="contained" 
              onPress={() => setShowPopup(true)}
            >
              Change Username
            </AppButton>

            <AppButton
              mode="contained"
              onPress={() => spectator(roomCode, playerId, isSpectating, checkHost)}
              >
                {isSpectating ? "Stop Spectating" : "Spectate"}
              </AppButton>

        <DisplayNameModal
          visible={showPopup}
          displayName={displayName}
          setDisplayName={setDisplayName}
          onSave={handleSaveName}
        />

      </View>
    </View>
    );
}
