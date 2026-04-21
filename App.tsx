
import { ToastProvider } from 'react-native-toast-notifications';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { AdProvider } from './src/contexts/AdContext';

export default function App() {
  return (
    <AdProvider>
      <ToastProvider>
        <SafeAreaProvider>
          <StatusBar barStyle={'light-content'}/>
          <AppNavigator />
        </SafeAreaProvider>
      </ToastProvider>
    </AdProvider>
  );
}