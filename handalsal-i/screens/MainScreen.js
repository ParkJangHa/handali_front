import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  ImageBackground
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";
import { useFocusEffect } from "@react-navigation/native";
import { characterImageMap } from "../utils/characterImageMap";
import { storeItemImageMap } from "../utils/storeItemImageMap";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function MainScreen({ navigation }) {
  const [nickname, setNickname] = useState("");
  const [daysSinceCreated, setDaysSinceCreated] = useState(0);
  const [totalCoin, setTotalCoin] = useState(0);
  const [handaliImage, setHandaliImage] = useState(characterImageMap["default_character.png"]);
  const [appliedItems, setAppliedItems] = useState({
    소파: null,
    배경: null,
    벽장식: null,
    바닥장식: null,
  });

  const intervalRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);

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

        if (data.image && characterImageMap[data.image]) {
          setHandaliImage(characterImageMap[data.image]);
        } else {
          setHandaliImage(characterImageMap["default_character.png"]);
        }

        const applied = {
          소파: data.sofa_img?.includes("none") ? null : data.sofa_img,
          배경: data.background_img?.includes("none") ? null : data.background_img,
          벽장식: data.wall_img?.includes("none") ? null : data.wall_img,
          바닥장식: data.floor_img?.includes("none") ? null : data.floor_img,
        };
        setAppliedItems(applied);
      } else if (response.status === 404) {
        checkLastHandali();
      } else {
        Alert.alert("오류", `오류 코드: ${response.status}`);
      }
    } catch (error) {
      console.error("한달이 상태 조회 오류:", error);
      Alert.alert("오류", "네트워크 오류가 발생했습니다.");
      setHandaliImage(characterImageMap["default_character.png"]);
    }
  };

  const checkLastHandali = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/handalis/recent`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        navigation.navigate("JobScreen", { handaliId: data.handali_id });
      } else if (response.status === 404) {
        navigation.navigate("CategorySelectScreen");
      } else {
        Alert.alert("오류", "서버 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("마지막 생성된 한달이 조회 오류:", error);
      navigation.navigate("CategorySelectScreen");
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
          } catch (e) { }
          await AsyncStorage.removeItem("authToken");
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    const confirm = await new Promise((resolve) => {
      Alert.alert(
        "회원 탈퇴",
        "정말로 탈퇴하시겠습니까?",
        [
          { text: "취소", style: "cancel", onPress: () => resolve(false) },
          { text: "탈퇴", style: "destructive", onPress: () => resolve(true) },
        ],
        { cancelable: true }
      );
    });

    if (!confirm) return;

    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        Alert.alert("탈퇴 완료", "정상적으로 탈퇴되었습니다.");
        await AsyncStorage.removeItem("authToken");
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      } else {
        const text = await response.text();
        Alert.alert("에러", `탈퇴 실패: ${text}`);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("에러", "네트워크 오류가 발생했습니다.");
    }
  };


  useFocusEffect(
    React.useCallback(() => {
      fetchHandaliStatus();
      intervalRef.current = setInterval(fetchHandaliStatus, 60000);
      return () => clearInterval(intervalRef.current);
    }, [])
  );

  return (
    <ImageBackground
      source={require("../assets/storeItems/배경없음.png")} // 배경 이미지 경로
      style={styles.background}
      resizeMode="cover" // 또는 "stretch" 또는 "contain" 등 상황에 맞게
    >
      <View style={styles.container}>
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
              <Image source={require("../assets/store_v2.png")} style={styles.icon} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Image source={require("../assets/settings.png")} style={styles.icon} />
            </TouchableOpacity>

          </View>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <TouchableOpacity onPress={handleLogout} style={styles.button}>
                <Text style={styles.buttonText}>로그아웃</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteAccount} style={styles.button}>
                <Text style={styles.buttonText}>회원탈퇴</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalVisible(false)} // 모달 닫기
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={styles.content}>
          <Text style={styles.dayText}>
            {daysSinceCreated}일차, {nickname || "별명 없음"}
          </Text>

          {/* 벽장식 */}
          {appliedItems["벽장식"] && (
            <Image
              source={storeItemImageMap[appliedItems["벽장식"].replace(/ /g, "_")] || storeItemImageMap.default}
              style={styles.window}
            />
          )}

          {appliedItems["바닥장식"] && (
            <Image
              source={storeItemImageMap[appliedItems["바닥장식"].replace(/ /g, "_")] || storeItemImageMap.default}
              style={styles.floor}
            />
          )}

          {/* 캐릭터 */}
          <View style={styles.characterContainer}>
            <Image source={handaliImage} style={styles.character} />
          </View>

          {/* 소파 */}
          {appliedItems["소파"] && (
            <Image
              source={storeItemImageMap[appliedItems["소파"].replace(/ /g, "_")] || storeItemImageMap.default}
              style={
                appliedItems["소파"].includes("의자")
                  ? styles.chair
                  : styles.sofa
              }
            />
          )}
        </View>

        {/* <View style={styles.bottomBackground}></View> */}

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Summary")} >
            <Image source={require("../assets/summary.png")} style={styles.navIcon} />
            <Text style={styles.navText}>기록소</Text>
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  container: { flex: 1, position: 'relative', },
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
    // fontWeight: "bold",
    color: "#000",
    marginLeft: SCREEN_WIDTH * 0.02,
    fontFamily: "Jua-Regular"
  },
  topIcons: {
    flexDirection: "row", gap: SCREEN_WIDTH * 0.05,
    // backgroundColor: 'red',
  },
  icon: { width: SCREEN_WIDTH * 0.1, height: SCREEN_WIDTH * 0.1 },
  buttonText: { fontSize: SCREEN_WIDTH * 0.04, color: "red", fontFamily: "Jua-Regular" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    width: 250,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "black",
    // fontWeight: "bold",
    alignSelf: "center",
    fontFamily: "Jua-Regular"
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: "#FFE98A",
    width: "100%",
    padding: 10,
    borderRadius: 30,
  },
  modalCloseButtonText: {
    color: "black",
    // fontWeight: "bold",
    alignSelf: "center",
    fontFamily: "Jua-Regular",
  },
  content: { flex: 1 },
  dayText: {
    fontSize: SCREEN_WIDTH * 0.05,
    // fontWeight: "bold",
    color: "#000",
    position: "absolute",
    right: SCREEN_WIDTH * 0.05,
    top: SCREEN_HEIGHT * 0.001,
    fontFamily: "Jua-Regular"
  },
  characterContainer: {
    position: "absolute",
    top: "20.5%",
    left: "10%",
    transform: [
      { translateX: SCREEN_WIDTH * 0.11 },
      { translateY: SCREEN_WIDTH * 0.35 },
    ],
    zIndex: 2,
  },
  character: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_HEIGHT * 0.3,
    resizeMode: "contain",
  },
  sofa: {
    width: SCREEN_WIDTH * 1,
    height: SCREEN_WIDTH * 0.6,
    position: "absolute",
    top: "40%",
    left: "26%",
    zIndex: 1,
    resizeMode: "contain",
  },
  chair: {
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.4,
    position: "absolute",
    top: "40%",
    left: "60%",
    zIndex: 1,
    resizeMode: "contain",
  },
  window: {
    width: SCREEN_WIDTH * 0.4,
    height: SCREEN_WIDTH * 0.3,
    position: "absolute",
    top: "20%",
    left: "5%",
    // zIndex: 2,
    resizeMode: "contain",
  },
  floor: {
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5,
    position: "absolute",
    top: "40%",
    left: "-10%",
    // zIndex: 2,
    resizeMode: "contain",
  },
  // bottomBackground: {
  //   flex: 0.8,
  //   backgroundColor: "#DFAA76",
  //   zIndex: 0,
  // },
  bottomNav: {
    position: "absolute",
    bottom: SCREEN_HEIGHT * 0.015,
    width: "100%",
    height: SCREEN_HEIGHT * 0.08,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // backgroundColor: "#DFAA76",
    paddingHorizontal: SCREEN_WIDTH * 0.15,
    paddingVertical: SCREEN_HEIGHT * 0.02,
    zIndex: 4,
  },
  navButton: { alignItems: "center" },
  navIcon: {
    width: SCREEN_WIDTH * 0.08,
    height: SCREEN_WIDTH * 0.08,
  },
  navText: {
    fontSize: SCREEN_WIDTH * 0.03,
    color: "#2D5D6B",
    fontFamily: "Jua-Regular"
  },
  recordButton: { alignItems: "center" },
  recordIcon: {
    width: SCREEN_WIDTH * 0.19,
    height: SCREEN_WIDTH * 0.17,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
});