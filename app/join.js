import { StyleSheet, View } from 'react-native';
import {Button, Text, Snackbar} from "react-native-paper";
import { TextInput } from 'react-native-paper';
import {useRouter} from "expo-router";
import { useState } from "react";
export default function FindLobby() {
    const router = useRouter();
    const [code, setCode] = useState("");
    const [noLobbyFoundAlert, setNoLobbyFoundAlert] = useState(false);
    const handleJoin = async () => {
    const lobbyExists = await checkLobbyExists(code);

    if (!lobbyExists) {
        setNoLobbyFoundAlert(true);
        return;
    }

    router.push({
        pathname: "/lobby",
        params: { code },
    });
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

      <Button mode="contained" onPress={handleJoin}>
        Join
      </Button>

      <Button mode="contained" onPress={() => router.push("/create")}>
        Create Lobby
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
        Lobby not found. Check the PIN and try again.
      </Snackbar>
    </View>
  );
}

// replace with backend implmementation later
const checkLobbyExists = async (code) => {
  const validLobbies = ["123456", "000000", "999999"];
  return validLobbies.includes(code);
};

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
