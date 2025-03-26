import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/handalis/view`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          navigation.navigate("MainScreen");
        } else if (response.status === 404) {
          navigation.navigate("Category");
        } else {
          await AsyncStorage.removeItem("authToken");
        }
      } catch (error) {
        console.error("자동 로그인 확인 오류:", error);
      }
    };

    checkLoginStatus();
  }, []);

  const validateInput = () => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!email || !emailRegex.test(email)) {
      Alert.alert("오류", "올바른 이메일을 입력하세요.");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateInput()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const responseText = await response.text();
      let data = responseText.startsWith("{")
        ? JSON.parse(responseText)
        : { Bearer: responseText };

      if (!response.ok) {
        Alert.alert("로그인 실패", data.message || "이메일 또는 비밀번호를 확인하세요.");
        return;
      }

      await AsyncStorage.setItem("authToken", data.Bearer);

      const handaliViewResponse = await fetch(`${API_BASE_URL}/handalis/view`, {
        method: "GET",
        headers: { Authorization: `Bearer ${data.Bearer}` },
      });

      if (handaliViewResponse.ok) {
        navigation.navigate("MainScreen");
      } else {
        navigation.navigate("Category");
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      Alert.alert("오류", "네트워크 연결이 원활하지 않습니다.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.imgCon}>
          <Image source={require("../assets/logo.png")} style={styles.img} />
        </View>
        <Text style={styles.title}>한달이</Text>
        <TextInput
          style={styles.input}
          placeholder="이메일 입력"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호 입력"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>로그인</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => navigation.navigate("Signup")}
        >
          <Text style={styles.signupText}>회원가입</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFD563",
    paddingBottom: 40,
  },
  imgCon: {
    alignItems: "center",
    marginBottom: 20,
  },
  img: {
    width: 250,
    height: 250,
    resizeMode: "contain",
  },
  title: {
    fontSize: 50,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: 300,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#FDA44F",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupButton: {
    marginTop: 20,
  },
  signupText: {
    color: "#000",
    fontSize: 14,
  },
});

export default LoginScreen;
