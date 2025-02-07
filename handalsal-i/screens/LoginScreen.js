import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";

const API_URL = "http://43.201.250.84"; // ✅ 실제 API URL

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ 자동 로그인 확인
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("authToken");
      if (token) navigation.navigate("Category");
    };
    checkLoginStatus();
  }, [navigation]); // ✅ navigation 의존성 추가

  // ✅ 유효성 검사
  const validateInput = () => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!email || !emailRegex.test(email)) {
      Alert.alert("오류", "올바른 이메일을 입력하세요.");
      return false;
    }
    if (!password || password.length < 6) {
      Alert.alert("오류", "비밀번호는 최소 6자 이상이어야 합니다.");
      return false;
    }
    return true;
  };

  // ✅ 로그인 요청
  const handleLogin = async () => {
    if (!validateInput()) return;
  
    try {
      const response = await fetch("http://43.201.250.84/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const responseText = await response.text(); // ✅ 응답을 텍스트로 확인
      console.log("서버 응답:", responseText);
  
      // ✅ JSON인지 확인 후 처리
      let data;
      if (responseText.startsWith("{")) {
        data = JSON.parse(responseText); // JSON 형식이면 파싱
      } else {
        data = { Bearer: responseText }; // 단순 문자열이면 객체로 변환
      }
  
      if (response.ok) {
        await AsyncStorage.setItem("authToken", data.Bearer);
        Alert.alert("로그인 성공", "환영합니다!");
        navigation.navigate("Category");
      } else {
        Alert.alert("로그인 실패", data.message || "이메일 또는 비밀번호를 확인하세요.");
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      Alert.alert("오류", error.message || "네트워크 연결이 원활하지 않습니다.");
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.imgCon}>
        <Image 
          source={require("../assets/logo.png")} 
          style={styles.img} 
        />
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
    </View>
  );
};

// ✅ 스타일 정리
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFD563",
  },
  imgCon: {
    flex: 0.4,
    alignItems: "center",
    justifyContent: "center",
  },
  img: {
    width: 250,
    height: 250,
    resizeMode: "contain",
    marginBottom: 120,
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
