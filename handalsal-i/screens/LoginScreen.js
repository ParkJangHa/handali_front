import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image
} from "react-native";

const LoginScreen = ({ navigation }) => { // props로 navigation 받음
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // 유효성 검사 함수
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

  // 로그인 버튼 클릭 시 실행
  const handleLogin = () => {
    if (validateInput()) {
      Alert.alert("로그인 성공", `${email}님 환영합니다!`);
      navigation.navigate("Category"); // 카태고리 선택택 화면으로 이동
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imgCon}>
        <Image 
          source={require("../assets/logo.png")} // 이미지 경로 설정
          style={styles.img} // 스타일 적용
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
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="비밀번호 입력"
          secureTextEntry={!isPasswordVisible}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
        </TouchableOpacity>
      </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFD563",
  },
  imgCon: {
    flex: 0.4,
    alignItems: "center", // 이미지 중앙 정렬
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
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
