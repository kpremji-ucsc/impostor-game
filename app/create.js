import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, Snackbar } from "react-native-paper";
import { useRouter } from "expo-router";
import { useState } from "react";
import { CreateRoom } from "../lobbyActions.js";

export default function CreateLobby() {
  const router = useRouter();
  const [lobbySize, setLobbySize] = useState("");
  const [impostors, setImpostors] = useState("1");
  const [noLobbyCreatedAlert, setNoLobbyCreatedAlert] = useState(false);

  const create = async () => {
      try {
          // later change when we have SQLite to handle display name and persist locally
          const username = "Player" + Math.random().toString(20).substring(2,6).toUpperCase();

          const { roomCode, hostId, isHost } = await CreateRoom(
            username, 
            parseInt(lobbySize), 
            parseInt(impostors)
          );
          
          router.push({
              pathname: "/lobby", 
              params: {
              roomCode: roomCode, 
              playerId: hostId,
              isHost: isHost
            }, 
          });
        } catch (e) {
            setNoLobbyCreatedAlert(true);
            console.error(e);
        }
  };

  const isInvalid = lobbySize.trim() === "" 
        || parseInt(lobbySize) <= 0 
        || impostors.trim() === "" 
        || parseInt(impostors) <= 0
        || parseInt(impostors) > 3
        || parseInt(impostors) > parseInt(lobbySize);

  return (
    <View style={styles.container}>
      <Text 
        style={styles.title} 
        variant="headlineMedium"
        > 
        Create Lobby 
      </Text>

      <TextInput
        label="Lobby Size" 
        maxLength={1}
        value={lobbySize}
        onChangeText={setLobbySize}
        style={{ width: "40%", marginBottom: 20 }}
        mode="outlined"
        placeholder="Enter lobby size!"
        keyboardType="number-pad"
      />

      <TextInput
        label="Impostors" 
        maxLength={1}
        value={impostors}
        onChangeText={setImpostors}
        style={{ width: "40%", marginBottom: 20 }}
        mode="outlined"
        placeholder="Maximum number of imposters is three!"
        keyboardType="number-pad"
      />

        <Button
          disabled={isInvalid}
          mode="contained" 
          onPress={create}
        >
          Create Lobby
        </Button>

        <Button
          mode="contained" 
          onPress={() => {router.replace("/")}}
        >
          Return
        </Button>

        <Snackbar
          visible={noLobbyCreatedAlert}
          onDismiss={() => setNoLobbyCreatedAlert(false)}
          duration={3000}
          action={{
            icon: "close",
            onPress: () => setNoLobbyCreatedAlert(false),
          }}
        >
        Lobby not able to be created! Please try again.
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {borderRadius: 5},
  title: {
    marginBottom: 20, 
    fontSize: 30, 
    fontWeight: 600
  },
});
