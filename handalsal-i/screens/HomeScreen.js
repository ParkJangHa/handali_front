import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
  Animated
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { authFetch } from "../utils/authFetch";

const HomeScreen = ({ navigation }) => {
  const [busy, setBusy] = useState(false);

  const blinkAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.25, duration: 600, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [blinkAnim]);

  const checkLoginAndRoute = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        navigation.navigate("Login");
        return;
      }

      // 현재 한달이 뷰 존재 확인
      const res = await authFetch(`${API_BASE_URL}/handalis/view`, { method: "GET" }, navigation);

      if (res.ok) {
        navigation.navigate("MainScreen");
        return;
      }

      if (res.status === 401) return;

      if (res.status === 404) {
        // view 없음 → 최근 한달이 확인
        try {
          const recentRes = await authFetch(`${API_BASE_URL}/handalis/recent`, { method: "GET" }, navigation);

          if (recentRes.ok) {
            const recent = await recentRes.json();
            navigation.navigate("JobScreen", { handaliId: recent.handali_id });
            return;
          }

          if (recentRes.status === 401) return;

          if (recentRes.status === 404) {
            navigation.navigate("Category");
            return;
          }

          // 기타 에러면 토큰 정리 후 로그인으로
          await AsyncStorage.multiRemove(["authToken", "refreshToken"]);
          navigation.navigate("Login");
          return;
        } catch (err) {
          console.error("최근 한달이 조회 오류:", err);
          navigation.navigate("Category");
          return;
        }
      }

      // 기타 상태코드 → 토큰 제거 후 로그인
      await AsyncStorage.multiRemove(["authToken", "refreshToken"]);
      navigation.navigate("Login");
    } catch (error) {
      console.error("진입 분기 오류:", error);
      Alert.alert("네트워크 오류", "잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }, [busy, navigation]);

  return (
    <Pressable style={styles.wrapper} onPress={checkLoginAndRoute}>
      <Image
        source={require("../assets/HomeScreen/Weve.png")}
        style={styles.background}
        resizeMode="stretch"
      />
      <View style={styles.container}>
        {/* 상단 이미지 */}
        <View style={styles.imgCon}>
          <Pressable
            onLongPress={async (e) => {
              e.stopPropagation();
              try {
                await AsyncStorage.removeItem("authToken");
                Alert.alert("개발용", "토큰이 제거되었습니다!");
              } catch (err) {
                console.error("토큰 제거 오류:", err);
              }
            }}
          >
            <Image
              source={require("../assets/HomeScreen/Blue.png")}
              style={styles.catIcon}
              resizeMode="contain"
            />
          </Pressable>
          <Image
            source={require("../assets/HomeScreen/crab.png")}
            style={styles.crabImg}
          />
          <Image
            source={require("../assets/HomeScreen/turtle.png")}
            style={styles.turtleImg}
          />
        </View>

        {/* (버튼 제거) 타이틀/간단 안내 문구만 유지 가능 */}
        <View style={styles.titleCon}>
          <Animated.Text style={[styles.tapText, { opacity: blinkAnim }]}>
            화면을 터치해주세요!
          </Animated.Text>
          <Text style={styles.engText}>Touch The Screen!</Text>
        </View>
      </View>

      {/* 하단 버전 정보 */}
      <View style={styles.versionBox}>
        <Text style={styles.versionText}>v1.0.0</Text>
      </View>

      {/* 로딩 오버레이 */}
      {busy && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#8BE1FC",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: hp("5%"),
    zIndex: 1,
  },
  background: {
    position: "absolute",
    top: 0,
    width: wp("100%"),
    height: hp("75%"),
    zIndex: 0,
  },
  imgCon: {
    height: hp("20%"),
    marginTop: hp("5%"),
  },
  turtleImg: {
    width: wp("14%"),
    height: hp("9%"),
    resizeMode: "contain",
    top: hp("-10%"),
    left: wp("-35%"),
  },
  crabImg: {
    width: wp("14%"),
    height: hp("9%"),
    resizeMode: "contain",
    top: hp("27%"),
    left: wp("35%"),
  },
  titleCon: {
    height: hp("18%"),
    alignItems: "center",
    justifyContent: "flex-start",
    gap: hp("2%"),
  },
  tapText: {
    fontSize: 16,
    color: "#4F4F4F",
    fontFamily: "Jua-Regular",
    opacity: 1,
  },
  engText: {
    fontSize: 14,
    color: "#FFF4F4",
    fontFamily: "Jua-Regular",
    opacity: 1,
  },
  catIcon: {
    position: "absolute",
    top: hp("5%"),
    width: wp("55%"),
    height: hp("25%"),
    resizeMode: "contain",
    alignSelf: "center",
    zIndex: 2,
  },
  versionBox: {
    position: "absolute",
    bottom: hp("1.5%"),
    width: "100%",
    alignItems: "center",
  },
  versionText: {
    color: "#999",
    fontSize: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;
