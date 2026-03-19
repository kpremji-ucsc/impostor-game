import { View, Modal, ScrollView } from 'react-native';
import { Text, TextInput, Button } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect  } from "react";
import { kick, leave, ready, useLobbyListener, startGame, usePlayerDisconnectListener, useStartGameListener, useRedirectIfNotPresent} from './lobbyCalls.js'
import { LobbyPlayers } from './components/lobbyPlayers.js';
import { styles } from '../styles/Styles.js';
import { chooseImpostor, pushUserName, setSelectedWordBank, startGameWithWordBank, getWordBanks } from '../dbActions.js';
import { DisplayNameModal } from './components/displayNamePopUp.js';
import { AppButton } from './components/appButton.js';
import { MovingDiagonalBackground } from './components/movingBackground.js';
import { db } from '../firebaseConfig.js';
import { onValue, ref } from 'firebase/database';
import { roomRef } from '../dbActions.js';

export default function Lobby() {
    const router = useRouter();
    const { roomCode, playerId, isHost, preview } = useLocalSearchParams();
    const isPreview = preview === "true";

    const [players, setPlayers]  = useState([]);
    const playerList = players ? Object.values(players) : [];

    const myPlayer = players.find(p => p.id === playerId);
    const isReady = myPlayer?.isReady ?? false;
    const allReady = 
      playerList.length >= 3 && 
      playerList.every((player) => player.isReady);

    const checkHost = (isHost === 'true');
    const [showPopup, setShowPopup] = useState(false);
    const [displayName, setDisplayName] = useState(() => {
      return typeof window !== 'undefined' ? localStorage.getItem("displayName") || "" : ""}
    );

    // Wordbank state
    const [availableWordBanks, setAvailableWordBanks] = useState({});
    const [selectedWordBank, setSelectedWordBankState] = useState(null);
    const [isStartingGame, setIsStartingGame] = useState(false);

    useEffect(() => {
  const savedName = localStorage.getItem("displayName")?.trim() ?? "";
  if (savedName) {
    setDisplayName(savedName);
    setShowPopup(false);
    return;
  }

  setShowPopup(true);
}, []);

    // Listen to available wordbanks
    useEffect(() => {
      const banksRef = ref(db, "wordBanks");
      const unsub = onValue(banksRef, (snap) => {
        const v = snap.val();
        setAvailableWordBanks(v || {});
      });
      return () => unsub();
    }, []);

    // Listen to selected wordbank in the room
    useEffect(() => {
      if (isPreview) return;
      const unsub = onValue(roomRef(roomCode), (snap) => {
        const data = snap.val();
        setSelectedWordBankState(data?.selectedPack ?? null);
      });
      return () => unsub();
    }, [roomCode, isPreview]);

    // Preview mode is for UI-only navigation from login without an active room.

    if (!isPreview) {
      // custom hooks must start with use as per react rules of hooks
      useLobbyListener(roomCode, router, setPlayers);
      usePlayerDisconnectListener(roomCode, playerId, isHost);
      useRedirectIfNotPresent(roomCode, playerId, router);
      useStartGameListener(roomCode, playerId, checkHost, router);
    }

    // Handle wordbank selection
    const handleSelectWordBank = async (wordBankId) => {
      if (!checkHost || isPreview) return;
      try {
        await setSelectedWordBank(roomCode, wordBankId);
      } catch (e) {
        console.error("Failed to select wordbank:", e);
      }
    };

    // Handle start game with wordbank
    const handleStartGame = async () => {
      if (!checkHost || isPreview || isStartingGame) return;

      if (!selectedWordBank) {
        alert("Please select a wordbank before starting the game!");
        return;
      }

      setIsStartingGame(true);
      try {
        await startGameWithWordBank(roomCode);
      } catch (e) {
        console.error("Failed to start game:", e);
        alert("Failed to start game: " + e.message);
        setIsStartingGame(false);
      }
    };

    return (
    <View style={{ flex: 1 }}>
      <MovingDiagonalBackground/>
      <View style={styles.container}>
          <Text style={styles.title} variant="headlineMedium">
            {isPreview ? "Lobby Preview" : `Join with Game PIN: ${roomCode}`}
          </Text>
          <LobbyPlayers
            players={players}
            isHost={checkHost}
            kickCall={ (targetId) => { kick(roomCode, targetId)}}
          />

          {/* Wordbank Selection (Host Only) */}
          {checkHost && !isPreview && (
            <View style={{ width: '85%', marginVertical: 10 }}>
              <Text style={{ fontFamily: 'SpecialElite', fontSize: 16, marginBottom: 8, textAlign: 'center' }}>
                Select Wordbank:
              </Text>
              <ScrollView
                style={{ maxHeight: 150 }}
                contentContainerStyle={{ gap: 8 }}
              >
                {Object.entries(availableWordBanks).map(([id, bank]) => (
                  <AppButton
                    key={id}
                    mode={selectedWordBank === id ? "contained" : "outlined"}
                    onPress={() => handleSelectWordBank(id)}
                    style={{ marginBottom: 8 }}
                  >
                    {bank.theme || id}
                  </AppButton>
                ))}
                {Object.keys(availableWordBanks).length === 0 && (
                  <Text style={{ fontFamily: 'SpecialElite', textAlign: 'center', color: '#777' }}>
                    No wordbanks available. Create one first!
                  </Text>
                )}
              </ScrollView>
              {selectedWordBank && (
                <Text style={{ fontFamily: 'SpaceGrotesk', marginTop: 8, textAlign: 'center', color: '#4F7942' }}>
                  Selected: {availableWordBanks[selectedWordBank]?.theme || selectedWordBank}
                </Text>
              )}
            </View>
          )}

          {checkHost && !isPreview ? (
            <AppButton
              disabled={!allReady || !selectedWordBank || isStartingGame}
              mode="contained"
              onPress={handleStartGame}
            >
              {isStartingGame ? "Starting..." : "Start Game"}
            </AppButton>
            ) : !isPreview ? (
            <AppButton
              mode="contained"
              style={styles.button}
              onPress={() => {ready(roomCode, playerId, isReady)}}
            >
              {isReady ? "Unready" : "Ready Up"}
            </AppButton> ) : null
          }

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
              {isPreview ? "Return" : checkHost ? 'Close Lobby' : 'Leave Lobby'}
            </AppButton>
          </View>
     <Modal visible={showPopup} transparent animationType="fade">

  <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}>
    <View style={{ width: "85%", backgroundColor: "#fff", padding: 16, borderRadius: 12 }}>
      <Text>Enter display name</Text>
      <TextInput value={displayName} onChangeText={setDisplayName} />
      <Button
        mode="contained"
        onPress={() => {
          if (!displayName.trim()) return;
          localStorage.setItem("displayName", displayName.trim());
          if(localStorage.getItem("userId")!= null ) {
              pushUserName (localStorage.getItem("userId"), displayName.trim())
          }
          setShowPopup(false);
        }}
      >
        Save
      </Button>
    </View>
  </View>
</Modal>
    </View>

    );
}
