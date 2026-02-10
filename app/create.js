import { StyleSheet, View } from 'react-native';
import {Button, Text, TextInput} from "react-native-paper";
import {useRouter} from "expo-router";
import { useState } from "react";
export default function Index() {
  const router = useRouter();
  const [lobbySize, setLobbySize] = useState(4);
  const [impostors, setImpostors] = useState(1);

  return (
    <View style={styles.container}>
      <Text style={{marginBottom: 20, fontSize: 30, fontWeight: 600}} variant="headlineMedium"> Create Lobby </Text>
      <TextInput
        label="Lobby Size" 
        maxLength={1}
        value={lobbySize}
        onChangeText={setLobbySize}
        style={{ width: "40%", marginBottom: 20 }}
        mode="outlined"
        keyboardType="number-pad"
      />
      <TextInput
        label="Impostors" 
        maxLength={2}
        value={impostors}
        onChangeText={setImpostors}
        style={{ width: "40%", marginBottom: 20 }}
        mode="outlined"
        keyboardType="number-pad"
      />
      <Button mode="contained" onPress={() => router.push("/lobby")}>
        Create Lobby
      </Button>

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
