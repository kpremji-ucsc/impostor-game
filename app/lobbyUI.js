import { View } from 'react-native';
import { Button, Text } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { kick, leave, ready, useLobbySync} from './lobbyCalls.js'
import { LobbyPlayers } from './components/lobbyPlayers.js';
import { styles } from '../styles/Styles.js';

export default function Lobby() {
    const router = useRouter();
    const { roomCode, playerId, isHost} = useLocalSearchParams();
    const [players, setPlayers]  = useState(null);
    const checkHost = isHost === 'true';
    const myReady = players ? players.find(p => p.id === playerId): null;
    const isReady = myReady ? myReady.isReady : false;

    // custom hooks must start with use as per react rules of hooks
    useLobbySync(roomCode, playerId, checkHost, router, setPlayers)

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
            mode="contained" 
            style={styles.button} 
            onPress={() => router.push("/home")}
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

        {checkHost ? ( 
          <Button 
            mode="outlined"
            onPress={() => leave(checkHost, roomCode, playerId, router)}
            style={styles.button}
          > 
            Close Lobby 
          </Button> 
          ) : (
          <Button 
            mode="outlined"
            onPress={() => leave(checkHost, roomCode, playerId, router)}
            style={styles.button}
          > 
            Leave Lobby 
          </Button> )
        }
    </View>
    );
}
