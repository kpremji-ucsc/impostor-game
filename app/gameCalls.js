import { useEffect } from "react";
import { ref, onValue } from "firebase/database"
import { db } from "../firebaseConfig";

export const useChatListener = (roomCode, setMessages) => {
    useEffect(() => {
        if (!roomCode) return;

        const chatRef = ref(db, `rooms/${roomCode}/chatLog`)
        const killListener = onValue(chatRef, (snapshot) => {
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