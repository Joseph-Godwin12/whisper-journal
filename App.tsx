//import {View, Text} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { JournalProvider } from './context/JournalContext';

export default function App() {
  return (
  //   <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
  //       <Text>Whisper Journal</Text>
  //   </View>
  // )
    <JournalProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </JournalProvider>
 );
}
