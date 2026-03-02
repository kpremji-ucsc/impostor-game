import { Dimensions, Animated, ImageBackground, View, Easing } from "react-native";
import { useEffect, useRef } from "react";
import { styles } from "../../styles/Styles";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const MovingDiagonalBackground = ({
  backgroundColor = '#fff',
  imageTint = '#555'
}) => {
  const moveBackground = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    const animationLoop = () => {
        moveBackground.setValue(0);
        Animated.timing(moveBackground, {
            toValue: 1,
            duration: 10000,
            easing: Easing.linear,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) {
                animationLoop();
            }
        })
    }

    animationLoop();
  }, [moveBackground]);

  const translateX = moveBackground.interpolate({
    inputRange: [0, 2],
    outputRange: [0, -screenWidth],
  });

  const translateY = moveBackground.interpolate({
    inputRange: [0, 2],
    outputRange: [0, -screenHeight],
  });

  return (
    <View style={[styles.bg, { backgroundColor }]}>
      <Animated.View
        style={[
          styles.bgWrapper, 
          {
            transform: [{translateX: translateX}, {translateY: translateY}],
          },
        ]}
      >
        <View style={styles.bgRow}>
          <ImageBackground 
            source={require('../../assets/impostorGameBackground.png')} 
            style={styles.bgImage} 
            imageStyle={{ tintColor: imageTint}}
          />
          <ImageBackground 
            source={require('../../assets/impostorGameBackground.png')} 
            imageStyle={{ tintColor: imageTint}}
            style={styles.bgImage} 
          />
        </View>
        <View style={styles.bgRow}>
          <ImageBackground 
            source={require('../../assets/impostorGameBackground.png')} 
            style={styles.bgImage}
            imageStyle={{ tintColor: imageTint}}
          />
          <ImageBackground 
            source={require('../../assets/impostorGameBackground.png')} 
            style={styles.bgImage}
            imageStyle={{ tintColor: imageTint}} 
          />
        </View>
        <View style={styles.bgRow}>
          <ImageBackground 
            source={require('../../assets/impostorGameBackground.png')} 
            style={styles.bgImage}
            imageStyle={{ tintColor: imageTint}}
          />
          <ImageBackground 
            source={require('../../assets/impostorGameBackground.png')} 
            style={styles.bgImage}
            imageStyle={{ tintColor: imageTint}} 
          />
        <ImageBackground 
            source={require('../../assets/impostorGameBackground.png')} 
            style={styles.bgImage}
            imageStyle={{ tintColor: imageTint}} 
          />
        </View>
        <View>
        <ImageBackground 
            source={require('../../assets/impostorGameBackground.png')} 
            style={styles.bgImage}
            imageStyle={{ tintColor: imageTint}} 
          />
        </View>
      </Animated.View>
    </View>
  )
}