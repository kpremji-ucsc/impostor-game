import { View, StyleSheet, FlatList } from "react-native";
import { Text, Button } from "react-native-paper";


// kick function is defined in lobbyCalls.js to keep the design purely UI, not having to touch DB 
export default function LobbyPlayers({ players, isHost, kickCall}) {
  return (
    <FlatList
      data={players}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.name}>
            {item.name} {item.isHost && " (Host)"} {item.isReady && "READY"}
          </Text>

          {isHost && !item.isHost && (
            <Button
              mode="outlined"
              compact
              textColor="red"
              onPress ={() => kickCall(item.id)}
            >
              Kick
            </Button>
          )}
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
