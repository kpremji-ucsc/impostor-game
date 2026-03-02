import { View } from 'react-native';
import { Text, TextInput, Snackbar } from "react-native-paper";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { JoinRoom } from '../dbActions';
import { styles } from '../styles/Styles.js';
import { DisplayNameModal } from './components/displayNamePopUp.js';
import { AppButton } from './components/appButton.js';
import { MovingDiagonalBackground } from './components/movingBackground';

export default function FindLobby() {
    const router = useRouter();
    const [code, setCode] = useState("");
    const [noLobbyFoundAlert, setNoLobbyFoundAlert] = useState(false);

    const [showPopup, setShowPopup] = useState(false);

    const [displayName, setDisplayName] = useState(() => {
          return typeof window !== 'undefined' ? localStorage.getItem("displayName") || "" : ""}
        );
    
        useEffect(() => {
          if (!displayName) { setShowPopup(true); }
        }, [displayName]);
    
    const checkForNameThenJoin = () => {
      const savedName = localStorage.getItem("displayName");
      if (!savedName) { setShowPopup(true); }
      else {
        join(savedName)
      }
    }

    const handleSaveName = () => {
      if (!displayName.trim()) return;
      localStorage.setItem("displayName", displayName.trim());
      setShowPopup(false);
    }


    const join = async (savedName) => {
      setNoLobbyFoundAlert(false);

      try{
        const { roomCode, newPlayerId, isHost } = await JoinRoom(
          code.trim().toUpperCase(),
          savedName
        );
        router.push({
            pathname: "/lobbyUI",
            params: {
            roomCode: roomCode, 
            playerId: newPlayerId,
            isHost: isHost,
          },
        });
      } catch (e) {
          console.error(e);
          setNoLobbyFoundAlert(true);
      }
    };

    return (
    <View style={{ flex: 1 }}>
      <MovingDiagonalBackground/>
      <View style={styles.container}>
        <Text style={styles.title}>
          Impostor Game
        </Text>

        <TextInput
          label={
            <Text
            style={{ fontFamily: 'SpecialElite' }}
            >
              Game Pin
            </Text>
          }
          keyboardType="default"
          maxLength={6}
          value={code}
          onChangeText={(text) => setCode(text.toUpperCase())}
          style={{ width: "85%", marginBottom: 20 }}
          contentStyle={{ fontFamily: 'SpaceGrotesk' }}
          mode="outlined"
        />

        < AppButton 
          mode="contained" 
          onPress={checkForNameThenJoin}
          disabled={!code.trim()}
        >
          Join
        </AppButton>

        <AppButton
          mode="contained" 
          onPress={() => {router.replace("/")}}
        >
          Return
        </AppButton>

        <DisplayNameModal
          visible={showPopup}
          displayName={displayName}
          setDisplayName={setDisplayName}
          onSave={handleSaveName}
        />

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
    </View>
  );
}
