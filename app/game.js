import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Platform, View } from 'react-native';
import { AppButton } from "./components/appButton.js";
import { chatStyles, styles } from "../styles/Styles.js";
import { ChatWindow } from "./components/chatWindow.js";
import { usePlayerDisconnectListener, leave, useRedirectIfNotPresent } from "./lobbyCalls.js";
import { useChatListener, useDisconnectChatAlerter } from "./gameCalls.js";
import { ChatInput } from "./components/chatInput.js";
import { KeyboardAvoidingView } from "react-native";
import { MovingDiagonalBackground } from "./components/movingBackground.js";

export default function GameScreen() {
    const router = useRouter();
    const { roomCode, playerId, isHost } = useLocalSearchParams();

    const [messages, setMessages] = useState([]);

    const checkHost = (isHost === 'true');

    const username = localStorage.getItem("displayName");

    usePlayerDisconnectListener(roomCode, playerId, isHost);
    useRedirectIfNotPresent(roomCode, playerId, router);
    useChatListener(roomCode, setMessages);
    if (!checkHost) {useDisconnectChatAlerter(roomCode, username)}

    return(
        <View style= {{ flex: 1 }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <MovingDiagonalBackground backgroundColor="#777"/>
                <View style = {chatStyles.chatArea}>
                    <ChatWindow 
                        messages={messages}
                        playerName={username}
                    />
                    <ChatInput
                        roomCode={roomCode}
                        playerName={username}
                    />
                </View>

                <AppButton 
                    mode="outlined"
                    onPress={() => leave(checkHost, roomCode, playerId, router, username)}
                > 
                    {checkHost ? 'Close Lobby' : 'Leave Lobby'}
                </AppButton>
            </KeyboardAvoidingView> 
        </View> 
    );
}