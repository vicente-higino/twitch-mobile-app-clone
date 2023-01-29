import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing, View
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export const SpinnigCircle = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rotate = () => {
    Animated.loop(Animated.timing(rotateAnim, { toValue: 360, useNativeDriver: true, easing: Easing.linear, duration: 1000 })).start();
  };
  useEffect(() => {
    rotate();
  }, [rotateAnim]);

  return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#00000082", zIndex: 99999 }}>
    <Animated.View style={{
      transform: [{
        rotate: rotateAnim.interpolate({
          inputRange: [0, 360],
          outputRange: ['0deg', '360deg']
        })
      }]
    }}>
      <FontAwesomeIcon style={{ color: "white" }} size={40} icon={faSpinner} />
    </Animated.View>
  </View>;
};
