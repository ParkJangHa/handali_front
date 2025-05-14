import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  ImageBackground
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";
import { useFocusEffect } from "@react-navigation/native";
import { characterImageMap } from "../utils/characterImageMap";
import { storeItemImageMap } from "../utils/storeItemImageMap";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";


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
      if (response.status === 401) {
        await AsyncStorage.removeItem("authToken");
        Alert.alert("세션 만료", "로그인이 만료되었습니다. 다시 로그인해주세요.");
        navigation.navigate("Login");
        return;
      }

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
          
            {/* 캐릭터 */}
          <View style={styles.characterContainer}>
            <Image source={handaliImage} style={styles.character} />
          </View>
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
    width: wp('100%'),
    height: hp('100%'),
  },
  container: {
    flex: 1,
    position: 'relative',
    marginBottom: hp("2%"),
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: wp('5%'),
    marginTop: hp('5%'),
  },
  coinContainer: {
    width: wp('35%'),
    height: wp('10%'),
    borderRadius: wp('3%'),
    backgroundColor: "rgba(217, 217, 217, 0.48)",
    flexDirection: "row",
    alignItems: "center",
  },
  coinIcon: {
    width: wp('7%'),
    height: wp('7%'),
    marginLeft: wp('2%'),
    marginRight: wp('2%'),
  },
  coinText: {
    fontSize: hp('2.2%'),
    color: "#000",
    marginLeft: wp('2%'),
    fontFamily: "Jua-Regular",
  },
  topIcons: {
    flexDirection: "row",
    gap: wp('5%'),
  },
  icon: {
    width: wp('10%'),
    height: wp('10%'),
  },
  buttonText: {
    fontSize: wp('4%'),
    color: "red",
    fontFamily: "Jua-Regular",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    width: wp('70%'),
    backgroundColor: "#fff",
    borderRadius: wp('2%'),
    padding: wp('5%'),
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "black",
    alignSelf: "center",
    fontFamily: "Jua-Regular",
  },
  modalCloseButton: {
    marginTop: hp('2%'),
    backgroundColor: "#FFE98A",
    width: "100%",
    padding: hp('1.5%'),
    borderRadius: wp('10%'),
  },
  content: {
    flex: 1,
  },
  dayText: {
    fontSize: wp('5%'),
    color: "#000",
    position: "absolute",
    right: wp('5%'),
    top: hp('1%'),
    fontFamily: "Jua-Regular",
  },
  characterContainer: {
    position: "absolute",
    top: "27.5%",
    left: "10%",
    transform: [
      { translateX: wp('11%') },
      { translateY: wp('35%') },
    ],
    zIndex: 2,
  },
  character: {
    width: wp('60%'),
    height: hp('30%'),
    resizeMode: "contain",
  },
  sofa: {
    width: wp('100%'),
    height: wp('60%'),
    position: "absolute",
    top: hp('38%'),
    left: wp('26%'),
    zIndex: 1,
    resizeMode: "contain",
  },
  chair: {
    width: wp('50%'),
    height: wp('40%'),
    position: "absolute",
    top: hp('40%'),
    left: wp('60%'),
    zIndex: 1,
    resizeMode: "contain",
  },
  window: {
    width: wp('40%'),
    height: wp('30%'),
    position: "absolute",
    top: hp('20%'),
    left: wp('5%'),
    resizeMode: "contain",
  },
  floor: {
    width: wp('50%'),
    height: wp('50%'),
    position: "absolute",
    top: hp('40%'),
    left: wp('-10%'),
    resizeMode: "contain",
  },
  bottomNav: {
    position: "absolute",
    bottom: hp('1.5%'),
    width: "100%",
    height: hp('8%'),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp('15%'),
    paddingVertical: hp('2%'),
    zIndex: 4,
  },
  navButton: {
    alignItems: "center",
  },
  navIcon: {
    width: wp('8%'),
    height: wp('8%'),
  },
  navText: {
    fontSize: wp('3%'),
    color: "#2D5D6B",
    fontFamily: "Jua-Regular",
  },
  recordButton: {
    alignItems: "center",
  },
  recordIcon: {
    width: wp('19%'),
    height: wp('17%'),
    marginBottom: hp('2%'),
  },
});