import { View, Modal } from 'react-native';
import { Text, TextInput, Button } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  kick,
  leave,
  ready,
  useLobbyListener,
  startGame,
  usePlayerDisconnectListener,
  useStartGameListener,
  useRedirectIfNotPresent
} from './lobbyCalls.js';

import { LobbyPlayers } from './components/lobbyPlayers.js';
import { styles } from '../styles/Styles.js';
import { chooseImpostor, pushUserName } from '../dbActions.js';
import { AppButton } from './components/appButton.js';
import { MovingDiagonalBackground } from './components/movingBackground.js';

export default function Lobby() {
  const router = useRouter();
  const { roomCode, playerId, isHost, preview } = useLocalSearchParams();
  const isPreview = preview === "true";
  const checkHost = isHost === "true";

  const [players, setPlayers] = useState({});
  const playerList = players ? Object.entries(players).map(([id, player]) => ({
    id,
    ...player,
  })) : [];

  const myPlayer = players?.[playerId];
  const isReady = myPlayer?.isReady ?? false;

  const allReady =
    playerList.length > 1 &&
    playerList.every((player) => player.isReady);

  const [showPopup, setShowPopup] = useState(false);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const loadDisplayName = async () => {
      try {
        const savedName = (await AsyncStorage.getItem("displayName"))?.trim() ?? "";

        if (savedName) {
          setDisplayName(savedName);
          setShowPopup(false);
        } else {
          setShowPopup(true);
        }
      } catch (e) {
        console.error("Failed to load display name:", e);
        setShowPopup(true);
      }
    };

    loadDisplayName();
  }, []);

  if (!isPreview) {
    useLobbyListener(roomCode, router, setPlayers);
    usePlayerDisconnectListener(roomCode, playerId, isHost);
    useRedirectIfNotPresent(roomCode, playerId, router);
    useStartGameListener(roomCode, playerId, checkHost, router);
  }

  const handleSaveDisplayName = async () => {
    const cleanName = displayName.trim();
    if (!cleanName) return;

    try {
      await AsyncStorage.setItem("displayName", cleanName);

      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        await pushUserName(userId, cleanName);
      }

      setDisplayName(cleanName);
      setShowPopup(false);
    } catch (e) {
      console.error("Failed to save display name:", e);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MovingDiagonalBackground />
      <View style={styles.container}>
        <Text style={styles.title} variant="headlineMedium">
          {isPreview ? "Lobby Preview" : `Join with Game PIN: ${roomCode}`}
        </Text>

        <LobbyPlayers
          players={players}
          isHost={checkHost}
          kickCall={(targetId) => {
            kick(roomCode, targetId);
          }}
        />

        {checkHost && !isPreview ? (
          <AppButton
            disabled={!allReady}
            mode="contained"
            onPress={() => {
              startGame(roomCode);
              chooseImpostor(roomCode);
            }}
          >
            Start Game
          </AppButton>
        ) : !isPreview ? (
          <AppButton
            mode="contained"
            style={styles.button}
            onPress={() => {
              ready(roomCode, playerId, isReady);
            }}
          >
            {isReady ? "Unready" : "Ready Up"}
          </AppButton>
        ) : null}

        <AppButton
          mode="outlined"
          onPress={() => {
            if (isPreview) {
              router.replace("/");
              return;
            }
            leave(checkHost, roomCode, playerId, router);
          }}
        >
          {isPreview ? "Return" : checkHost ? "Close Lobby" : "Leave Lobby"}
        </AppButton>
      </View>

      <Modal visible={showPopup} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "85%",
              backgroundColor: "#fff",
              padding: 16,
              borderRadius: 12,
            }}
          >
            <Text>Enter display name</Text>
            <TextInput value={displayName} onChangeText={setDisplayName} />
            <Button mode="contained" onPress={handleSaveDisplayName}>
              Save
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}