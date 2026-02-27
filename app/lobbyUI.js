import { View } from 'react-native';
import { Button, Text } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
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
                router.replace("/create");
                return;
              }
            }}
            style={styles.button}
          > 
            {"Create Lobby"}
          </Button> 
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
    </View>
    );
}
