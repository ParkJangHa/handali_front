import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

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
      const handaliResponse = await fetch("http://43.201.250.84/handalis", {
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
      <Text style={styles.dateText}>{formattedDate}</Text>
      <Text style={styles.title}>이제 '한달이'가 태어나요</Text>
      <View style = {styles.progressBar}>
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
          source={require("../assets/default_character.png")}
          style={styles.handalImage}
        />
      <View style={styles.nicknameCon}>
        <Text style={styles.nicknameText}>한달이에게 별명을 지어주세요!</Text>
        <TextInput
              style={styles.input}
              placeholder="   별명을 입력해 주세요."
              value={nicknameInput}
              onChangeText={setNicknameInput}
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
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: SCREEN_WIDTH * 0.05,
    backgroundColor: "#FFF",
    marginTop: -SCREEN_WIDTH * 0.06,
  },
  dateText: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: "bold",
    color: "#000",
    alignSelf: "flex-start",
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.08,
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
  progressBar: {
    width: "90%",
    height: SCREEN_HEIGHT * 0.01,
    justifyContent: "center",
    marginVertical: SCREEN_HEIGHT * 0.02,
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
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: "bold",
    color: "rgba(0, 0, 0, 0.5)",
    alignSelf: "flex-start",
    marginBottom: SCREEN_WIDTH * 0.05,
  },
  handalImage: {
    width: SCREEN_WIDTH * 0.5, // 반응형 너비
    height: SCREEN_HEIGHT * 0.35, // 반응형 높이
    marginTop: SCREEN_HEIGHT * 0.02,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  nicknameCon: {
    flex: 1,
    width: SCREEN_WIDTH * 0.9, // 반응형 너비
    justifyContent: "center",
    alignItems: "center",
    borderRadius: SCREEN_WIDTH * 0.05, // 둥근 테두리 반응형
    backgroundColor: "rgba(224, 242, 31, 0.5)",
    marginBottom: SCREEN_HEIGHT * 0.02, // 반응형 아래 여백
  },
  nicknameText: {
    fontSize: SCREEN_WIDTH * 0.06, // 반응형 텍스트 크기
    marginBottom: SCREEN_HEIGHT * 0.02, // 반응형 아래 여백
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#FFF7F7",
    width: "80%",
    height: SCREEN_HEIGHT * 0.06, // 반응형 높이
    borderRadius: SCREEN_WIDTH * 0.08, // 둥근 테두리 반응형
    textAlign: "center",
    fontSize: SCREEN_WIDTH * 0.05, // 반응형 폰트 크기
    color: "#000",
  },
  startButton: {
    width: SCREEN_WIDTH * 0.9,
    backgroundColor: "#F8B66C",
    paddingVertical: SCREEN_HEIGHT * 0.02, // 반응형 세로 여백
    paddingHorizontal: SCREEN_WIDTH * 0.1, // 반응형 가로 여백
    borderRadius: SCREEN_WIDTH * 0.05, // 둥근 테두리 반응형
    alignSelf: "center",
  },
  startButtonText: {
    fontSize: SCREEN_WIDTH * 0.045, // 반응형 폰트 크기
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
});

export default HandalStart;
