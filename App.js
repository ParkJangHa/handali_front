import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HabitCategoryScreen from "./habit screen/HabitCategoryScreen";
import HabitDetailScreen from "./habit screen/HabitDetailScreen";
import MainScreen from "./main screen/MainScreen";
import HabitCheckScreen from "./habit screen/HabitCheckScreen"

const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Main"
                screenOptions={{ headerShown: false, gestureEnabled: true }}>
                <Stack.Screen name="Main" component={MainScreen} options={{ tabBarStyle: { display: 'none' } }} />
                <Stack.Screen name="HabitCategory" component={HabitCategoryScreen} options={{ tabBarStyle: { display: 'none' } }} />
                <Stack.Screen name="HabitDetail" component={HabitDetailScreen} options={{ tabBarStyle: { display: 'none' } }} />
                <Stack.Screen name="HabitCheck" component={HabitCheckScreen} options={{ tabBarStyle: { display: 'none' } }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}