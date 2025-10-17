// ToastMessage.tsx
import React from 'react';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

export default function ToastMessage() {
  return (
    <Toast
      config={{
        success: (props) => (
          <BaseToast
            {...props}
            style={{ borderLeftColor: '#4CAF50' }}
            text1Style={{ fontSize: 16, fontWeight: '600', fontFamily: 'CustomFont' }}
            text2Style={{ fontSize: 14, fontFamily: 'CustomFont' }}
          />
        ),
        error: (props) => (
          <ErrorToast
            {...props}
            style={{ borderLeftColor: '#f44336' }}
            text1Style={{ fontSize: 16, fontWeight: '600',  fontFamily: 'CustomFont' }}
            text2Style={{ fontSize: 14, fontFamily: 'CustomFont' }}
          />
        ),
      }}
    />
  );
}
