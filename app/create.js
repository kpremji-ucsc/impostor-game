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

  const numImp = parseInt(impostors);
  const numPlayers = parseInt(lobbySize);
  const isInvalid = lobbySize.trim() === "" 
        || numPlayers < 3 
        || impostors.trim() === "" 
        || numImp <= 0
        || numImp > 3
        || numImp >= numPlayers/2

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
          style={{ width: "85%" }}
          mode="outlined"
          placeholder="Minimum players is 3!"
          contentStyle={{ fontFamily: 'SpaceGrotesk' }}
          keyboardType="number-pad"
        />
        <Text 
          style={[styles.invisible, !(numPlayers > 2) && styles.errorText]}
        >
          Minimum players is three!
        </Text>

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
          style={{ width: "85%" }}
          mode="outlined"
          contentStyle={{ fontFamily: 'SpaceGrotesk' }}
          keyboardType="number-pad"
        />
        <Text 
          style={[styles.invisible, isInvalid && styles.errorText]}
        >
          Must be less than half of the total players.
        </Text>

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

