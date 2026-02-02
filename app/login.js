import {StyleSheet, View} from "react-native";
import { useState } from "react";
import { Button, Text, TextInput} from "react-native-paper";
import { useRouter } from "expo-router";

// documentation https://oss.callstack.com/react-native-paper/docs/components/TextInput

export default function Login(){
    const router = useRouter();
    const [passwordHidden, setPasswordHidden] = useState(true);
    const canGoBack = router.canGoBack?.() ?? true; // stack populated?

    // later implement submitLogin() func probably below for validation/authentication
    return(
        <View style={styles.container}>
                  <Text style={{marginBottom: 20, fontSize: 25, fontWeight: 600}} variant="headlineSmall"> 
                    Login 
                    </Text>

                  <TextInput
                    label="Username"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.input}
                    mode="outlined"
                  />

                  {/* password hider logic. if hidden, blink, and on tap it change the bool*/}
                  <TextInput
                    label="Password"
                    secureTextEntry={passwordHidden}
                    style={styles.input}
                    mode="outlined"
                    right={
                    <TextInput.Icon icon={passwordHidden ? "eye" : "off"}
                    onPress={() => setPasswordHidden((x) => !x)}
                    />
                    }
                  />

                  <Button mode="contained"
                  style={styles.button}
                  >
                    Login
                  </Button>
                  {canGoBack && 
                  <Button mode="text" onPress={() => router.back()}>
                    Return
                  </Button>}
        </View>
    )
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
  input: {width: "75%", marginBottom: 20},
  button: {borderRadius: 5}
});