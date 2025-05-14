import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from '@env';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const HandalStart = ({ navigation }) => {
  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

  const [progress, setProgress] = useState(100); // 진행률 (0~100)
  const [nicknameInput, setNicknameInput] = useState("");
  const [loading, setLoading] = useState(false);

  const createHandali = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        Alert.alert("세션 만료", "다시 로그인해주세요.");
        navigation.navigate("LoginScreen");
        return;
      }

      if (!nicknameInput.trim()) {
        Alert.alert("알림", "한달이의 별명을 입력해주세요!");
        setLoading(false);
        return;
      }

      const handaliData = { nickname: nicknameInput.trim() };
      console.log("📌 한달이 생성 요청 데이터:", JSON.stringify(handaliData));

      // 한달이 생성 API 요청
      const handaliResponse = await fetch(`${API_BASE_URL}/handalis`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(handaliData),
      });

      // 📌 응답을 먼저 `text()`로 받음
      const responseText = await handaliResponse.text();
      console.log("📌 한달이 생성 응답 (원본):", responseText);

      // 📌 JSON인지 확인 후 파싱
      let handaliResult;
      try {
        handaliResult = JSON.parse(responseText); // JSON으로 변환 시도
      } catch (error) {
        console.warn("🚨 JSON 파싱 실패, 원본 텍스트 사용:", responseText);
        handaliResult = { message: responseText }; // JSON이 아니면 그냥 문자열 저장
      }

      if (!handaliResponse.ok) {
        if (handaliResponse.status === 409) {
          Alert.alert("알림", "이미 한 마리의 한달이가 존재합니다!");
        } else {
          Alert.alert("실패", `한달이 생성 실패: ${handaliResult.message || "알 수 없는 오류"}`);
        }
        setLoading(false);
        return;
      }

      Alert.alert("완료", "한달이가 성공적으로 생성되었습니다!");
      navigation.navigate("MainScreen"); // ✅ 메인 화면으로 이동
    } catch (error) {
      console.error("🚨 한달이 생성 중 오류 발생:", error);
      Alert.alert("오류", "네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <Image source={require("../assets/Category/Weve.png")} style={styles.img} resizeMode="stretch" />
      <Text style={styles.dateText}>{formattedDate}</Text>
      <Text style={styles.title}>이제 '한달이'가 태어나요</Text>
      <View style={styles.progressBar}>
        <Image
          source={require("../assets/probar.png")} // 이미지 경로 설정
          style={styles.backgroundBar} // 스타일 적용
        />
        <View style={[styles.foregroundWrapper, { width: `${progress}%` }]}>
          <Image
            source={require("../assets/probarlevel.png")}
            style={styles.foregroundBar}
          />
        </View>
      </View>
      <Text style={styles.subTitle}>앞으로 같이 성장할 '한달이'에요.</Text>
      <Image
        source={require("../assets/character/default_character.png")}
        style={styles.handalImage}
      />
      <Image
        source={require("../assets/Category/Vector.png")}
        style={styles.handalbackImage}
      />
      <View style={styles.bottomCon}>
        <View style={styles.nicknameCon}>
          <Text style={styles.nicknameText}>한달이에게 별명을 지어주세요!</Text>
          <TextInput
            style={styles.input}
            placeholder="   별명을 입력해 주세요."
            placeholderTextColor="#BFBDBD"
            value={nicknameInput}
            onChangeText={setNicknameInput}
            maxLength={9} // 닉네임 최대 9자
          />
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#F8B66C" />
        ) : (
          <TouchableOpacity style={styles.startButton} onPress={createHandali}>
            <Text style={styles.startButtonText}>시작할래요</Text>
          </TouchableOpacity>
        )}
      </View>
      <Image source={require("../assets/Category/B_weve.png")} style={styles.background} resizeMode="stretch" />
    </View>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: wp("5%"),
    backgroundColor: "#FFF",
    marginTop: -wp("6%"),
  },
  img: {
    top: 0,
    position: "absolute",
    width: wp("100%"),
    height: hp("25%"),
    zIndex: 0,
  },
  dateText: {
    fontSize: wp("6%"),
    color: "#2D5D6B",
    alignSelf: "flex-start",
    fontFamily: "Jua-Regular",
  },
  title: {
    fontSize: wp("8%"),
    color: "#2D5D6B",
    alignSelf: "flex-start",
    fontFamily: "Jua-Regular",
  },
  progressBar: {
    width: "100%",
    height: hp("1%"),
    justifyContent: "center",
    marginVertical: hp("2%"),
  },
  backgroundBar: {
    width: "100%",
    height: "100%",
    position: "absolute",
    borderRadius: 10,
  },
  foregroundWrapper: {
    height: "100%",
    position: "absolute",
    overflow: "hidden",
  },
  foregroundBar: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  subTitle: {
    fontSize: wp("5%"),
    color: "rgba(0, 0, 0, 0.5)",
    alignSelf: "flex-start",
    marginBottom: wp("5%"),
    fontFamily: "Jua-Regular",
  },
  handalImage: {
    top: hp("28%"),
    position: "absolute",
    width: wp("35%"),
    height: hp("30%"),
  },
  handalbackImage: {
    top: hp("20%"),
    position: "absolute",
    width: wp("66%"),
    height: hp("35%"),
    marginTop: hp("6%"),
    zIndex: -1,
  },
  bottomCon: {
    bottom: 0,
    position: "absolute",
    marginBottom: hp("5%")
  },
  nicknameCon: {
    width: wp("90%"),
    height: hp("15%"),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: wp("5%"),
    backgroundColor: "#76D6F4",
    marginBottom: hp("2%"),
  },
  nicknameText: {
    fontSize: wp("6%"),
    marginBottom: hp("2%"),
    color: "#2D5D6B",
    fontFamily: "Jua-Regular",
  },
  input: {
    backgroundColor: "#FFF7F7",
    width: "80%",
    height: hp("6%"),
    borderRadius: wp("8%"),
    textAlign: "center",
    fontSize: wp("5%"),
    color: "#000",
    fontWeight: "bold",
  },
  startButton: {
    width: wp("60%"),
    backgroundColor: "#FFD5B7",
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("10%"),
    borderRadius: wp("5%"),
    alignSelf: "center",
    marginBottom: hp("1%"),
  },
  startButtonText: {
    fontSize: wp("4.5%"),
    color: "#2D5D6B",
    textAlign: "center",
    fontFamily: "Jua-Regular",
  },
  background: {
    position: "absolute",
    bottom: 0,
    width: wp("100%"),
    height: hp("35%"),
    zIndex: -1,
  },
});


export default HandalStart;
