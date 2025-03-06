import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import CategorySelect from "./screens/CategorySelect";
import DetailSelect from "./screens/DetailSelect";
import HabitAppendScreen from "./screens/HabitAppendScreen";
import UserHabitAppendScreen from "./screens/UserHabitAppendScreen";
import HandalStart from "./screens/HandalStart";
import MainScreen from "./screens/MainScreen";
import HabitCategoryScreen from "./screens/HabitCategoryScreen";
import HabitDetailScreen from "./screens/HabitDetailScreen";
import HabitCheckScreen from "./screens/HabitCheckScreen";
import ApartScreen from "./screens/ApartScreen";
import JobScreen from "./screens/JobScreen";

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: "#FFD563", // 헤더 배경색
            elevation: 0, // Android 그림자 제거
            shadowOpacity: 0, // iOS 그림자 제거
          },
          headerShadowVisible: false, // iOS 경계선 제거
          headerTintColor: "#000", // 뒤로가기 버튼 색상
          headerTitle: "", // 타이틀 숨김
          headerBackTitleVisible: false, // 뒤로가기 버튼 옆 텍스트 숨김
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen}/>
        <Stack.Screen name="Signup" component={SignupScreen} 
        options={{
          headerStyle: {
            backgroundColor: "#FFFDF0", // 헤더 배경색
            
          },
        }}
        />

        <Stack.Screen name="Category" component={CategorySelect} 
        options={{
          headerLeft: () => null,
          headerStyle: {
            backgroundColor: "#FFFDF0", // 헤더 배경색
          },
        }}
        />
        <Stack.Screen name="DetailSelect" component={DetailSelect} 
        options={{
          headerStyle: {
            backgroundColor: "#FFFDF0", // 헤더 배경색
            
          },
        }}
        />
        <Stack.Screen name="HabitAppendScreen" component={HabitAppendScreen} 
        options={{
          headerLeft: () => null, // 🔹 뒤로가기 버튼만 삭제
          headerStyle: {
            backgroundColor: "#FFFDF0", // 헤더 배경색
            
            
          },
        }}
        />
        <Stack.Screen name="UserHabitAppendScreen" component={UserHabitAppendScreen} 
        options={{
          headerStyle: {
            backgroundColor: "#FFFDF0", // 헤더 배경색
            
          },
        }}
        />
        <Stack.Screen name="HandalStart" component={HandalStart} 
        options={{
          headerLeft: () => null, // 🔹 뒤로가기 버튼만 삭제
          headerStyle: {
            backgroundColor: "#FFFFFF", // 헤더 배경색
            
          },
        }}
        />
        <Stack.Screen name="MainScreen" component={MainScreen} 
        options={{ headerShown: false
        }}
        />
        <Stack.Screen name="Record" component={HabitCategoryScreen} 
        options={{ headerShown: false, gestureEnabled: true
        }}
        />
        <Stack.Screen name="HabitDetail" component={HabitDetailScreen} 
        options={{ headerShown: false, gestureEnabled: true
        }}
        />
        <Stack.Screen name="HabitCheck" component={HabitCheckScreen} 
        options={{ headerShown: false, gestureEnabled: true
        }}
        />
        <Stack.Screen name="ApartScreen" component={ApartScreen} 
        options={{
        }}
        />
        <Stack.Screen name="JobScreen" component={JobScreen} 
        options={{
        }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;