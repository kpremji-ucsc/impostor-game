import { View } from 'react-native';
import { Text, TextInput, Snackbar } from "react-native-paper";
import { useRouter } from "expo-router";
import { useState } from "react";
import { styles } from '../styles/Styles.js';
import { CreateRoom } from '../dbActions.js';
import { AppButton } from './components/appButton.js';
import { MovingDiagonalBackground } from './components/movingBackground.js';

export default function CreateLobby() {
  const router = useRouter();
  const [lobbySize, setLobbySize] = useState("");
  const [impostors, setImpostors] = useState("1");
  const [noLobbyCreatedAlert, setNoLobbyCreatedAlert] = useState(false);

  const create = async () => {
      try {
        // later change when we have SQLite to handle display name and persist locally
        const username = localStorage.getItem("displayName");

        const { roomCode, hostId, isHost } = await CreateRoom(
                    username, 
                    parseInt(lobbySize), 
                    parseInt(impostors),
                  );

          router.push({
              pathname: "/lobbyUI", 
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
    <View style={{ flex: 1 }}>
      <MovingDiagonalBackground/>
      <View style={styles.container}>
        <Text 
          style={styles.title} 
          variant="headlineMedium"
          > 
          Create Lobby 
        </Text>

        <TextInput
          label={          
            <Text
              style={{ fontFamily: 'SpecialElite' }}
            >
              Lobby Size
            </Text>}
          maxLength={1}
          value={lobbySize}
          onChangeText={setLobbySize}
          style={{ width: "85%", marginBottom: 20 }}
          mode="outlined"
          placeholder="Enter lobby size!"
          contentStyle={{ fontFamily: 'SpaceGrotesk' }}
          keyboardType="number-pad"
        />

        <TextInput
          label={          
            <Text
              style={{ fontFamily: 'SpecialElite' }}
            >
              Impostors
            </Text>}
          maxLength={1}
          value={impostors}
          onChangeText={setImpostors}
          style={{ width: "85%", marginBottom: 20 }}
          mode="outlined"
          placeholder="Maximum imposters is three!"
          contentStyle={{ fontFamily: 'SpaceGrotesk' }}
          keyboardType="number-pad"
        />

          <AppButton
            disabled={isInvalid}
            mode="contained" 
            onPress={create}
          >
            Create Lobby
          </AppButton>

          <AppButton
            mode="contained" 
            onPress={() => {router.replace("/")}}
          >
            Return
          </AppButton>

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
    </View>
  );
}

