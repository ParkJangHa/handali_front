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
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        console.log(API_BASE_URL);
      } else {
        navigation.navigate("Category");
        console.log(API_BASE_URL);
      }
    } catch (error) {
      console.log(API_BASE_URL);
      console.error("로그인 오류:", error);
      Alert.alert("오류", "네트워크 연결이 원활하지 않습니다.");

    }
  };

  return (
    <>
      <StatusBar hidden={true} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Image source={require("../assets/LoginScreen/Weve.png")} style={styles.img} resizeMode="stretch" />

          <Image
            source={require("../assets/LoginScreen/Blue.png")}
            style={styles.catIcon}
          />
          <View style={styles.bContainer}>
          </View>
          <View style={styles.inputWithIcon}>
            <Image
              source={require("../assets/LoginScreen/Email_icon.png")}
              style={styles.icon}
            />
            <TextInput
              style={styles.inputField}
              placeholder="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#2D5D6B"
            />
          </View>
          <View style={styles.inputWithIcon}>
            <Image
              source={require("../assets/LoginScreen/Password_icon.png")}
              style={styles.icon}
            />
            <TextInput
              style={styles.inputField}
              placeholder="password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#2D5D6B"
            />
          </View>
          <View style={styles.rowContainer}>
            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => navigation.navigate("Signup")}
            >
              <Text style={styles.signupText}>회원가입</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>로그인</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#76D6F4",
  },
  bContainer: {
    marginBottom: hp("30%"),
  },
  img: {
    top: 0,
    position: "absolute",
    width: wp("100%"),
    height: hp("30%"),
    zIndex: 0,
  },
  catIcon: {
    position: "absolute",
    top: hp("1%"),
    width: wp("55%"),
    height: hp("25%"),
    resizeMode: "contain",
    alignSelf: "center",
    zIndex: 2,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    width: wp("80%"),
    height: hp("7%"),
    paddingVertical: hp("1.2%"),
    paddingHorizontal: wp("15%"),
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: hp("2.5%"),
    backgroundColor: "#FFE98A",
  },
  icon: {
    width: 13.42,
    height: 20,
    marginRight: 8,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    color: "#2D5D6B",
    fontFamily: "Jua-Regular"
  },
   rowContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: wp("80%"),
    gap: wp("4%"),
  },
  button: {
    backgroundColor: "#FFE98A",
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginTop: 10,
  },
  buttonText: {
    color: "#000",
    fontSize: 20,
    // fontWeight: "bold",
    fontFamily: "Jua-Regular"
  },
  signupButton: {
    backgroundColor: "#ECF7F7",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 10,
  },
  signupText: {
    color: "#2D5D6B",
    fontSize: 17,
    // fontWeight: "bold",
    fontFamily: "Jua-Regular"
  },
});

export default LoginScreen;
