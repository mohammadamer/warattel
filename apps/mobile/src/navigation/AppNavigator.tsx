import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { PlannerScreen } from '../screens/PlannerScreen';
import { RecitationScreen } from '../screens/RecitationScreen';
import { FeedbackScreen } from '../screens/FeedbackScreen';
import { AuthScreen } from '../screens/AuthScreen';

export type RootStackParamList = {
  Home: undefined;
  Auth: undefined;
  Planner: undefined;
  Recitation: undefined;
  Feedback: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'Welcome' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Warattel' }} />
        <Stack.Screen name="Planner" component={PlannerScreen} options={{ title: 'Planner' }} />
        <Stack.Screen name="Recitation" component={RecitationScreen} options={{ title: 'Recite' }} />
        <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ title: 'Feedback' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
