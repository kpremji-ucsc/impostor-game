import React, {useState} from 'react';
import {View, Button, TextInput, Text} from 'react-native';
import { CreateRoom, JoinRoom } from "../lobbyActions.js";

export default function testLobby() {
    const [codeEntry, setCodeEntry] = useState("");
    const create = async () => {
        try {
            const username = "Player" + Math.random().toString(20).substring(2,6).toUpperCase();
            const room = await CreateRoom(username);
            alert(`Done! Room code is:  ${room.roomCode}`)
        } catch (error) {alert("Error, chcek console");}
    };

    const join = async() => {
        const username = "Player" + Math.random().toString(20).substring(2,6).toUpperCase();
        await JoinRoom( codeEntry.toUpperCase(), username);
    };

    return(
        <View>
            <Button title="Create Lobby" onPress = {create}/>
            <Text> Enter Room Code:</Text>
            <TextInput onChangeText={setCodeEntry}
                        value={codeEntry}
                        placeholder= "CODE"
                        autoCapitalize="characters"
                        />
            <Button title="Join Game" onPress={join} color="green"/>
        </View>
    )
}