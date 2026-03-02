import { useEffect } from "react";
import { onValue, onDisconnect, push, serverTimestamp} from "firebase/database"
import { chatRef } from "../dbActions";

export const useChatListener = (roomCode, setMessages) => {
    useEffect(() => {
        if (!roomCode) return;

        const chatLogRef = chatRef(roomCode);
        const killListener = onValue(chatLogRef, (snapshot) => {
            const chatSnapshot = snapshot.val();
            if (!chatSnapshot || typeof chatSnapshot !== "object") return;

            const messages = Object.entries(chatSnapshot).map(([id, messageData]) => ({
                id,
                ...messageData,
            }));
            setMessages(messages);
        });

        return() => killListener();
    }, [roomCode, setMessages]);
}

export function useDisconnectChatAlerter(roomCode, username) {
  useEffect(() => {
    if (!roomCode) return;

    const chatLogRef = chatRef(roomCode)
    const sendDisconnectMessage = push(chatLogRef);
    const disconnectTask = onDisconnect(sendDisconnectMessage);

    disconnectTask.set({
      name: "System",
      text: `${username} has disconnected mid-game.`,
      timestamp: serverTimestamp(),
    }).catch((e) => {
        console.error('couldnt arm task', e);
    });

    return () => {
      disconnectTask.cancel();
    };
  }, [roomCode, username]); 
}