import { View, Text } from 'react-native';

export const UsernameDisplay = ({ username }) => {
  if (!username) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        zIndex: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <Text
        style={{
          fontFamily: 'SpaceGrotesk',
          fontSize: 14,
          color: '#333',
          fontWeight: '600',
        }}
      >
        {username}
      </Text>
    </View>
  );
};

