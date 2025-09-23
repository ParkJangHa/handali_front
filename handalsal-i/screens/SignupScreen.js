import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ImageBackground,
  Image,
} from "react-native";
import { API_BASE_URL } from "@env";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPasswordMessage, setConfirmPasswordMessage] = useState("");

  useEffect(() => {
    if (confirmPassword.length > 0) {
      setConfirmPasswordMessage(
        password === confirmPassword
          ? "✅ 비밀번호가 일치합니다."
          : "❌ 비밀번호가 일치하지 않습니다."
      );
    } else {
      setConfirmPasswordMessage("");
    }
  }, [password, confirmPassword]);

  const validateInput = () => {
    const emailRegex = /\S+@\S+\.\S+/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;"'<>,.?/~`\\|=-]).{6,}$/;
    const birthdateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!email || !emailRegex.test(email)) {
      Alert.alert("오류", "올바른 이메일을 입력하세요.");
      return false;
    }
    if (!password || !passwordRegex.test(password)) {
      Alert.alert(
        "오류",
        "비밀번호는 최소 6자 이상, 대소문자, 숫자, 특수문자를 포함해야 합니다."
      );
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("오류", "비밀번호가 일치하지 않습니다.");
      return false;
    }
    if (!name) {
      Alert.alert("오류", "이름을 입력하세요.");
      return false;
    }
    if (!phone || phone.length < 10 || phone.length > 11) {
      Alert.alert("오류", "전화번호는 10~11자리 숫자로 입력하세요.");
      return false;
    }
    if (!birthdate || !birthdateRegex.test(birthdate)) {
      Alert.alert("오류", "생년월일은 YYYY-MM-DD 형식으로 입력하세요.");
      return false;
    }

    const [year, month, day] = birthdate.split("-").map(Number);
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      Alert.alert("오류", "생년월일의 월/일 형식이 잘못되었습니다.");
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateInput()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          birthday: birthdate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("회원가입 성공", "회원가입이 완료되었습니다!");
        navigation.navigate("Login");
      } else {
        const errorMessage = data.message
          ? data.message
          : Object.values(data).join("\n");
        Alert.alert("회원가입 실패", errorMessage);
      }
    } catch (error) {
      console.error("회원가입 오류:", error);
      Alert.alert("오류", "서버와 연결할 수 없습니다.");
    }
  };

  return (
    <ImageBackground
      source={require("../assets/Weve.png")}
      style={styles.background}
      resizeMode="stretch"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>
            Let's
          </Text>
          <Text style={styles.title}>
            Start!
          </Text>
          <Text style={styles.subTitle}>한달이를 만나기 전, 간단한 정보가 필요해요.</Text>

          <Text style={styles.inputTitle}>이메일</Text>
          <TextInput
            style={styles.input}
            placeholder="이메일"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#aaa"
          />
          <Text style={styles.inputTitle}>비밀번호</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="비밀번호"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.eyeText}>
                {showPassword ? "숨기기" : "보기"}
              </Text>
            </TouchableOpacity>
          </View>
          {confirmPasswordMessage !== "" && (
            <Text
              style={{
                alignSelf: "flex-start",
                marginLeft: wp("8%"),
                marginTop: -hp("1%"),
                marginBottom: hp("2%"),
                color: password === confirmPassword ? "green" : "red",
                marginBottom: 5,
              }}
            >
              {confirmPasswordMessage}
            </Text>
          )}
          <Text style={styles.inputTitle}>비밀번호 확인</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="비밀번호 확인"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Text style={styles.eyeText}>
                {showConfirmPassword ? "숨기기" : "보기"}
              </Text>
            </TouchableOpacity>
          </View>


          <Text style={styles.inputTitle}>이름</Text>
          <TextInput
            style={styles.input}
            placeholder="이름"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#aaa"
          />
          <Text style={styles.inputTitle}>전화번호</Text>
          <TextInput
            style={styles.input}
            placeholder="전화번호"
            keyboardType="numeric"
            value={phone}
            onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ""))}
            placeholderTextColor="#aaa"
          />
          <Text style={styles.inputTitle}>생년월일</Text>
          <TextInput
            style={styles.input}
            placeholder="생년월일"
            keyboardType="numeric"
            value={birthdate}
            placeholderTextColor="#aaa"
            onChangeText={(text) => {
              let formatted = text.replace(/[^0-9]/g, "").slice(0, 8);
              if (formatted.length >= 4) {
                formatted = formatted.slice(0, 4) + "-" + formatted.slice(4);
              }
              if (formatted.length >= 7) {
                formatted = formatted.slice(0, 7) + "-" + formatted.slice(7);
              }
              setBirthdate(formatted);
            }}
          />
          
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={handleSignup}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Image
              source={require("../assets/Arrow_r.png")} // ← 화살표 이미지 경로
              style={styles.arrowIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: wp("100%"),
    height: hp("80%"),
    backgroundColor: "#8BE1FC",
  },
  scrollContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: wp("9%"),
    color: "#000000",
    fontFamily: "Jua-Regular",
    alignSelf: "flex-start",
    left: wp("9%"),
    marginTop: hp("-0.3%"),
  },
  subTitle:{
    fontSize: wp("3%"),
    color: "#B1B1B1",
    fontFamily: "Jua-Regular",
    alignSelf: "flex-start",
    left: wp("9%"),
    marginTop: hp("1%"),
  },
  inputTitle:{
    fontSize: wp("3.4"),
    color: "#000",
    fontFamily: "Jua-Regular",
    alignSelf: "flex-start",
    left: wp("9%"),
    marginTop: hp("1%"),
    marginBottom: hp("1%"),
    
  },
  input: {
    width: wp("85%"),
    height: hp("4%"),
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: wp("4%"),
    borderRadius: 10,
    backgroundColor: "#FFF",
    fontFamily: "Jua-Regular",
    fontSize: wp("3%"),
  },
  arrowButton: {
    alignSelf: "center",
    marginTop: hp("5%"),
    backgroundColor: "#0099FF",
    borderRadius: 999,      
    width: hp("10%"),
    height: hp("10%"),
    justifyContent: "center",
    alignItems: "center",
  },
  arrowIcon: {
    width: wp("8%"),
    height: wp("8%"),
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#FFF",
    width: wp("85%"),
    height: hp("4%"),
  },

  passwordInput: {
    flex: 1,
    fontSize: wp("3%"),
    color: "#000",
    fontFamily: "Jua-Regular",
  },

  eyeText: {
    marginLeft: 10,
    fontSize: 13,
    color: "#B1B1B1",
    fontFamily: "Jua-Regular",
  },
});

export default SignupScreen;
