import { View, StyleSheet, FlatList } from "react-native";
import { Text, Button } from "react-native-paper";


// kick function is defined in lobby.js to keep the design of this component purely UI, not having to touch DB 
export default function LobbyPlayers({ players, isHost, kick}) {
  return (
    <FlatList
      data={players}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.name}>
            {item.name} {item.isHost && " (Host)"} {item.isReady && "READY"}
            {isHost && !item.isHost && (
              <Button
                mode="outlined"
                compact
                textColor="red"
                onPress ={() => kick(item.id)}
              >
                Kick
              </Button>
            )}
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
