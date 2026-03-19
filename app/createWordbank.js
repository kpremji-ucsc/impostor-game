import { useState } from 'react';
import { View } from 'react-native';
import { Text, TextInput, Snackbar } from "react-native-paper";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { styles } from '../styles/Styles.js';
import { createWordBank } from '../dbActions.js';
import { AppButton } from './components/appButton.js';
import { MovingDiagonalBackground } from './components/movingBackground.js';

export default function CreateWordbank() {
  const router = useRouter();
  const [theme, setTheme] = useState("");
  const [wordInput, setWordInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);

  const parsedWords = wordInput
    .split(",")
    .map((word) => word.trim())
    .filter(Boolean);

  const hasComma = wordInput.includes(",");
  const isInvalid = !theme.trim() || parsedWords.length === 0 || !hasComma;

  const handleSave = async () => {
    if (isInvalid || isSaving) return;

    try {
      const ownerId = await AsyncStorage.getItem("userId");
      const ownerName = (await AsyncStorage.getItem("displayName")) || "";

      if (!ownerId) {
        throw new Error("You must be logged in to create a word bank.");
      }

      setIsSaving(true);
      await createWordBank(theme, parsedWords, ownerId, ownerName);

      setTheme("");
      setWordInput("");
      setSnackMessage("Word bank created.");
      setShowSnackbar(true);
    } catch (e) {
      console.error("Could not create word bank:", e);
      setSnackMessage("Could not create word bank.");
      setShowSnackbar(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MovingDiagonalBackground />
      <View style={styles.container}>
        <Text style={styles.title} variant="headlineMedium">
          Create Wordbank
        </Text>

        <TextInput
          label={<Text style={{ fontFamily: 'SpecialElite' }}>Theme</Text>}
          value={theme}
          onChangeText={setTheme}
          style={{ width: "85%", marginBottom: 20 }}
          mode="outlined"
          placeholder="Example: Animals"
          contentStyle={{ fontFamily: 'SpaceGrotesk' }}
        />

        <TextInput
          label={<Text style={{ fontFamily: 'SpecialElite' }}>Words</Text>}
          value={wordInput}
          onChangeText={setWordInput}
          style={{ width: "85%", marginBottom: 10 }}
          mode="outlined"
          placeholder="dog, cat, lion, tiger"
          contentStyle={{ fontFamily: 'SpaceGrotesk' }}
          multiline
        />

        <Text style={[styles.caption, { width: "85%", marginBottom: 20 }]}>
          Separate each word with a comma. Example: dog, cat, lion
        </Text>

        <AppButton
          disabled={isInvalid || isSaving}
          mode="contained"
          onPress={handleSave}
        >
          {isSaving ? "Saving..." : "Save Wordbank"}
        </AppButton>

        <AppButton
          mode="contained"
          onPress={() => router.replace("/")}
        >
          Return
        </AppButton>

        <Snackbar
          visible={showSnackbar}
          onDismiss={() => setShowSnackbar(false)}
          duration={3000}
          action={{
            icon: "close",
            onPress: () => setShowSnackbar(false),
          }}
        >
          {snackMessage}
        </Snackbar>
      </View>
    </View>
  );
}