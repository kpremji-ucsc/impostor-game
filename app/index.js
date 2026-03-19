import { useEffect, useState } from 'react';
import { View, Image } from 'react-native';
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from "@react-native-async-storage/async-storage";

import { styles } from '../styles/Styles.js';
import { AppButton } from './components/appButton.js';
import { DisplayNameModal } from './components/displayNamePopUp.js';
import { pushUserName } from '../dbActions.js';

import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { SpecialElite_400Regular } from '@expo-google-fonts/special-elite';
import { MovingDiagonalBackground } from './components/movingBackground.js';

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();

  const [userId, setUserId] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);

  const [fontsLoaded, err] = useFonts({
    SpaceGrotesk: SpaceGrotesk_700Bold,
    SpecialElite: SpecialElite_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || err) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, err]);

  useEffect(() => {
    const loadStoredUserData = async () => {
      try {
        const savedUserId = await AsyncStorage.getItem("userId");
        const savedDisplayName = await AsyncStorage.getItem("displayName");

        setUserId(savedUserId);
        setDisplayName(savedDisplayName || "");
      } catch (e) {
        console.error("Failed to load stored user data:", e);
      }
    };

    loadStoredUserData();
  }, []);

  if (!fontsLoaded && !err) return null;

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("displayName");

      setUserId(null);
      setDisplayName("");
      setShowNameModal(false);
    } catch (e) {
      console.error("Failed to log out:", e);
    }
  };

  const handleSaveName = async () => {
    const nextName = displayName.trim();
    if (!nextName || !userId) return;

    try {
      await AsyncStorage.setItem("displayName", nextName);
      await pushUserName(userId, nextName);
      setDisplayName(nextName);
      setShowNameModal(false);
    } catch (e) {
      console.error("Failed to save display name:", e);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MovingDiagonalBackground />
      <View style={styles.container}>
        <Image
          source={require('../assets/impostorGameLogo.png')}
          style={styles.logo}
        />

        <Text
          style={styles.title}
          variant="headlineMedium"
        >
          Impostor Game
        </Text>

        <Text style={styles.caption}>
          A social deduction game.
        </Text>

        {userId === null ? (
          <>
            <AppButton
              mode="contained"
              onPress={() => router.push("/login")}
            >
              Login
            </AppButton>

            <AppButton
              mode="contained"
              onPress={() => router.push("/join")}
            >
              Guest
            </AppButton>
          </>
        ) : (
          <>
            <AppButton
              mode="contained"
              onPress={() => router.push("/create")}
            >
              Create Lobby
            </AppButton>

            <AppButton
              mode="contained"
              onPress={() => router.push("/createWordbank")}
            >
              Create Wordbank
            </AppButton>

            <AppButton
              mode="outlined"
              onPress={() => setShowNameModal(true)}
            >
              Change Name
            </AppButton>

            <AppButton
              mode="outlined"
              onPress={handleLogout}
            >
              Logout
            </AppButton>
          </>
        )}
      </View>

      <DisplayNameModal
        visible={showNameModal}
        displayName={displayName}
        setDisplayName={setDisplayName}
        onSave={handleSaveName}
      />
    </View>
  );
}