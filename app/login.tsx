import {StyleSheet, View, ActivityIndicator} from "react-native";
import { useAuth } from "../context/auth";
import SignInWithGoogleButton from "../components/SignInWithGoogleButton";

export default function Login(){
// https://www.youtube.com/watch?v=V2YdhR1hVNw guide im following- Nathan Skinner
// https://developers.google.com/identity/sign-in/web/sign-in
  const { signIn, isLoading } = useAuth();
    return(
   
          <View>
            <SignInWithGoogleButton onPress={signIn} disabled={isLoading} />
          </View>
    )
}

