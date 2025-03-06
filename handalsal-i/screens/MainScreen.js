import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const API_URL = "http://43.201.250.84/handalis/view"; // ✅ API 엔드포인트

export default function App({ navigation }) {
  // ✅ 한달이 정보 상태 관리
  const [nickname, setNickname] = useState("");
  const [daysSinceCreated, setDaysSinceCreated] = useState(0);
  const [totalCoin, setTotalCoin] = useState(0);

  // ✅ 한달이 상태 조회 API 호출
  const fetchHandaliStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("세션 만료", "다시 로그인해주세요.");
        navigation.navigate("Login");
        return;
      }

      const response = await fetch(API_URL, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("📌 한달이 상태 조회 응답:", data);
        setNickname(data.nickname);
        setDaysSinceCreated(data.days_since_created);
        setTotalCoin(data.total_coin);
      } else {
        console.log("📌 한달이가 존재하지 않습니다.");
        setNickname(""); // ✅ 한달이가 없을 경우 기본값 설정
        setDaysSinceCreated(0);
        setTotalCoin(0);
      }
    } catch (error) {
      console.error("🚨 한달이 상태 조회 오류:", error);
      Alert.alert("오류", "네트워크 오류가 발생했습니다.");
    }
  };

  // ✅ 로그아웃 기능
  const handleLogout = async () => {
    Alert.alert(
      "로그아웃",
      "정말 로그아웃 하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "확인",
          onPress: async () => {
            await AsyncStorage.removeItem("authToken"); // ✅ 토큰 삭제
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }], // ✅ 로그인 화면으로 이동
            });
          },
        },
      ]
    );
  };

  // ✅ 메인 화면 진입할 때마다 API 호출
  useEffect(() => {
    fetchHandaliStatus();
  }, []);

  return (
    <View style={styles.container}>
      {/* 상단 바 */}
      <View style={styles.topBar}>
        <View style={styles.coinContainer}>
          <Image source={require("../assets/coin.png")} style={styles.coinIcon} />
          <Text style={styles.coinText}>{totalCoin}</Text>
        </View>
        <View style={styles.topIcons}>
          <TouchableOpacity>
            <Image source={require("../assets/store.png")} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image source={require("../assets/storage.png")} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 콘텐츠 영역 */}
      <View style={styles.content}>
        <Text style={styles.dayText}>{daysSinceCreated}일차, {nickname || "별명 없음"}</Text>
        <Image source={require("../assets/window.png")} style={styles.window} />
        <View style={styles.characterContainer}>
          <Image source={require("../assets/character.png")} style={styles.character} />
        </View>
        <Image source={require("../assets/sofa.png")} style={styles.sofa} />
      </View>

      {/* 하단 배경 */}
      <View style={styles.bottomBackground}>
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navButton}>
            <Image source={require("../assets/main.png")} style={styles.navIcon} />
            <Text style={styles.navText}>메인</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.recordButton} onPress={() => navigation.navigate("Record")}>
            <Image source={require("../assets/record.png")} style={styles.recordIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("ApartScreen")}>
            <Image source={require("../assets/apartment_nav.png")} style={styles.navIcon} />
            <Text style={styles.navText}>아파트</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#83BCE7", // 상단 영역 배경 색
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SCREEN_WIDTH * 0.05,
    marginTop: SCREEN_HEIGHT * 0.05
  },
  coinContainer: {
    width: SCREEN_WIDTH * 0.24,
    height: SCREEN_WIDTH * 0.1,
    borderRadius: SCREEN_WIDTH * 0.03,
    backgroundColor: "rgba(217, 217, 217, 0.48)",
    flexDirection: "row",
    alignItems: "center",
  },
  coinIcon: {
    width: SCREEN_WIDTH * 0.07,
    height: SCREEN_WIDTH * 0.07,
    marginLeft: SCREEN_WIDTH * 0.02,
    marginRight: SCREEN_WIDTH * 0.02,
  },
  coinText: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: "bold",
    color: "#000",
    marginLeft: SCREEN_WIDTH * 0.02,
  },
  topIcons: {
    flexDirection: "row",
    gap: SCREEN_WIDTH * 0.05,
  },
  icon: {
    width: SCREEN_WIDTH * 0.1,
    height: SCREEN_WIDTH * 0.1,
  },
  logoutText: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: "bold",
    color: "red", // ✅ 로그아웃은 눈에 띄게 빨간색
  },
  content: {
    flex: 1,
  },
  dayText: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: "bold",
    marginBottom: SCREEN_HEIGHT * 0.02,
    color: "#000",
    position: "absolute",
    right: SCREEN_WIDTH * 0.05,
    top: SCREEN_HEIGHT * 0.001,
  },
  window: {
    width: SCREEN_WIDTH * 0.4,
    height: SCREEN_WIDTH * 0.4,
  },
  characterContainer: {
    position: "absolute",
    top: "90%",
    left: "46%",
    transform: [{ translateX: -SCREEN_WIDTH * 0.25 }, { translateY: -SCREEN_WIDTH * 0.25 }],
    zIndex: 10,
  },
  character: {
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5,
    resizeMode: "contain",
  },
  sofa: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.4,
    position: "absolute",
    top: "70%",
    left: "20%",
    zIndex: 9,
  },
  bottomBackground: {
    flex: 0.8,
    backgroundColor: "#D7E7F5", // 하단 영역 배경 색
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: SCREEN_HEIGHT * 0.08,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    paddingHorizontal: SCREEN_WIDTH * 0.15,
    paddingVertical: SCREEN_HEIGHT * 0.02,
  },
  navButton: {
    alignItems: "center",
  },
  navIcon: {
    width: SCREEN_WIDTH * 0.06,
    height: SCREEN_WIDTH * 0.08,
  },
  navText: {
    fontSize: SCREEN_WIDTH * 0.03,
    color: "#000",
  },
  recordButton: {
    alignItems: "center",
  },
  recordIcon: {
    width: SCREEN_WIDTH * 0.17,
    height: SCREEN_WIDTH * 0.17,
    marginBottom: SCREEN_HEIGHT * 0.02
  },
});