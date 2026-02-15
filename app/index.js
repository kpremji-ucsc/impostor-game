import { StyleSheet, View } from 'react-native';
import { Button, Text } from "react-native-paper";
import { useRouter } from "expo-router";

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
        onPress={() => router.push("/login")}
        >
        Login
      </Button>

      <Button 
        mode="contained" 
        onPress={() => router.push("/join")}
        >
        Guest
      </Button>

      <Button 
        mode="contained" 
        onPress={() => router.push("/create")}
        >
        Test Lobby
      </Button>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {borderRadius: 5},
  title: {
    marginBottom: 20, 
    fontSize: 30, 
    fontWeight: 600
  },
});
