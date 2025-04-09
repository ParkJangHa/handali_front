import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Text,
  Dimensions,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const categories = ["소파", "배경", "벽장식", "바닥장식"];
const categoryIcons = {
  소파: require("../assets/Store_Furniture.png"),
  배경: require("../assets/Store_Background.png"),
  벽장식: require("../assets/Store_Window.png"),
  바닥장식: require("../assets/Store_Clock.png"),
};
const imageMap = {
  /* "원룸": require("./assets/storeItems/원룸.png"),
  "빌라": require("./assets/storeItems/빌라.png"),
  "아파트": require("./assets/storeItems/아파트.png"),
  "스위트룸": require("./assets/storeItems/스위트룸.png"),
  "고풍스러운_서재": require("./assets/storeItems/고풍스러운_서재.png"),
  "미니멀리스트_거실": require("./assets/storeItems/미니멀리스트_거실.png"),
  "화려한_펜트하우스": require("./assets/storeItems/화려한_펜트하우스.png"),
  "일본식_다다미방": require("./assets/storeItems/일본식_다다미방.png"),
  "유럽풍_클래식_인테리어": require("./assets/storeItems/유럽풍_클래식_인테리어.png"),
  "따뜻한_카페_스타일_공간": require("./assets/storeItems/따뜻한_카페_스타일_공간.png"),
  "나무_의자": require("./assets/storeItems/나무_의자.png"),
  "철제_의자": require("./assets/storeItems/철제_의자.png"),
  "디자인_의자": require("./assets/storeItems/디자인_의자.png"),
  "나무_소파": require("./assets/storeItems/나무_소파.png"),
  "푹신한_소파": require("./assets/storeItems/푹신한_소파.png"),
  "철제_소파": require("./assets/storeItems/철제_소파.png"),
  "디자인_소파": require("./assets/storeItems/디자인_소파.png"),
  "가죽_소파": require("./assets/storeItems/가죽_소파.png"),
  "모듈형_소파": require("./assets/storeItems/모듈형_소파.png"),
  "빈티지_패브릭_소파": require("./assets/storeItems/빈티지_패브릭_소파.png"),
  "나무_시계": require("./assets/storeItems/나무_시계.png"),
  "철_창문": require("./assets/storeItems/철_창문.png"),
  "값싼_액자": require("./assets/storeItems/값싼_액자.png"),
  "비싼_액자": require("./assets/storeItems/비싼_액자.png"),
  "모던한_벽걸이_선반": require("./assets/storeItems/모던한_벽걸이_선반.png"),
  "빈티지_거울": require("./assets/storeItems/빈티지_거울.png"),
  "LED_네온_사인": require("./assets/storeItems/LED_네온_사인.png"),
  "그림_액자": require("./assets/storeItems/그림_액자.png"),
  "벽걸이_플랜트": require("./assets/storeItems/벽걸이_플랜트.png"),
  "세계_지도_장식": require("./assets/storeItems/세계_지도_장식.png"),
  "스탠딩_조명": require("./assets/storeItems/스탠딩_조명.png"),
  "크리스마스_트리": require("./assets/storeItems/크리스마스_트리.png"),
  "모던_러그": require("./assets/storeItems/모던_러그.png"),
  "대형_화분": require("./assets/storeItems/대형_화분.png"),
  "빈티지_서랍장": require("./assets/storeItems/빈티지_서랍장.png"),
  "자동_로봇_청소기": require("./assets/storeItems/자동_로봇_청소기.png"),
  "책_무더기": require("./assets/storeItems/책_무더기.png"),
  "불멍용_미니_화로": require("./assets/storeItems/불멍용_미니_화로.png"),
  "전신_거울": require("./assets/storeItems/전신_거울.png"),
  "앤틱_보석함": require("./assets/storeItems/앤틱_보석함.png"),*/
  default: require("../assets/default.png"),
};

