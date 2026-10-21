import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { TaskProvider } from './src/context/TaskContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme/colors';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
        translucent={false}
      />
      <AuthProvider>
        <TaskProvider>
          <AppNavigator />
        </TaskProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
