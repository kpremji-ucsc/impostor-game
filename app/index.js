import { useEffect, useState } from 'react';
import { View, Image } from 'react-native';
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { useFonts} from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { styles } from '../styles/Styles.js';
import { AppButton } from './components/appButton.js';
import { DisplayNameModal } from './components/displayNamePopUp.js';
import { pushUserName } from '../dbActions.js';

import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk'
import { SpecialElite_400Regular } from '@expo-google-fonts/special-elite'
import { MovingDiagonalBackground } from './components/movingBackground.js';
import { UsernameDisplay } from './components/usernameDisplay.js';

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();
  const [userId, setUserId] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("userId") : null
  );
  const [displayName, setDisplayName] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("displayName") || "" : ""
  );
  const [showNameModal, setShowNameModal] = useState(false);
  const [fontsLoaded, err] = useFonts({
    'SpaceGrotesk': SpaceGrotesk_700Bold,
    'SpecialElite': SpecialElite_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || err) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, err]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setUserId(localStorage.getItem("userId"));
    setDisplayName(localStorage.getItem("displayName") || "");
  }, []);

  if (!fontsLoaded && !err) return null;

  const handleLogout = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("userId");
    localStorage.removeItem("displayName");
    setUserId(null);
    setDisplayName("");
    setShowNameModal(false);
  };

  const handleSaveName = async () => {
    const nextName = displayName.trim();
    if (!nextName || !userId || typeof window === "undefined") return;

    localStorage.setItem("displayName", nextName);
    await pushUserName(userId, nextName);
    setDisplayName(nextName);
    setShowNameModal(false);
  };


  return (
    <View style={{ flex: 1 }}>
      <MovingDiagonalBackground/>
      <UsernameDisplay username={displayName} />
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

        <Text
          style={styles.caption}
        >
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
