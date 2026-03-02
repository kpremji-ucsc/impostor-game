import { View, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { chatStyles } from '../../styles/Styles.js';

export const ChatWindow = ({ messages, playerName }) => {
  const sortedMessages = [...messages].sort((a, b) => b.timestamp - a.timestamp);

  const renderItem = ({ item }) => {
    const isMe = item.name === playerName;
    return (
      <View style={[
        chatStyles.chatRow, 
        isMe ? chatStyles.myRow : chatStyles.theirRow
      ]}>
        <View style={[
          chatStyles.bubble, 
          isMe ? chatStyles.myBubble : chatStyles.theirBubble
        ]}>
          <Text style={chatStyles.senderName}>
            {item.name}: 
            <Text style={chatStyles.messageText}> {item.text}</Text>
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={chatStyles.chatBoxContainer}>
      <FlatList
        data={sortedMessages}
        inverted
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={chatStyles.chatListContent}
        style={{ flex: 1 }}
      />
    </View>
  );
};