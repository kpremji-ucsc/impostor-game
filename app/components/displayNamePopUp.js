import { View, Modal } from 'react-native';
import { Text, TextInput } from "react-native-paper";
import { AppButton } from './appButton.js';
import { styles } from '../../styles/Styles.js';

export const DisplayNameModal = ({ visible, displayName, setDisplayName, onSave }) => {
         return (
         <Modal visible={visible} transparent animationType="fade">
        <View style= {styles.popUp}>
          <View style={{ width: "85%", backgroundColor: "#fff", padding: 16, borderRadius: 12 }}>
            <Text style={{ fontFamily: 'SpecialElite'}}>
              Display name not found! Please enter a display name:
            </Text>

            <TextInput
              mode="outlined"
              value={displayName} 
              onChangeText={setDisplayName} 
              style={{marginVertical: 10}}
              contentStyle={{ fontFamily: 'SpaceGrotesk' }}
            />
            
            <AppButton
              mode="contained"
              invalid={!displayName.trim()}
              onPress={onSave}
            >
              Save
            </AppButton>
          </View>
        </View>
      </Modal>
         )
}