export default function StoreScreen() {
  const [selectedTab, setSelectedTab] = useState("소파");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedTopButton, setSelectedTopButton] = useState("background");
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItems();
  }, [selectedTab]);

  const fetchItems = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(
        `${API_BASE_URL}/store/view?category=${selectedTab}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        if (response.ok) {
          setItems(data);
        } else {
          console.warn("조회 실패:", data);
          setItems([]);
          Alert.alert("조회 실패", data.message || "아이템을 불러올 수 없습니다.");
        }
      } catch (e) {
        console.error("JSON 파싱 오류:", text);
        Alert.alert("서버 오류", "응답 형식이 잘못되었습니다.");
        setItems([]);
      }
    } catch (error) {
      console.error("서버 통신 오류:", error);
      Alert.alert("네트워크 오류", "인터넷 연결을 확인해주세요.");
    }
  };

  const renderItem = ({ item }) => {
    const imageName = item.name.replace(/ /g, "_");
    const imageSource = imageMap[imageName] || imageMap.default;

    return (
      <TouchableOpacity
        style={[styles.itemBox, selectedItem === item.storeId && styles.itemBoxSelected]}
        onPress={() => setSelectedItem(item.storeId)}
      >
        <Image source={imageSource} style={styles.itemImage} />
        {!item.buy && (
          <View style={styles.priceTag}>
            <Image source={require("../assets/coin.png")} style={styles.coinIcon} />
            <Text style={styles.priceText}>{item.price}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Image source={require("../assets/x.png")} style={styles.closeIcon} />
        </TouchableOpacity>
        <View style={styles.coinWrapper}>
          <Image source={require("../assets/coin.png")} style={styles.coinIcon} />
          <Text style={styles.coinText}>120</Text>
        </View>
      </View>

      {/* 상단 배경 및 탭 버튼들 */}
      <View style={styles.backgroundArea}>
        <View style={styles.rightButtons}>
          <TouchableOpacity onPress={() => setSelectedTopButton("background")}>
            <Image
              source={require("../assets/bg_Icon.png")}
              style={[
                styles.smallIcon,
                selectedTopButton === "background" && styles.selectedSmallIcon,
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedTopButton("character")}>
            <Image
              source={require("../assets/ch_Icon.png")}
              style={[
                styles.smallIcon,
                selectedTopButton === "character" && styles.selectedSmallIcon,
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 아이템 리스트 - 하단만 스크롤 */}
      <View style={styles.itemContainer}>
        <View style={styles.tabContainer}>
          {categories.map((cat) => (
            <TouchableOpacity key={cat} onPress={() => setSelectedTab(cat)}>
              <Image
                source={categoryIcons[cat]}
                style={[
                  styles.tabIcon,
                  selectedTab === cat && styles.selectedTabIcon,
                ]}
              />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#B9D7F1" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  coinWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF1FA",
    padding: 8,
    borderRadius: 20,
  },
  coinIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  coinText: {
    fontWeight: "bold",
    color: "#333",
  },
  backgroundArea: {
    height: SCREEN_HEIGHT * 0.4,
    backgroundColor: "#B9D7F1",
    marginHorizontal: 16,
    borderRadius: 20,
    position: "relative",
  },
  rightButtons: {
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
    padding: 6,
    borderRadius: 10,
  },
  smallIcon: {
    width: 25,
    height: 25,
    tintColor: "#ccc",
    marginHorizontal: 5,
  },
  selectedSmallIcon: {
    tintColor: "#002D73",
  },
  itemContainer: {
   height: SCREEN_HEIGHT * 0.5,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 16,
    paddingHorizontal: 24,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  tabIcon: {
    width: 30,
    height: 30,
    tintColor: "#ccc",
  },
  selectedTabIcon: {
    tintColor: "#3258A5",
  },
  itemList: {
    paddingBottom: 30,
  },
  itemBox: {
    width: SCREEN_WIDTH / 3.9,
    height: SCREEN_WIDTH / 3.9,
    margin: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  itemBoxSelected: {
    borderColor: "#002D73",
    borderWidth: 2,
  },
  itemImage: {
    width: 35,
    height: 35,
  },
  priceTag: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  priceText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "bold",
  },
});
