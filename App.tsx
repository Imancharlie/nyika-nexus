
import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a placeholder for screens until we implement them
const PlaceholderScreen = ({ route }: any) => (
  <SafeAreaView style={styles.container}>
    <Text style={styles.text}>
      {route.name} Screen (To be implemented)
    </Text>
  </SafeAreaView>
);

// We'll populate these with actual screens later
const Dashboard = PlaceholderScreen;
const Auth = PlaceholderScreen;
const Community = PlaceholderScreen;
const Services = PlaceholderScreen;
const Profile = PlaceholderScreen;
const NotFound = PlaceholderScreen;

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" />
        <Stack.Navigator initialRouteName="Dashboard">
          <Stack.Screen name="Home" component={PlaceholderScreen} />
          <Stack.Screen name="Auth" component={Auth} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="Community" component={Community} />
          <Stack.Screen name="Services" component={Services} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="NotFound" component={NotFound} />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});
