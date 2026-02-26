import { StyleSheet, Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const styles = StyleSheet.create({
  row: {
    flex: 1,
    width: screenWidth * 0.85,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  name: {
    fontSize: screenHeight * 0.022,
    width: '80%',
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    borderRadius: 5,
    width: '45%',
  },
  title: {
    marginBottom: 20, 
    fontSize: 30, 
    fontWeight: 600,
  },
  caption:{
    fontSize: 15,
    color: '#777',
    marginBottom: 100,
  },
  logo:{
    width: 100,
    height: 100,
  }
});

export const chatStyles = StyleSheet.create({
  chatArea: {
    flex: 1,
  },
    chatBoxContainer: {
    width: screenWidth * 0.8,
    overflow: 'hidden',
    flex: 1,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    margin:10,
    backgroundColor: '#f9f9f9',
  },
  chatListContent:{
    padding: 15,
  },
  chatRow: {
    marginVertical: 5,
    flexDirection: 'row',
  },
  myRow: {
    justifyContent: 'flex-end',
  },
  theirRow:{
    justifyContent: 'flex-start',
  },
  bubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,

    borderRadius: 18,
    maxWidth: '80%',

    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5},
    shadowOpacity: 0.3,
    shadowRadius: 1,
  },

  myBubble: {
    backgroundColor: '#B9FF66',
    borderBottomRightRadius: 2,
  },
  theirBubble: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 2,
  },
  senderName: {
    fontSize: screenHeight * 0.022,
    fontWeight: '450',
    marginBottom: 2,
    color: '#555',
  },
  messageText: {
    fontSize: screenHeight * 0.022,
    fontWeight: '300',
    marginBottom: 2,
    color: '#000'
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: screenWidth * 0.8,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 20,
  },
  textInputStyle: {
    flex: 1,
    marginRight: 8,
  },
  iconStyle:{
    padding: '100',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
  },
})

