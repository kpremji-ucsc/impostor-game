import { View } from 'react-native';
import { Button, Text } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { kick, leave, ready, useLobbyListener, startGame, usePlayerPresenceListener, useStartGameListener} from './lobbyCalls.js'
import { LobbyPlayers } from './components/lobbyPlayers.js';
import { styles } from '../styles/Styles.js';
import { chooseImpostor } from '../dbActions.js';

export default function Lobby() {
    const router = useRouter();
    const { roomCode, playerId, isHost } = useLocalSearchParams();

    const [players, setPlayers]  = useState([]);
    const playerList = players ? Object.values(players) : [];

    const myPlayer = players.find(p => p.id === playerId);
    const isReady = myPlayer?.isReady ?? false;
    const allReady = 
      playerList.length > 1 && 
      playerList.every((player) => player.isReady);
    
    const checkHost = (isHost === 'true');


    // custom hooks must start with use as per react rules of hooks
    useLobbyListener(roomCode, router, setPlayers);
    usePlayerPresenceListener(roomCode, playerId, isHost);
    useStartGameListener(roomCode, playerId, checkHost, router);

    return (
    <View style={styles.container}>
        <Text style={styles.title} variant="headlineMedium"> Join with Game PIN: {roomCode} </Text>
        <LobbyPlayers 
          players={players} 
          isHost={checkHost} 
          kickCall={ (targetId) => { kick(roomCode, targetId)}} 
        />

        {checkHost ? (
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
          ) : (
          <Button 
            mode="contained" 
            style={styles.button} 
            onPress={() => {ready(roomCode, playerId, isReady)}}
          >
            {isReady ? "Unready" : "Ready Up"}
          </Button> )
        }

          <Button 
            mode="outlined"
            onPress={() => leave(checkHost, roomCode, playerId, router)}
            style={styles.button}
          > 
            {checkHost ? 'Close Lobby' : 'Leave Lobby'}
          </Button> 
    </View>
    );
}
