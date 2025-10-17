// components/CustomText.tsx
import React from 'react';
import { Text, TextProps, StyleProp, TextStyle } from 'react-native';

interface Props extends TextProps {
  style?: StyleProp<TextStyle>;
}

export default function CustomText({ style, ...props }: Props) {
  return <Text {...props} style={[{ fontFamily: 'CustomFont' }, style]} />;
}
