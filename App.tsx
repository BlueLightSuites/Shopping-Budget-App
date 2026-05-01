
import { ToastProvider } from 'react-native-toast-notifications';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { AdProvider } from './src/contexts/AdContext';
import { ThemeProvider } from './src/contexts/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <AdProvider>
        <ToastProvider>
          <SafeAreaProvider>
            <StatusBar barStyle={'light-content'}/>
            <AppNavigator />
          </SafeAreaProvider>
        </ToastProvider>
      </AdProvider>
    </ThemeProvider>
  );
}