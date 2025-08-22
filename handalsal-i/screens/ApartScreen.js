import React, { useState, useEffect, useRef } from "react";
import BottomNav from "../components/BottomNav";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  FlatList,
  Image,
  ImageBackground,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";
import { characterImageMap } from "../utils/characterImageMap";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

// 층 배경 (열림/잠금 공통)
const floorImages = {
  occupied: require("../assets/apart/floor_open.png"),
  locked: require("../assets/apart/floor_lock.png"),
};

// 좌/우 화살표 아이콘 (이미지로 교체)
const arrowLeft = require("../assets/icons/arrow_left.png");
const arrowRight = require("../assets/icons/arrow_right.png");

// (선택) 메인 네비게이션 바가 별도 컴포넌트라면 이렇게 사용
// import MainBottomNav from "../components/MainBottomNav";

const ApartScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [apartments, setApartments] = useState([]); // 여러 아파트(동)
  const [selectedApartIndex, setSelectedApartindex] = useState(0); // 현재 선택된 동
  const flatListRef = useRef(null);

  // ---------- API ----------
  const fetchApartments = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      const response = await fetch(`${API_BASE_URL}/apartments`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 412) {
        Alert.alert("세션 만료", "로그인이 만료되었습니다. 다시 로그인해주세요.", [
          {
            text: "확인",
            onPress: async () => {
              await AsyncStorage.removeItem("authToken");
              navigation.navigate("Login");
            },
          },
        ]);
        return;
      }

      if (response.status === 404) {
        Alert.alert(
          "아파트 입주 이전 입니다.",
          "아파트에 입주한 한달이가 존재하지 않습니다.",
          [{ text: "메인 화면으로 돌아가기", onPress: () => navigation.navigate("MainScreen") }],
          { cancelable: false }
        );
        return;
      }

      const textResponse = await response.text();
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (e) {
        console.log("📌 JSON 파싱 오류:", e);
        Alert.alert("데이터 오류", "서버에서 올바른 JSON 데이터를 받지 못했습니다.");
        return;
      }

      // apart_id별 층 맵 구성
      const grouped = {};
      data.forEach((item) => {
        if (!grouped[item.apart_id]) grouped[item.apart_id] = {};
        grouped[item.apart_id][item.floor] = item;
      });

      // 12층 고정 배열(12 → 1)
      const formatted = Object.keys(grouped).map((apart_id) => ({
        apart_id,
        floors: Array.from({ length: 12 }, (_, index) => {
          const floorNumber = 12 - index;
          return (
            grouped[apart_id][floorNumber] || {
              apart_id,
              floor: floorNumber,
              nickname: null,
              start_date: null,
              job_name: null,
              week_salary: null,
              image: null,
              locked: true,
            }
          );
        }),
      }));

      setApartments(formatted);

      // 현재 연도와 일치하는 동이 있으면 우선 선택
      const currentYear = new Date().getFullYear();
      const currentYearIndex = formatted.findIndex((apt) =>
        apt.apart_id.toString().startsWith(currentYear.toString())
      );
      setSelectedApartindex(currentYearIndex !== -1 ? currentYearIndex : 0);
    } catch (error) {
      console.log("api 요청 실패", error);
    }
  };

  useEffect(() => {
    fetchApartments();
  }, []);

  // ---------- 자동 스크롤: 가장 높은 ‘열림’ 층으로 ----------
  const scrollToTopmostOpenFloor = () => {
    if (!flatListRef.current) return;
    const floors = apartments[selectedApartIndex]?.floors || [];
    if (floors.length === 0) return;

    const openFloors = floors.filter((f) => !!f.nickname);
    if (openFloors.length === 0) {
      // 열림층 없으면 최상단(12층, index 0)로 이동
      setTimeout(() => {
        flatListRef.current.scrollToIndex({ index: 0, animated: true });
      }, 200);
      return;
    }

    const maxOpenFloorNum = Math.max(...openFloors.map((f) => f.floor));
    const targetIndex = floors.findIndex((f) => f.floor === maxOpenFloorNum);
    if (targetIndex !== -1) {
      setTimeout(() => {
        flatListRef.current.scrollToIndex({ index: targetIndex, animated: true });
      }, 200);
    }
  };

  const getItemLayout = (_, index) => ({
    length: hp("30%"),
    offset: hp("30%") * index,
    index,
  });

  const onScrollToIndexFailed = (info) => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
    }, 250);
  };

  useFocusEffect(
    React.useCallback(() => {
      scrollToTopmostOpenFloor();
    }, [apartments, selectedApartIndex])
  );

  // ---------- 동 변경(오버레이 화살표) ----------
  const handlePrevApart = () => {
    if (selectedApartIndex > 0) setSelectedApartindex((v) => v - 1);
  };
  const handleNextApart = () => {
    if (selectedApartIndex < apartments.length - 1) setSelectedApartindex((v) => v + 1);
  };

  // ---------- 캐릭터 / 층 배경 ----------
  const getImageSource = (imageName) =>
    characterImageMap[imageName] || require("../assets/character/0,0,0.png");
  const getFloorBg = (item) => (item?.nickname ? floorImages.occupied : floorImages.locked);

  return (
    <View style={styles.container}>
      {/* 좌/우 화살표: 화면 중간 고정 오버레이 (스크롤과 무관) */}
      <View style={styles.arrowsOverlay} pointerEvents="box-none">
        <TouchableOpacity
          onPress={handlePrevApart}
          disabled={selectedApartIndex === 0}
          style={[styles.arrowImgBtn, selectedApartIndex === 0 && { opacity: 0.5 }]}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Image source={arrowLeft} style={styles.arrowImg} resizeMode="contain" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNextApart}
          disabled={selectedApartIndex === apartments.length - 1}
          style={[styles.arrowImgBtn, selectedApartIndex === apartments.length - 1 && { opacity: 0.5 }]}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Image source={arrowRight} style={styles.arrowImg} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* 리스트 (옥상 + 각 층) */}
      <FlatList
        ref={flatListRef}
        data={apartments[selectedApartIndex]?.floors || []}
        keyExtractor={(item) => item.floor.toString()}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={onScrollToIndexFailed}
        onContentSizeChange={scrollToTopmostOpenFloor}
        ListHeaderComponent={
          <View style={styles.rooftopWrap}>
            <Image
              source={require("../assets/apart/rooptop.png")}
              style={styles.rooftopImage}
              resizeMode="cover"
            />
            {/* 옥상 이미지 위 동 배너 */}
            <View style={styles.apartBanner}>
              <Text style={styles.apartBannerText}>
                {apartments.length > 0
                  ? `${apartments[selectedApartIndex].apart_id}동`
                  : "불러오는 중"}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemContainer}
            activeOpacity={0.9}
            onPress={() => {
              if (item.nickname) {
                setSelectedData(item);
                setModalVisible(true);
              }
            }}
          >
            <ImageBackground
              source={getFloorBg(item)}
              style={styles.floorBg}
              imageStyle={styles.floorBgImage}
              resizeMode="cover"
            >
              {/* 층 배지 */}
              <View style={styles.floorBadgeWrap}>
                <View style={styles.floorBadge}>
                  <Text style={styles.floorBadgeText}>{item.floor}층</Text>
                </View>
              </View>

              {/* 캐릭터: 열림층일 때만 */}
              {item.nickname && (
                <Image
                  style={styles.handaliImageOverlay}
                  source={getImageSource(item.image)}
                  resizeMode="contain"
                />
              )}
            </ImageBackground>

            {/* 층 구분 라인 */}
            <View style={styles.floorDivider} />
          </TouchableOpacity>
        )}
        contentContainerStyle={[styles.listContent, { paddingBottom: hp("10%") }]} // 바텀 네비 여백
        showsVerticalScrollIndicator={false}
      />
      <BottomNav navigation={navigation} active="Apart" mode="apart" />
      {/* 모달 */}
      {selectedData && (
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.detailContainer}>
              <Text style={styles.modalTitle}>{selectedData.floor}층</Text>
              <Text style={styles.modalText}>닉네임: {selectedData.nickname || "없음"}</Text>
              <Text style={styles.modalText}>시작일: {selectedData.start_date || "없음"}</Text>
              <Text style={styles.modalText}>직업명: {selectedData.job_name || "없음"}</Text>
              <Text style={styles.modalText}>
                주급: {selectedData.week_salary ? `${selectedData.week_salary} 코인` : "없음"}
              </Text>

              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};



