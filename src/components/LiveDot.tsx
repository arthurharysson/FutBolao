import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

const LiveDot = () => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          opacity,
        },
      ]}
      className="w-3 h-3 bg-[#FF004D] rounded-full mr-2"
    />
  );
};

export default LiveDot;
