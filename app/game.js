import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { Platform, View, Text, KeyboardAvoidingView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { db } from "../firebaseConfig.js";
import { onValue, ref, get, runTransaction } from "firebase/database";
import { roomRef } from "../dbActions.js";

import { AppButton } from "./components/appButton.js";
import { chatStyles, styles } from "../styles/Styles.js";
import { ChatWindow } from "./components/chatWindow.js";
import {
  usePlayerDisconnectListener,
  leave,
  useRedirectIfNotPresent,
} from "./lobbyCalls.js";
import { useChatListener, useDisconnectChatAlerter } from "./gameCalls.js";
import { ChatInput } from "./components/chatInput.js";
import { MovingDiagonalBackground } from "./components/movingBackground.js";

export default function GameScreen() {
  const router = useRouter();
  const { roomCode, playerId, isHost } = useLocalSearchParams();

  const checkHost = isHost === "true";

  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState([]);
  const [lobby, setLobby] = useState(null);
  const [isImpostor, setIsImpostor] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null);
  const [currentWord, setCurrentWord] = useState(null);
  const [availablePacks, setAvailablePacks] = useState([]);
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  useEffect(() => {
    const loadUsername = async () => {
      try {
        const savedName = await AsyncStorage.getItem("displayName");
        setUsername(savedName || "");
      } catch (e) {
        console.error("Failed to load username:", e);
      }
    };

    loadUsername();
  }, []);

  usePlayerDisconnectListener(roomCode, playerId, isHost);
  useRedirectIfNotPresent(roomCode, playerId, router);
  useChatListener(roomCode, setMessages);

  if (!checkHost) {
    useDisconnectChatAlerter(roomCode, username);
  }

  useEffect(() => {
    const unsub = onValue(roomRef(roomCode), (snap) => {
      const data = snap.val();
      setLobby(data);

      setSelectedPack(data?.selectedPack ?? null);
      setCurrentWord(data?.currentWord ?? null);

      const mine = data?.players?.[playerId];
      if (mine && typeof mine.isImpostor === "boolean") {
        setIsImpostor(mine.isImpostor);
      } else {
        setIsImpostor(null);
      }
    });

    return () => unsub();
  }, [roomCode, playerId]);

  useEffect(() => {
    const banksRef = ref(db, "wordBanks");
    const unsub = onValue(banksRef, (snap) => {
      const value = snap.val();

      if (!value) {
        setAvailablePacks([]);
        return;
      }

      const packs = Object.entries(value).map(([id, pack]) => ({
        id,
        theme: pack?.theme || id,
      }));

      setAvailablePacks(packs);
    });

    return () => unsub();
  }, []);

  const choosePack = async (packId) => {
    if (!checkHost) return;

    try {
      const snapshot = await get(ref(db, `wordBanks/${packId}/words`));
      if (!snapshot.exists()) {
        console.log("No word bank found at:", `wordBanks/${packId}/words`);
        return;
      }

      const wordsRaw = snapshot.val();
      const words = Array.isArray(wordsRaw)
        ? wordsRaw.filter(Boolean)
        : Object.values(wordsRaw).filter(Boolean);

      if (words.length === 0) return;

      const randomWord = words[Math.floor(Math.random() * words.length)];

      await runTransaction(roomRef(roomCode), (room) => {
        if (room === null) return room;

        room.selectedPack = packId;
        room.currentWord = randomWord;

        const currentPlayers = room.players ? Object.keys(room.players) : [];

        currentPlayers.forEach((id) => {
          room.players[id].isImpostor = false;
        });

        const numImposters = Number(room.numImposters) || 1;
        const shuffled = [...currentPlayers].sort(() => Math.random() - 0.5);
        const impostors = shuffled.slice(
          0,
          Math.min(numImposters, currentPlayers.length)
        );

        impostors.forEach((id) => {
          room.players[id].isImpostor = true;
        });

        return room;
      });
    } catch (err) {
      console.log("Error choosing pack:", err);
    }
  };

  const selectedPackTheme =
    availablePacks.find((pack) => pack.id === selectedPack)?.theme ||
    selectedPack;

  const displayedWord =
    typeof isImpostor !== "boolean"
      ? "..."
      : isImpostor
      ? "IMPOSTOR"
      : currentWord ?? "No Word Yet";

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <MovingDiagonalBackground backgroundColor="#777" />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginVertical: 20,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              marginRight: 50,
              minWidth: 220,
              textAlign: "center",
            }}
          >
            {displayedWord}
          </Text>

          {checkHost && (
            <View style={{ width: 260, alignItems: "stretch" }}>
              {availablePacks.map((pack) => (
                <View key={pack.id} style={{ marginBottom: 10, width: "100%" }}>
                  <AppButton onPress={() => choosePack(pack.id)}>
                    {pack.theme}
                  </AppButton>
                </View>
              ))}

              <Text style={{ marginTop: 8, textAlign: "center" }}>
                {selectedPack
                  ? `Selected: ${selectedPackTheme}`
                  : "No pack selected"}
              </Text>
            </View>
          )}
        </View>

        <AppButton mode="outlined" onPress={() => setIsChatMinimized((v) => !v)}>
          {isChatMinimized ? "Show Chat" : "Minimize Chat"}
        </AppButton>

        {!isChatMinimized && (
          <View style={chatStyles.chatArea}>
            <ChatWindow messages={messages} playerName={username} />
            <ChatInput roomCode={roomCode} playerName={username} />
          </View>
        )}

        <AppButton
          mode="outlined"
          onPress={() => leave(checkHost, roomCode, playerId, router, username)}
        >
          {checkHost ? "Close Lobby" : "Leave Lobby"}
        </AppButton>
      </KeyboardAvoidingView>
    </View>
  );
}