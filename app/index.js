import { useEffect } from 'react';
import { View, Image } from 'react-native';
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { useFonts} from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { styles } from '../styles/Styles.js';
import { AppButton } from './components/appButton.js';

import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk'
import { SpecialElite_400Regular } from '@expo-google-fonts/special-elite'
import { MovingDiagonalBackground } from './components/movingBackground.js';

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();
  const [fontsLoaded, err] = useFonts({
    'SpaceGrotesk': SpaceGrotesk_700Bold,
    'SpecialElite': SpecialElite_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || err) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, err]);

  if (!fontsLoaded && !err) return null;

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;


  return (
    <View style={{ flex: 1 }}>
      <MovingDiagonalBackground/>
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
          <AppButton 
            mode="contained" 
            onPress={() => router.push("/create")}
          >
            Create Lobby
        </AppButton>
        )}

      

      </View>
    </View>
  );
}
