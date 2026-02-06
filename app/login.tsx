import {StyleSheet, View} from "react-native";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Landing } from "../app/Landing";

export default function Login(){
  const CLIENT_ID = "307234319579-o4anf7f1hbridc8vh4vtdcehmauhjv7o.apps.googleusercontent.com"
    return(
      <GoogleOAuthProvider clientId={CLIENT_ID}>
        <Landing/>
      </GoogleOAuthProvider>
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