import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Text,
  Alert,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";
import { characterImageMap } from "../utils/characterImageMap";
import { storeItemImageMap } from "../utils/storeItemImageMap";
import PreviewView from "../utils/PreviewView";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const categories = ["소파", "배경", "벽장식", "바닥장식"];
const categoryIcons = {
  소파: require("../assets/icons/Store_Furniture.png"),
  배경: require("../assets/icons/Store_Background.png"),
  벽장식: require("../assets/icons/Store_Window.png"),
  바닥장식: require("../assets/icons/Store_Clock.png"),
};

export default function StoreScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState("소파");
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [totalCoin, setTotalCoin] = useState(0);
  const [selectedTopButton, setSelectedTopButton] = useState("background");
  const [currentAppliedName, setCurrentAppliedName] = useState("");
  const itemTypeMap = {
    소파: "SOFA",
    배경: "BACKGROUND",
    벽장식: "WALL",
    바닥장식: "FLOOR",
  };
  const [characterImage, setCharacterImage] = useState(characterImageMap["default_character.png"]);
  const [previewItems, setPreviewItems] = useState({
    소파: null,
    배경: null,
    벽장식: null,
    바닥장식: null,
  });



  useEffect(() => {
    fetchItems();
    fetchTotalCoin();
    fetchAppliedItem();
  }, [selectedTab]);

  const fetchItems = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const mappedType = itemTypeMap[selectedTab];
      const response = await fetch(`${API_BASE_URL}/store/view?itemType=${mappedType}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        await AsyncStorage.removeItem("authToken");
        Alert.alert("세션 만료", "로그인이 만료되었습니다. 다시 로그인해주세요.");
        navigation.navigate("Login");
        return;
      }

      const text = await response.text();
      const data = JSON.parse(text);
      console.log("📌 selectedTab:", selectedTab);
      console.log("📌 itemTypeMap[selectedTab]:", itemTypeMap[selectedTab]);
      console.log("📌 응답받은 전체 아이템 목록:", data.map((item, idx) => `${idx}: ${item.name}`));
      console.log("📌 imageSource 확인:", data.map((item) => {
        const key = item.name.replace(/ /g, "_");
        return { name: item.name, key, imageExists: !!storeItemImageMap[key] };
      }));

      if (response.ok) {
        setItems(data);
      } else {
        setItems([]);
        Alert.alert("조회 실패", data.message || "아이템을 불러올 수 없습니다.");
      }
    } catch (error) {
      console.error("fetchItems 오류:", error);
      Alert.alert("네트워크 오류", "인터넷 연결 또는 서버 응답을 확인해주세요.");
    }
  };


  const fetchTotalCoin = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/handalis/view`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setTotalCoin(data.total_coin);
    } catch (error) {
      console.error("코인 조회 실패:", error);
    }
  };

  const handleItemPress = (item) => {
    if (selectedItem === item.storeId) {
      setCurrentItem(item);
      setModalVisible(true);
    } else {
      setSelectedItem(item.storeId);
      setPreviewItems((prev) => ({
        ...prev,
        [selectedTab]: item.name.includes("없음") ? null : item.name,
      }));
    }
  };

  const fetchAppliedItem = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/handalis/view`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok) {
        // ✅ 캐릭터 이미지 설정
        if (data.image && characterImageMap[data.image]) {
          setCharacterImage(characterImageMap[data.image]);
        } else {
          setCharacterImage(characterImageMap["default_character.png"]);
        }

        // ✅ previewItems 상태 초기화
        setPreviewItems({
          소파: data.sofa_img?.includes("none") ? null : data.sofa_img,
          배경: data.background_img?.includes("none") ? null : data.background_img,
          벽장식: data.wall_img?.includes("none") ? null : data.wall_img,
          바닥장식: data.floor_img?.includes("none") ? null : data.floor_img,
        });

        // ✅ 현재 탭에 따라 적용된 이름 저장
        let appliedName = "";
        if (selectedTab === "소파") {
          appliedName = data.sofa_img;
        } else if (selectedTab === "배경") {
          appliedName = data.background_img;
        } else if (selectedTab === "벽장식") {
          appliedName = data.wall_img;
        } else if (selectedTab === "바닥장식") {
          appliedName = data.floor_img;
        }

        setCurrentAppliedName(appliedName?.includes("none") ? "" : appliedName);
      }
    } catch (error) {
      console.error("적용 아이템 조회 실패:", error);
    }
  };

  // const handleBuyItem = async () => {
  //   try {
  //     const token = await AsyncStorage.getItem("authToken");

  //     if (currentItem.buy) {
  //       handleApplyItem();
  //       return;
  //     }

  //     // ✅ 여기 디버깅 로그 추가
  //     console.log("구매 요청 URL:", `${API_BASE_URL}/store/buy`);
  //     console.log("요청 body 데이터:", {
  //       item_type: itemTypeMap[selectedTab],
  //       name: currentItem.name,
  //     });

  //     const response = await fetch(`${API_BASE_URL}/store/buy`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({
  //         item_type: itemTypeMap[selectedTab],
  //         name: currentItem.name,
  //       }),
  //     });
  //     const text = await response.text();

  //     // ✅ 응답 받은 결과 로그 추가
  //     console.log("서버 응답 결과:", text);

  //     if (response.ok) {
  //       Alert.alert("구매 완료", "아이템을 구매했습니다!");
  //       setModalVisible(false);
  //       fetchItems();
  //       fetchTotalCoin();
  //       setCurrentItem({ ...currentItem, buy: true });
  //     } else if (text.includes("코인이 부족합니다")) {
  //       Alert.alert("구매 실패", "코인이 부족합니다.");
  //     } else if (text.includes("이미 구매한 아이템입니다")) {
  //       Alert.alert("구매 실패", "이미 구매한 아이템입니다.");
  //     } else {
  //       Alert.alert("에러", text || "예상치 못한 오류가 발생했습니다.");
  //     }
  //   } catch (error) {
  //     console.error("handleBuyItem 오류:", error); // ✅ 여기 추가
  //     Alert.alert("오류", "네트워크 오류가 발생했습니다.");
  //   }
  // };

  const handleBuyItem = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      // 1. 이미 구매한 아이템이면, 기존처럼 적용만 실행합니다.
      if (currentItem.buy) {
        handleApplyItem();
        return;
      }

      // 2. (신규 구매) 아이템 구매 API를 호출합니다.
      const buyResponse = await fetch(`${API_BASE_URL}/store/buy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_type: itemTypeMap[selectedTab],
          name: currentItem.name,
        }),
      });

      // 3. 구매에 실패하면, 원인을 알리고 함수를 종료합니다.
      if (!buyResponse.ok) {
        const text = await buyResponse.text();
        if (text.includes("코인이 부족합니다")) {
          Alert.alert("구매 실패", "코인이 부족합니다.");
        } else if (text.includes("이미 구매한 아이템입니다")) {
          Alert.alert("구매 실패", "이미 구매한 아이템입니다.");
        } else {
          Alert.alert("구매 에러", text || "예상치 못한 오류가 발생했습니다.");
        }
        return; // 여기서 함수를 중단합니다.
      }

      // 4. 구매 성공! 이어서 아이템 적용 API를 호출합니다.
      const applyResponse = await fetch(`${API_BASE_URL}/store/set`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_type: itemTypeMap[selectedTab],
          name: currentItem.name,
        }),
      });

      // 5. 적용까지 성공했을 때의 처리
      if (applyResponse.ok) {
        Alert.alert("구매 및 적용 완료", "아이템을 구매하고 바로 적용했습니다!");
      } else {
        // 6. 구매는 성공했지만 적용에 실패했을 때의 처리
        const text = await applyResponse.text();
        Alert.alert(
          "구매 완료, 적용 실패",
          `아이템은 구매했지만 적용에 실패했습니다: ${text}`
        );
      }

      // 7. 모든 과정이 끝나면 모달을 닫고, 최신 정보를 다시 불러옵니다.
      setModalVisible(false);
      fetchItems();       // 아이템 목록 갱신 (구매 상태 변경)
      fetchTotalCoin();   // 코인 갱신
      fetchAppliedItem(); // 적용 상태 갱신

    } catch (error) {
      console.error("handleBuyItem 오류:", error);
      Alert.alert("오류", "네트워크 오류가 발생했습니다.");
    }
  };

  const handleApplyItem = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/store/set`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_type: itemTypeMap[selectedTab],
          name: currentItem.name,
        }),
      });

      const text = await response.text();

      if (response.ok) {
        Alert.alert("적용 완료", "아이템이 적용되었습니다.");
        setModalVisible(false);
        fetchItems();
        fetchItems();
        fetchAppliedItem();
      } else {
        Alert.alert("적용 실패", text || "서버 오류가 발생했습니다.");
      }
    } catch (error) {
      Alert.alert("오류", "네트워크 오류가 발생했습니다.");
    }
  };

  const renderItem = ({ item }) => {
    const isNoneItem = [
      "배경없음",
      "소파없음",
      "벽장식없음",
      "바닥장식없음"
    ].includes(item.name);
    const imageName = item.name.replace(/ /g, "_");
    const imageSource = storeItemImageMap[imageName] || storeItemImageMap.default;

    return (
      <TouchableOpacity
        style={[styles.itemBox, selectedItem === item.storeId && styles.itemBoxSelected]}
        onPress={() => handleItemPress(item)}
      >
        {/* ✅ 아이템 이미지 + 체크 아이콘 감싸는 View */}
        <View style={{ position: "relative", width: 35, height: 35 }}>
          {isNoneItem ? (
            <Text style={styles.noneText}>없음</Text> // ← 글자 표시
          ) : (
            <Image source={imageSource} style={styles.itemImage} />
          )}
          {/* ✅ 현재 적용된 아이템이면 체크 아이콘 표시 */}
          {currentAppliedName === item.name && (
            <Image
              source={require("../assets/storeItems/check.png")} // 체크 아이콘 경로
              style={{
                position: "absolute",
                width: 16,
                height: 16,
                bottom: -5, // 아이템 이미지 바로 아래 살짝
                right: -5,  // 오른쪽
              }}
            />
          )}
        </View>

        {/* 구매 안했으면 가격 표시 */}
        {!item.buy && (
          <View style={styles.priceTag}>
            <Image source={require("../assets/icons/coin.png")} style={styles.coinIcon} />
            <Text style={styles.priceText}>{item.price}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("MainScreen")}>
          <Image source={require("../assets/x.png")} style={styles.closeIcon} />
        </TouchableOpacity>
        <View style={styles.coinWrapper}>
          <Image source={require("../assets/icons/coin.png")} style={styles.coinIcon} />
          <Text style={styles.coinText}>{totalCoin}</Text>
        </View>
      </View>

      <View style={styles.backgroundArea}>
        <PreviewView characterImage={characterImage} appliedItems={previewItems} />
        {/* <View style={styles.rightButtons}>
          <TouchableOpacity onPress={() => setSelectedTopButton("background")}>
            <Image source={require("../assets/bg_Icon.png")}
              style={[styles.smallIcon, selectedTopButton === "background" && styles.selectedSmallIcon]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedTopButton("character")}>
            <Image source={require("../assets/ch_Icon.png")}
              style={[styles.smallIcon, selectedTopButton === "character" && styles.selectedSmallIcon]} />
          </TouchableOpacity>
        </View> */}
      </View>

      <View style={styles.itemContainer}>
        <View style={styles.tabContainer}>
          {categories
            .filter((cat) => cat !== "배경")
            .map((cat) => (
              <TouchableOpacity key={cat} onPress={() => setSelectedTab(cat)}>
                <Image source={categoryIcons[cat]} style={[styles.tabIcon, selectedTab === cat && styles.selectedTabIcon]} />
              </TouchableOpacity>
            ))}
        </View>

        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.storeId.toString()}
          numColumns={3}
          contentContainerStyle={styles.itemList}
        />
      </View>

      {currentItem && (
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              {/* ✅ 아이템 이미지 + 적용 체크 표시 */}
              <View style={{ position: "relative", width: 80, height: 80, marginBottom: 10 }}>
                <Image
                  source={storeItemImageMap[currentItem.name.replace(/ /g, "_")] || storeItemImageMap.default}
                  style={{ width: 80, height: 80, resizeMode: "contain" }}
                />
                {/* ✅ 현재 적용된 아이템이면 체크 이미지 띄우기 */}
                {currentAppliedName === currentItem.name && (
                  <Image
                    source={require("../assets/storeItems/check.png")}
                    style={{
                      position: "absolute",
                      width: 24,
                      height: 24,
                      bottom: 0,
                      right: 0,
                    }}
                  />
                )}
              </View>

              {/* 가격 표시 */}
              {!currentItem.buy && (
                <View style={[styles.priceTag, { marginBottom: 12 }]}>
                  <Image source={require("../assets/icons/coin.png")} style={styles.coinIcon} />
                  <Text style={styles.priceText}>{currentItem.price}</Text>
                </View>
              )}

              {/* 버튼들 */}
              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={styles.modalButton} onPress={handleBuyItem}>
                  <Text style={styles.modalButtonText}>
                    {currentItem.buy ? "적용" : "구매"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalButtonText}>닫기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#B9D7F1" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: wp("4%"),
    marginTop: hp("6%"),
  },
  closeIcon: { width: wp("6%"), height: wp("6%") },
  coinWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF1FA",
    padding: wp("2.5%"),
    borderRadius: wp("6%"),
  },
  coinIcon: { width: wp("5%"), height: wp("5%"), marginRight: wp("1.5%") },
  coinText: { fontFamily: "Jua-Regular", color: "#333" },
  backgroundArea: {
    height: hp("40%"),
    backgroundColor: "#B9D7F1",
    marginHorizontal: wp("4%"),
    borderRadius: wp("5%"),
    position: "relative",
  },
  rightButtons: {
    backgroundColor: "#fff",
    position: "absolute",
    bottom: wp("3%"),
    right: wp("3%"),
    flexDirection: "row",
    gap: wp("2%"),
    padding: wp("1.5%"),
    borderRadius: wp("3%"),
  },
  smallIcon: {
    width: wp("6.5%"),
    height: wp("6.5%"),
    tintColor: "#ccc",
    marginHorizontal: wp("1.5%"),
  },
  selectedSmallIcon: { tintColor: "#002D73" },
  itemContainer: {
    height: hp("50%"),
    backgroundColor: "#fff",
    borderTopLeftRadius: wp("8%"),
    borderTopRightRadius: wp("8%"),
    paddingTop: wp("4%"),
    paddingHorizontal: wp("6%"),
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: wp("4%"),
  },
  tabIcon: { width: wp("8%"), height: wp("8%"), tintColor: "#ccc" },
  selectedTabIcon: { tintColor: "#3258A5" },
  itemList: { paddingBottom: wp("8%") },
  itemBox: {
    width: wp("22%"),
    height: wp("22%"),
    margin: wp("2%"),
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: wp("3%"),
    justifyContent: "center",
    alignItems: "center",
  },
  itemBoxSelected: {
    borderColor: "#002D73",
    borderWidth: 2,
  },
  itemImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  priceTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: wp("3%"),
    paddingHorizontal: wp("2%"),
    paddingVertical: hp("0.3%"),
  },
  priceText: { marginLeft: wp("1%"), fontSize: wp("3%"), fontFamily: "Jua-Regular" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBox: {
    backgroundColor: "white",
    padding: wp("5%"),
    height: hp("28%"),
    width: wp("60%"),
    borderRadius: wp("4%"),
    alignItems: "center",
  },
  modalButtonRow: {
    flexDirection: "row",
    marginTop: wp("4%"),
    gap: wp("2.5%"),
  },
  modalButton: {
    backgroundColor: "#3258A5",
    paddingVertical: wp("2%"),
    paddingHorizontal: wp("4%"),
    borderRadius: wp("2.5%"),
  },
  modalButtonText: {
    color: "#fff",
    fontFamily: "Jua-Regular"
  },
  noneText: {
    fontSize: wp("4.5%"),
    color: "#000000",
    position: "absolute",
    bottom: wp("1%"),
    right: 0,
    fontFamily: "Jua-Regular"
  },
});