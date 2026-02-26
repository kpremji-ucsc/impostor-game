import { IconButton, TextInput } from "react-native-paper";
import { View } from "react-native";
import { useState } from "react";
import { chatStyles } from "../../styles/Styles";
import { pushMessage } from "../../dbActions";

export const ChatInput = ({ roomCode, playerName}) => {
    const [text, setText] = useState('');

    const messageEmpty = !text.trim();

    const handleSend = async () => {
    if (messageEmpty) return;

    try{
        await pushMessage(roomCode, playerName, text);
        setText('');
    } catch (e) {
        throw e;
    }
}
    return(
        <View
            style={chatStyles.inputContainer}
        >
            <TextInput
                mode="outlined"
                placeholder="Start typing... "
                value={text}
                style={chatStyles.textInputStyle}
                onChangeText={setText}
                onSubmitEditing={handleSend}
            />
            <IconButton
                icon="send"
                style={chatStyles.iconStyle}
                size={40}
                onPress={handleSend}
                disabled={messageEmpty}
            />
        </View>
    )
}