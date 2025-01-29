import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";

const SignupScreen = ({ navigation }) => {
  // 입력값 상태 관리
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthdate, setBirthdate] = useState("");

  // 유효성 검사 함수
  const validateInput = () => {
    const emailRegex = /\S+@\S+\.\S+/; // 이메일 형식 검사
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])[a-zA-Z\d!@#$%^&*(),.?":{}|<>]{6,}$/;

    // 이메일 검사
    if (!email || !emailRegex.test(email)) {
      Alert.alert("오류", "올바른 이메일을 입력하세요.");
      return false;
    }

    // 비밀번호 검사
    if (!password || !passwordRegex.test(password)) {
      Alert.alert(
        "오류",
        "비밀번호는 최소 6자 이상, 대소문자 및 특수문자를 포함해야 합니다."
      );
      return false;
    }

    // 비밀번호 확인
    if (password !== confirmPassword) {
      Alert.alert("오류", "비밀번호가 일치하지 않습니다.");
      return false;
    }

    // 이름 검사
    if (!name) {
      Alert.alert("오류", "이름을 입력하세요.");
      return false;
    }

    // 전화번호 검사 (10~11자리 숫자만 허용)
    if (!phone || phone.length < 10 || phone.length > 11) {
      Alert.alert("오류", "전화번호는 10~11자리 숫자로 입력하세요.");
      return false;
    }

    // 생년월일 검사 (YYMMDD 형식 + 월/일 유효성)
    const birthdateRegex = /^\d{6}$/;
    if (!birthdate || !birthdateRegex.test(birthdate)) {
      Alert.alert("오류", "생년월일은 YYMMDD 형식으로 입력하세요.");
      return false;
    }

    const year = parseInt(birthdate.substring(0, 2), 10); // 연도
    const month = parseInt(birthdate.substring(2, 4), 10); // 월
    const day = parseInt(birthdate.substring(4, 6), 10); // 일

    if (month < 1 || month > 12 || day < 1 || day > 31) {
      Alert.alert("오류", "생년월일의 월/일 형식이 잘못되었습니다.");
      return false;
    }

    return true; // 모든 검증 통과
  };

  // 회원가입 버튼 클릭
  const handleSignup = () => {
    if (validateInput()) {
      Alert.alert("회원가입 성공", "회원가입이 완료되었습니다!");
      navigation.navigate("Home"); // 회원가입 완료 후 홈 화면 이동
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>회원가입</Text>
      <TextInput
        style={styles.input}
        placeholder="이메일"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호 확인"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="이름"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="전화번호 (숫자만 입력)"
        keyboardType="numeric" // 숫자 키패드만 사용
        value={phone}
        onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ""))} // 숫자 외 문자 제거
      />
      <TextInput
        style={styles.input}
        placeholder="생년월일 (YYMMDD)"
        keyboardType="numeric"
        value={birthdate}
        onChangeText={(text) => setBirthdate(text.replace(/[^0-9]/g, "").slice(0, 6))} // 숫자 외 문자 제거 및 6자리 제한
      />
      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>회원가입</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFDF0",
  },
  title: {
    flex: 0.5,
    fontSize: 35,
    fontWeight: "bold",
  },
  input: {
    width: 350,
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 25,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: "#FFF1A3",
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
});

export default SignupScreen;