export default ApartScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5EFE7" },

  // 중앙 오버레이 화살표
  arrowsOverlay: {
    position: "absolute",
    top: "45%",
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: wp("3.5%"),
  },
  arrowImgBtn: {
    width: wp("13%"),
    height: wp("13%"),
    alignItems: "center",
    justifyContent: "center",
  },

  arrowImg: {
    width: "100%",
    height: "100%",
  },
  arrowBtnDisabled: { opacity: 0.5 },
  arrowIcon: { width: "60%", height: "60%" },

  // 옥상 + 동 배너
  rooftopWrap: {
    backgroundColor: "#A66E38",
    position: "relative",
  },
  rooftopImage: { width: "100%", height: hp("50%") },
  apartBanner: {
    position: "absolute",
    bottom: hp("1.6%"),
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: wp("4.5%"),
    paddingVertical: hp("0.6%"),
    borderRadius: wp("4%"),
  },
  apartBannerText: {
    color: "#fff",
    fontSize: wp("5.2%"),
    fontFamily: "Jua-Regular",
  },

  // 리스트/층
  listContent: {},
  itemContainer: { backgroundColor: "#FFE98A" },
  floorBg: {
    height: hp("30%"),
    width: "100%",
    justifyContent: "flex-end",
  },
  floorBgImage: {},
  handaliImageOverlay: {
    width: wp("40%"),
    height: hp("18%"),
    alignSelf: "center",
    marginBottom: hp("2%"),
  },
  floorDivider: { backgroundColor: "#684626", height: hp("1%") },

  // 층 배지
  floorBadgeWrap: {
    position: "absolute",
    top: hp("1.2%"),
    alignSelf: "center",
  },
  floorBadge: {
    backgroundColor: "#FFE98A",
    borderRadius: wp("4%"),
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("0.4%"),
    borderWidth: 1,
    borderColor: "#603E2A",
  },
  floorBadgeText: { fontSize: wp("4.2%"), color: "#2b1a12", fontFamily: "Jua-Regular" },

  // 모달
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: wp("6%"),
  },
  detailContainer: {
    width: "100%",
    padding: wp("5%"),
    backgroundColor: "#fff",
    borderRadius: wp("2%"),
    alignItems: "flex-start",
  },
  modalTitle: { fontSize: wp("5.5%"), marginBottom: hp("1.5%"), fontFamily: "Jua-Regular" },
  modalText: { fontSize: wp("4.5%"), marginBottom: hp("0.8%"), fontFamily: "Jua-Regular" },
  closeButton: {
    marginTop: hp("2%"),
    backgroundColor: "#FFE98A",
    width: "100%",
    padding: hp("1.5%"),
    borderRadius: wp("10%"),
  },
  closeButtonText: { color: "black", alignSelf: "center", fontFamily: "Jua-Regular" },
});
