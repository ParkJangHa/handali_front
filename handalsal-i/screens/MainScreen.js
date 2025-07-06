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
  const [quoteVisible, setQuoteVisible] = useState(false);

  const quotes = [
    "오늘도 수고했어!",
    "한 걸음 한 걸음이 모여~",
    "성장하고 있어, 나도 너도!",
    "잠깐 쉬는 것도 괜찮아",
    "기록은 곧 힘이야!",
    "늦었다고 생각할 때가 진짜 너무 늦었다..",
    "오늘도 스스로를 위해 \n노력한 당신, 정말 멋져요!",
    "한 달 뒤 멋진 나를 기대해요!",
    "하루하루 쌓인 당신의 습관이,\n한달이의 날개가 되고 있어요!",
    "잠깐 쉬어도 괜찮아요. 중요한 건 \n다시 일어나는 당신의 마음이에요.",
    "오늘의 작은 실천이 내일의\n 큰 변화를 만들어요.",
    "포기하지 않는 당신을 한달이는\n 누구보다 자랑스러워해요!",
    "지금 이 순간도 당신은 성장하고 있어요.\n 느껴지지 않아도 괜찮아요.",
    "완벽하지 않아도 괜찮아요.\n 꾸준함이 당신을 빛나게 해요.",
    "오늘도 자기 자신을 위해 \n시간을 낸 당신, 정말 대단해요!",
    "슬픈 날도, 기쁜 날도 당신의 기록은\n 한달이에게 소중해요.",
    "한 걸음 느려도 괜찮아요. 멈추지 않는\n 당신이 최고예요.",
    "내일도 함께해요. 한달이는\n 항상 당신 편이에요.",
  ];

  const getRandomQuote = () => {
    const index = Math.floor(Math.random() * quotes.length);
    return quotes[index];
  };

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

        if (data.handali_img && characterImageMap[data.handali_img]) {
          setHandaliImage(characterImageMap[data.handali_img]);
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
      source={require("../assets/storeItems/배경없음.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.navigate("JobScreen")}>
            <Text>직업 획득</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={() => navigation.navigate("DexScreen")}>
            <Text 
            style={{ color: "#3258A5", fontFamily: "Jua-Regular", marginTop: 20 }}>
            도감 보기
            </Text>
          </TouchableOpacity> */}
         
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
                onPress={async () => {
                  await AsyncStorage.removeItem("tutorial_seen");
                  navigation.replace("TutorialScreen"); // 튜토리얼로 이동
                }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>튜토리얼 보기</Text>
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
          <TouchableOpacity
            style={styles.characterContainer}
            onPress={() => {
              setQuoteVisible(true);
              setTimeout(() => setQuoteVisible(false), 3000);
            }}
          >
            {quoteVisible && (
              <View style={styles.speechBubble}>
                <Text style={styles.speechText}>{getRandomQuote()}</Text>
              </View>
            )}
            <Image source={handaliImage} style={styles.character} />
          </TouchableOpacity>
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
  speechBubble: {
    position: "absolute",
    bottom: "100%",
    left: "50%",
    transform: [{ translateX: -wp("30%") }],
    width: wp("60%"),
    backgroundColor: "white",
    borderRadius: 10,
    padding: wp("3%"),
    borderWidth: 1,
    borderColor: "#aaa",
    zIndex: 5,
  },
  speechText: {
    fontSize: wp("3.5%"),
    textAlign: "center",
    color: "#333",
    fontFamily: "Jua-Regular",
  },
});