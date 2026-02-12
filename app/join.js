import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, Snackbar } from "react-native-paper";
import { useRouter } from "expo-router";
import { useState } from "react";
import { JoinRoom } from '../lobbyActions';

export default function FindLobby() {
    const router = useRouter();
    const [code, setCode] = useState("");
    const [noLobbyFoundAlert, setNoLobbyFoundAlert] = useState(false);

    const join = async () => {
      try{
        const { roomCode, newPlayerId, isHost } = await JoinRoom(
          code, 
          "Player" + Math.random().toString(20).substring(2,6).toUpperCase()
        );
        router.push({
            pathname: "/lobby",
            params: {
            roomCode: roomCode, 
            playerId: newPlayerId,
            isHost: isHost
          },
        });
      } catch (e) {
          setNoLobbyFoundAlert(true);
          console.error(e);
      }
    };

    return (
    <View style={styles.container}>
      <Text style={{ marginBottom: 20, fontSize: 30, fontWeight: 600 }}>
        Impostor Game
      </Text>

      <TextInput
        label="Game PIN" 
        maxLength={6}
        value={code}
        onChangeText={setCode}
        style={{ width: "40%", marginBottom: 20 }}
        mode="outlined"
        keyboardType="number-pad"
      />

      <Button mode="contained" onPress={join}>
        Join
      </Button>
      
      <Button
        mode="contained" 
        onPress={() => {router.replace("/")}}
      >
        Return
      </Button>

      <Snackbar
        visible={noLobbyFoundAlert}
        onDismiss={() => setNoLobbyFoundAlert(false)}
        duration={3000}
        action={{
          icon: "close",
          onPress: () => setNoLobbyFoundAlert(false),
        }}
      >
        Lobby not found or is full. Check the PIN and try again.
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
  button: {borderRadius: 5}
});
