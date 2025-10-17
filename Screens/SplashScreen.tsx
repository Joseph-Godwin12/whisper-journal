import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image } from 'react-native';
import CustomText from '../components/CustomText';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const glowScale = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // 🌀 Fade in and move up
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // ✨ Pulse glow forever
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowScale, {
          toValue: 1.2,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 💫 Subtle breathing fade on text
    Animated.loop(
      Animated.sequence([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 0.8,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // ⏳ Move to next screen
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity, transform: [{ translateY }] }]}>
        {/* 🪄 Icon with glowing aura */}
        <Animated.View
          style={[
            styles.glow,
            { transform: [{ scale: glowScale }] },
          ]}
        />
        <Image
          source={require('../assets/icon.png')}
          style={styles.icon}
          resizeMode="contain"
        />

        {/* App Name */}
        <Animated.Text style={[styles.title, { opacity: textOpacity }]}>
          Whisper Journal
        </Animated.Text>

        {/* Tagline */}
        <CustomText style={styles.subtitle}>Where your thoughts find a voice</CustomText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b3b0b0ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    width: 120,
    height: 120,
    zIndex: 2,
  },
  glow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#313d49ff',
    shadowColor: '#526374ff',
    shadowOpacity: 0.9,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    fontFamily: 'CustomFont',
    color: '#fff',
    marginTop: 25,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    color: '#fff',
  },
});
