import {StyleSheet, View} from "react-native";
import { useState } from "react";
import { Button, Text, TextInput} from "react-native-paper";
import { useRouter } from "expo-router";


export default function Login(){
// https://www.youtube.com/watch?v=V2YdhR1hVNw guide im following- Nathan Skinner
// https://developers.google.com/identity/sign-in/web/sign-in

function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
}
    return(
      
        <View style={styles.container}>
          
            <>
      <script
        src="https://apis.google.com/js/platform.js"
        async
        defer
      ></script>

      <meta
        name="google-signin-client_id"
        content="307234319579-XXXX.apps.googleusercontent.com"
      />

      <div
        className="g-signin2"
        data-onsuccess="onSignIn"
      ></div>
    </>
   
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