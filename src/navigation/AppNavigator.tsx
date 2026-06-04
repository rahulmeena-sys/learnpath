import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import TodayScreen from '../screens/TodayScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: 'rgba(255,255,255,0.06)',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
            Home: { active: 'home', inactive: 'home-outline' },
            Today: { active: 'calendar', inactive: 'calendar-outline' },
            Library: { active: 'library', inactive: 'library-outline' },
            Profile: { active: 'person-circle', inactive: 'person-circle-outline' },
          };
          const icon = icons[route.name];
          return <Ionicons name={focused ? icon.active : icon.inactive} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!session) return <AuthScreen />;
  if (!profile?.onboarding_complete) return <OnboardingScreen />;
  return <MainTabs />;
}
