import { StyleSheet, View } from 'react-native';
import {Button, Text, TextInput,Box, List} from "react-native-paper";
import {useRouter} from "expo-router";
import { useState } from "react";
import { useLocalSearchParams } from 'expo-router';
import LobbyPlayers from './components/lobbyPlayers';

export default function Lobby() {
    const router = useRouter();
    const { code } = useLocalSearchParams();
    const [players, setPlayers]  = useState([
        { id: '1', name: 'Alice', isHost: true },
        { id: '2', name: 'Bob', isHost: false },
        { id: '3', name: 'Charlie', isHost: false },
    ]);
    
    return (
    <View style={styles.container}>
        <Text style={{marginBottom: 20, fontSize: 28, fontWeight: 600}} variant="headlineMedium"> Join with Game PIN: {code} </Text>
        <LobbyPlayers players={players} />
        <Button mode="contained" style={styles.button} onPress={() => router.push("/home")}>
            Start Game
        </Button>
    </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
    alignItems: 'center',
  },
  button: {borderRadius: 5}
});
