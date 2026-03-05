import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { Platform, View, Text, KeyboardAvoidingView } from "react-native";

import { db } from "../firebaseConfig.js";
import { onValue, ref, set, get, runTransaction } from "firebase/database";
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
  const username = localStorage.getItem("displayName");

  const [messages, setMessages] = useState([]);

  const [lobby, setLobby] = useState(null);
  const [isImpostor, setIsImpostor] = useState(null); // null until known

  const [selectedPack, setSelectedPack] = useState(null);
  const [currentWord, setCurrentWord] = useState(null);
  const [availablePacks, setAvailablePacks] = useState([]);

  const [isChatMinimized, setIsChatMinimized] = useState(false);

  /* -------------------------
     EXISTING LISTENERS (UNCHANGED)
  -------------------------- */
  usePlayerDisconnectListener(roomCode, playerId, isHost);
  useRedirectIfNotPresent(roomCode, playerId, router);
  useChatListener(roomCode, setMessages);
  if (!checkHost) useDisconnectChatAlerter(roomCode, username);

  /* -------------------------
     LISTEN: LOBBY (single source of truth)
     roomRef(roomCode) = rooms/${roomCode}/lobby
     Pull: selectedPack, currentWord, my isImpostor from SAME snapshot
  -------------------------- */
  useEffect(() => {
    const unsub = onValue(roomRef(roomCode), (snap) => {
      const data = snap.val();
      setLobby(data);

      setSelectedPack(data?.selectedPack ?? null);
      setCurrentWord(data?.currentWord ?? null);

      const mine = data?.players?.[playerId];
      // if player node exists, treat impostor as known boolean; else unknown (null)
      if (mine && typeof mine.isImpostor === "boolean") {
        setIsImpostor(mine.isImpostor);
      } else {
        setIsImpostor(null);
      }
    });

    return () => unsub();
  }, [roomCode, playerId]);

  /* -------------------------
     LISTEN: WORD BANKS (for dynamic buttons)
     wordBanks/<id> contains { theme, words: [...] }
  -------------------------- */
  useEffect(() => {
    const banksRef = ref(db, "wordBanks");
    const unsub = onValue(banksRef, (snap) => {
      const v = snap.val();
      setAvailablePacks(v ? Object.keys(v) : []);
    });
    return () => unsub();
  }, []);

  /* -------------------------
     HOST: CHOOSE PACK -> ATOMICALLY SET pack + word + impostors
     This prevents impostors from briefly seeing the real word.
  -------------------------- */
  const choosePack = async (packId) => {
    if (!checkHost) return;

    try {
      // load words once
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

      // ✅ one transaction updates everything together
      await runTransaction(roomRef(roomCode), (room) => {
        if (room === null) return room;

        // set pack + word
        room.selectedPack = packId;
        room.currentWord = randomWord;

        // assign impostors
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

  // Don't reveal word until role known (prevents any flash during initial load)
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

        {/* WORD + PACK SECTION */}
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

          {/* PACK BUTTONS (HOST ONLY) */}
          {checkHost && (
            <View style={{ width: 260, alignItems: "stretch" }}>
              {availablePacks.map((packId) => (
                <View key={packId} style={{ marginBottom: 10, width: "100%" }}>
                  <AppButton onPress={() => choosePack(packId)}>
                    {packId}
                  </AppButton>
                </View>
              ))}

              <Text style={{ marginTop: 8, textAlign: "center" }}>
                {selectedPack ? `Selected: ${selectedPack}` : "No pack selected"}
              </Text>
            </View>
          )}
        </View>

        {/* CHAT TOGGLE BUTTON */}
        <AppButton mode="outlined" onPress={() => setIsChatMinimized((v) => !v)}>
          {isChatMinimized ? "Show Chat" : "Minimize Chat"}
        </AppButton>

        {/* CHAT AREA */}
        {!isChatMinimized && (
          <View style={chatStyles.chatArea}>
            <ChatWindow messages={messages} playerName={username} />
            <ChatInput roomCode={roomCode} playerName={username} />
          </View>
        )}

        {/* LEAVE BUTTON */}
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