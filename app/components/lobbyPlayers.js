import { View, StyleSheet, FlatList } from "react-native";
import { Text, Avatar } from "react-native-paper";

export default function LobbyPlayers({ players }) {
  return (
    <FlatList
      data={players}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.name}>
            {item.name} {item.isHost && " (Host)"} {item.isReady && "READY"}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  name: {
    fontSize: 18,
  },
});
