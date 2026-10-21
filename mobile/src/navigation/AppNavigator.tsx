import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { RootStackParamList } from '../types';

// Screens
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { TaskDetailScreen } from '../screens/TaskDetailScreen';
import { AddEditTaskScreen } from '../screens/AddEditTaskScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Main screen with custom bottom navigation bar
const MainTabNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Home' | 'Tasks' | 'Profile'>('Home');

  return (
    <View style={styles.mainContainer}>
      <View style={styles.tabContent}>
        {activeTab === 'Home' && <HomeScreen />}
        {activeTab === 'Tasks' && <TasksScreen />}
        {activeTab === 'Profile' && <ProfileScreen />}
      </View>

      {/* Sleek Bottom Navigation Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('Home')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIcon, activeTab === 'Home' && styles.tabIconActive]}>🏠</Text>
          <Text style={[styles.tabLabel, activeTab === 'Home' && styles.tabLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('Tasks')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIcon, activeTab === 'Tasks' && styles.tabIconActive]}>📋</Text>
          <Text style={[styles.tabLabel, activeTab === 'Tasks' && styles.tabLabelActive]}>Tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('Profile')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIcon, activeTab === 'Profile' && styles.tabIconActive]}>👤</Text>
          <Text style={[styles.tabLabel, activeTab === 'Profile' && styles.tabLabelActive]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingIndicator fullscreen message="Restoring secure TaskFlow session..." />;
  }

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.border,
          notification: colors.accent,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade_from_bottom',
        }}
      >
        {!isAuthenticated ? (
          // Unauthenticated Auth Stack
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // Authenticated App Stack
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="TaskDetail"
              component={TaskDetailScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="AddEditTask"
              component={AddEditTaskScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContent: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderHighlight,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
    fontSize: 11,
  },
  tabLabelActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
});
