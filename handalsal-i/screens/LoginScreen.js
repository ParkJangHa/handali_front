import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, Image, Platform, StatusBar,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

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
        // 현재 한달이가 있으면 메인으로
        navigation.navigate("MainScreen");
      } else if (handaliViewResponse.status === 404) {
        // 2) 최근 생성된 한달이 존재하면 JobScreen(handaliId)으로
        try {
          const recentRes = await fetch(`${API_BASE_URL}/handalis/recent`, {
            method: "GET",
            headers: { Authorization: `Bearer ${data.Bearer}` },
          });
          if (recentRes.ok) {
            const recent = await recentRes.json();
            navigation.navigate("JobScreen", { handaliId: recent.handali_id });
          } else if (recentRes.status === 404) {
            // 3) 최근 것도 없으면: 튜토리얼 시청 여부로 분기
            const seenTutorial = await AsyncStorage.getItem("tutorial_seen");
            if (seenTutorial === "true") {
              navigation.navigate("Category"); // 라우트 이름 쓰던 것 유지
            } else {
              navigation.navigate("TutorialScreen");
            }
          } else {
            // 그 외 서버 오류 케이스
            Alert.alert("오류", "서버 응답이 올바르지 않습니다.");
          }
        } catch (e) {
          console.error("최근 한달이 조회 오류:", e);
          const seenTutorial = await AsyncStorage.getItem("tutorial_seen");
          navigation.navigate(seenTutorial === "true" ? "Category" : "TutorialScreen");
        }
      } else {
        // 인증 만료/기타 오류
        await AsyncStorage.removeItem("authToken");
        Alert.alert("오류", "세션이 만료되었어요. 다시 로그인해주세요.");
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      Alert.alert("오류", "네트워크 연결이 원활하지 않습니다.");
    }
  };

  return (
    <>
      <StatusBar hidden={true} />
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        enableOnAndroid
        keyboardShouldPersistTaps="always"
        extraScrollHeight={hp("1%")}
        extraHeight={Platform.OS === "android" ? hp("24%") : 0}
        enableAutomaticScroll
      >
        <View style={styles.container}>
          <Image source={require("../assets/LoginScreen/Weve.png")} style={styles.img} resizeMode="stretch" />
          <Image source={require("../assets/LoginScreen/Blue.png")} style={styles.catIcon} />
          <Image source={require("../assets/LoginScreen/turtle.png")} style={styles.turuleImg} />
          <Image source={require("../assets/LoginScreen/crab.png")} style={styles.crabImg} />

          <View style={styles.bContainer} />

          <View style={styles.inputWithIconEmail}>
            <Image source={require("../assets/LoginScreen/Email_icon.png")} style={styles.icon} />
            <TextInput
              style={styles.inputField}
              placeholder="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#000000"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputWithIconPassword}>
            <Image source={require("../assets/LoginScreen/Password_icon.png")} style={styles.icon} />
            <TextInput
              style={styles.inputField}
              placeholder="password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#000000"
              returnKeyType="done"
            />
          </View>

          <View style={styles.rowContainer}>
            <TouchableOpacity style={styles.signupButton} onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.signupText}>회원가입</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>로그인</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.resetTutorialButton}
            onPress={async () => {
              await AsyncStorage.removeItem("tutorial_seen");
              Alert.alert("튜토리얼 기록 삭제됨", "앱 재실행 시 튜토리얼이 다시 표시됩니다.");
            }}
          >
            <Text style={styles.resetTutorialText}>튜토리얼 다시 보기 (개발용)</Text>
          </TouchableOpacity>

          <View style={{ height: hp("8%") }} />
        </View>
      </KeyboardAwareScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,                 
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#8BE1FC",
    paddingBottom: hp("2%"),    
  },
  bContainer: { marginBottom: hp("30%") },
  img: {
    top: 0, position: "absolute",
    width: wp("100%"), height: hp("45%"),
    zIndex: 0,
  },
  catIcon: {
    position: "absolute",
    top: hp("3%"),
    width: wp("55%"), height: hp("25%"),
    resizeMode: "contain",
    alignSelf: "center",
  },
  turuleImg: {
    position: "absolute",
    width: wp("14%"), height: hp("9%"),
    resizeMode: "contain",
    top: hp("0%"), left: wp("0%"),
  },
  crabImg: {
    position: "absolute",
    width: wp("14%"), height: hp("9%"),
    resizeMode: "contain",
    top: hp("25%"), left: wp("60%"),
  },
  inputWithIconEmail: {
    flexDirection: "row",
    alignItems: "center",
    width: wp("65%"),
    paddingVertical: hp("0.8%"),
    paddingHorizontal: wp("20%"),
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "#76D6F4",
    marginBottom: hp("2.5%"),
    marginTop: hp("5%"),
    backgroundColor: "#FFFFFF",
  },
  inputWithIconPassword: {
    flexDirection: "row",
    alignItems: "center",
    width: wp("65%"),
    paddingVertical: hp("0.8%"),
    paddingHorizontal: wp("20%"),
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "#76D6F4",
    marginBottom: hp("2.5%"),
    backgroundColor: "#FFFFFF",
  },
  icon: {
    width: wp("3.8%"), height: hp("2.5%"),
    marginRight: wp("2%"),
    right: wp("10%"),
  },
  inputField: {
    width: wp("50%"),
    fontSize: 14, color: "#000000",
    fontFamily: "Jua-Regular",
    right: wp("10%"),
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: wp("80%"),
    gap: wp("4%"),
    marginTop: hp("3%"),
  },
  button: {
    backgroundColor: "#FFF5CB",
    paddingVertical: 12, paddingHorizontal: 65,
    borderRadius: 30, borderWidth: 3, borderColor: "#76D6F4",
    marginTop: 10,
  },
  buttonText: {
    color: "#000", fontSize: 20, fontFamily: "Jua-Regular",
  },
  signupButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12, paddingHorizontal: 30,
    borderRadius: 30, borderWidth: 3, borderColor: "#76D6F4",
    marginTop: 10,
  },
  signupText: {
    color: "#2D5D6B", fontSize: 17, fontFamily: "Jua-Regular",
  },
  resetTutorialButton: {
    backgroundColor: "#FFDDDD",
    paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 20, borderWidth: 2, borderColor: "#FF8888",
    marginTop: hp("2%"),
  },
  resetTutorialText: {
    color: "#990000", fontSize: 14, textAlign: "center", fontFamily: "Jua-Regular",
  },
});

export default LoginScreen;
