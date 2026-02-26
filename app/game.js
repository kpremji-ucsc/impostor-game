import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Platform, View } from 'react-native';
import { Button } from "react-native-paper";
import { chatStyles, styles } from "../styles/Styles.js";
import { ChatWindow } from "./components/chatWindow.js";
import { usePlayerPresenceListener, leave } from "./lobbyCalls.js";
import { useChatListener } from "./gameCalls.js";
import { ChatInput } from "./components/chatInput.js";
import { KeyboardAvoidingView } from "react-native";

export default function GameScreen() {
    const router = useRouter();
    const { roomCode, playerId, isHost } = useLocalSearchParams();

    const [messages, setMessages] = useState([]);

    const checkHost = (isHost === 'true');

    usePlayerPresenceListener(roomCode, playerId, isHost);
    useChatListener(roomCode, setMessages);

    return(
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style = {chatStyles.chatArea}>
                <ChatWindow 
                    messages={messages}
                    playerName={playerId}
                />
                 <ChatInput
                 roomCode={roomCode}
                 playerName={playerId}
                />
            </View>

            <Button 
            mode="outlined"
            onPress={() => leave(checkHost, roomCode, playerId, router)}
            style={styles.button}
             > 
                {checkHost ? 'Close Lobby' : 'Leave Lobby'}
            </Button> 
        </KeyboardAvoidingView>
    );
}