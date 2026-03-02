import { View, FlatList } from "react-native";
import { Text } from "react-native-paper";
import { AppButton } from "./appButton.js";
import { styles } from "../../styles/Styles.js";


// kick function is defined in lobbyCalls.js to keep the design purely UI, not having to touch DB 
export const LobbyPlayers = ({ players, isHost, kickCall}) => {
  return (
    <FlatList
      data={players}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.name}>
            {item.name} {item.isHost && "(Host)"}{"   "}
            {item.isReady && (
              <Text style={styles.ready}>
                READY
              </Text>
            )}
          </Text>

          {isHost && !item.isHost && (
            <AppButton
              mode="outlined"
              style={{width: '25%'}}
              compact
              onPress ={() => kickCall(item.id)}
            >
              <Text
                style={[{ fontFamily: 'SpaceGrotesk', color: 'red'}]}
              >
                  Kick
              </Text>
            </AppButton>
          )}
        </View>
      )}
    />
  );
}
