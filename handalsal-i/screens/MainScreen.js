import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";
import { useFocusEffect } from "@react-navigation/native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const imageMap = {
  "푹신한_소파": require("../assets/storeItems/푹신한_소파.png"),
  "철_창문": require("../assets/storeItems/철_창문.png"),
  default: require("../assets/default.png"),
  "image_0_0_0.png": require("../assets/0,0,0.png"),
  "image_0_0_1.png": require("../assets/0,0,1.png"),
  "image_0_1_0.png": require("../assets/0,1,0.png"),
  "image_0_1_1.png": require("../assets/0,1,1.png"),
  "image_1_0_0.png": require("../assets/1,0,0.png"),
  "image_1_0_1.png": require("../assets/1,0,1.png"),
  "image_1_1_0.png": require("../assets/1,1,0.png"),
  "image_1_1_1.png": require("../assets/1,1,1.png"),
  "default_character.png": require("../assets/default_character.png"),
};

export default function MainScreen({ navigation }) {
  const [nickname, setNickname] = useState("");
  const [daysSinceCreated, setDaysSinceCreated] = useState(0);
  const [totalCoin, setTotalCoin] = useState(0);
  const [handaliImage, setHandaliImage] = useState(imageMap["default_character.png"]);
  const [appliedItems, setAppliedItems] = useState({
    소파: null,
    배경: null,
    벽장식: null,
    바닥장식: null,
  });

  const intervalRef = useRef(null);

  const fetchHandaliStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("세션 만료", "다시 로그인해주세요.");
        navigation.navigate("Login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/handalis/view`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setNickname(data.nickname);
        setDaysSinceCreated(data.days_since_created);
        setTotalCoin(data.total_coin);

        const matchedImage = imageMap[data.image];
        setHandaliImage(matchedImage || imageMap["default_character.png"]);
      } else if (response.status === 404) {
        navigation.navigate("CategorySelectScreen");
      } else if (response.status === 412) {
        Alert.alert("세션이 만료되었습니다.", "재로그인이 필요합니다.");
        navigation.navigate("Login");
      }
    } catch (error) {
      Alert.alert("오류", "네트워크 오류가 발생했습니다.");
      setHandaliImage(imageMap["default_character.png"]);
    }
  };

  const fetchAppliedItems = async () => {
    try {
      const categories = ["소파", "배경", "벽장식", "바닥장식"];
      const result = {};
      for (const cat of categories) {
        const name = await AsyncStorage.getItem(`appliedItem-${cat}`);
        result[cat] = name;
      }
      setAppliedItems(result);
    } catch (e) {
      console.error("적용 아이템 불러오기 실패:", e);
    }
  };

  const handleLogout = async () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "확인",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("authToken");
            if (token) {
              await fetch(`${API_BASE_URL}/logout`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
              });
            }
          } catch (e) {}
          await AsyncStorage.removeItem("authToken");
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        },
      },
    ]);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchHandaliStatus();
      fetchAppliedItems();
      intervalRef.current = setInterval(fetchHandaliStatus, 60000);
      return () => clearInterval(intervalRef.current);
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* 상단 바 */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate("JobScreen")}>
          <Text>직업 획득</Text>
        </TouchableOpacity>

        <View style={styles.coinContainer}>
          <Image source={require("../assets/coin.png")} style={styles.coinIcon} />
          <Text style={styles.coinText}>{totalCoin}</Text>
        </View>

        <View style={styles.topIcons}>
          <TouchableOpacity onPress={() => navigation.navigate("Store")}>
            <Image source={require("../assets/store.png")} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 콘텐츠 */}
      <View style={styles.content}>
        <Text style={styles.dayText}>
          {daysSinceCreated}일차, {nickname || "별명 없음"}
        </Text>

        {/* 벽장식 자리 */}
        {appliedItems["벽장식"] && (
          <Image
            source={imageMap[appliedItems["벽장식"].replace(/ /g, "_")] || imageMap.default}
            style={styles.window}
          />
        )}

        {/* 캐릭터 */}
        <View style={styles.characterContainer}>
          <Image source={handaliImage} style={styles.character} />
        </View>

        {/* 소파 자리 */}
        {appliedItems["소파"] && (
          <Image
            source={imageMap[appliedItems["소파"].replace(/ /g, "_")] || imageMap.default}
            style={styles.sofa}
          />
        )}
      </View>

      {/* 하단 네비게이션 */}
      <View style={styles.bottomBackground}>
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navButton}>
            <Image source={require("../assets/main.png")} style={styles.navIcon} />
            <Text style={styles.navText}>메인</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.recordButton}
            onPress={() => navigation.navigate("Record")}
          >
            <Image source={require("../assets/record.png")} style={styles.recordIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate("ApartScreen")}
          >
            <Image source={require("../assets/apartment_nav.png")} style={styles.navIcon} />
            <Text style={styles.navText}>아파트</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F1F1" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SCREEN_WIDTH * 0.05,
    marginTop: SCREEN_HEIGHT * 0.05,
  },
  coinContainer: {
    width: SCREEN_WIDTH * 0.35,
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
  topIcons: { flexDirection: "row", gap: SCREEN_WIDTH * 0.05 },
  icon: { width: SCREEN_WIDTH * 0.076, height: SCREEN_WIDTH * 0.07 },
  logoutText: { fontSize: SCREEN_WIDTH * 0.04, fontWeight: "bold", color: "red" },
  content: { flex: 1 },
  dayText: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: "bold",
    color: "#000",
    position: "absolute",
    right: SCREEN_WIDTH * 0.05,
    top: SCREEN_HEIGHT * 0.001,
  },
  characterContainer: {
    position: "absolute",
    top: "20%",
    left: "10%",
    transform: [
      { translateX: -SCREEN_WIDTH * 0.25 },
      { translateY: -SCREEN_WIDTH * 0.35 },
    ],
    zIndex: -1,
  },
  character: {
    width: SCREEN_WIDTH * 1.3,
    height: SCREEN_HEIGHT * 1,
    resizeMode: "contain",
  },
  sofa: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.4,
    position: "absolute",
    top: "70%",
    left: "20%",
    zIndex: -2,
  },
  window: {
    width: SCREEN_WIDTH * 0.4,
    height: SCREEN_WIDTH * 0.3,
    position: "absolute",
    top: "40%",
    left: "10%",
    zIndex: -2,
  },
  bottomBackground: {
    flex: 0.8,
    backgroundColor: "#DFAA76",
    zIndex: -3,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: SCREEN_HEIGHT * 0.08,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#DFAA76",
    paddingHorizontal: SCREEN_WIDTH * 0.15,
    paddingVertical: SCREEN_HEIGHT * 0.02,
  },
  navButton: { alignItems: "center" },
  navIcon: {
    width: SCREEN_WIDTH * 0.08,
    height: SCREEN_WIDTH * 0.08,
  },
  navText: {
    fontSize: SCREEN_WIDTH * 0.03,
    color: "#000",
  },
  recordButton: { alignItems: "center" },
  recordIcon: {
    width: SCREEN_WIDTH * 0.19,
    height: SCREEN_WIDTH * 0.17,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
});