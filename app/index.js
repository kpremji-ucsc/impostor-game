import { View } from 'react-native';
import { Button, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { styles } from '../styles/Styles.js';

export default function Index() {
  const router = useRouter();


  return (
    <View style={styles.container}>
      <Text 
        style={styles.title} 
        variant="headlineMedium"
        > 
        Imposter Game 
      </Text>

      <Button 
        mode="contained"
        style={styles.button} 
        onPress={() => router.push("/login")}
        >
        Login
      </Button>

      <Button 
        mode="contained" 
        style={styles.button} 
        onPress={() => router.push("/join")}
        >
        Guest
      </Button>

      <Button 
        mode="contained" 
        style={styles.button} 
        onPress={() => router.push("/create")}
        >
        Test Lobby
      </Button>

    </View>
  );
}
