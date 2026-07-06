import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { API_BASE_URL } from "@env";
import { authFetch } from "../utils/authFetch";
const { width, height } = Dimensions.get("window");

const tutorialImages = [
  require("../assets/Tutorial/one.png"),
  require("../assets/Tutorial/two.png"),
  require("../assets/Tutorial/three.png"),
  require("../assets/Tutorial/four.png"),
  require("../assets/Tutorial/five.png"),
  require("../assets/Tutorial/six.png"),
  require("../assets/Tutorial/seven.png"),
  require("../assets/Tutorial/eight.png"),
  require("../assets/Tutorial/nine.png"),
  require("../assets/Tutorial/ten.png"),
];

export default function TutorialScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewRef = React.useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={tutorialImages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <Image source={item} style={styles.image} resizeMode="contain" />
        )}
      />

      {/* 마지막 슬라이드에만 버튼 표시 */}
      {currentIndex === tutorialImages.length - 1 && (
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            try {
              // 튜토리얼 봤음 표시 저장
              await AsyncStorage.setItem("tutorial_seen", "true");

              // 한달이 존재 여부 확인 API 호출
              const response = await authFetch(`${API_BASE_URL}/handalis/view`, { method: "GET" }, navigation);

              if (response.ok) {
                // 한달이 있음 → MainScreen 으로 이동
                navigation.replace("MainScreen");
              } else {
                // 한달이 없음 → Category 선택 화면으로 이동
                navigation.replace("Category");
              }
            } catch (error) {
              console.error("튜토리얼 종료 후 화면 이동 오류:", error);
            }
          }}
        >
          <Text style={styles.buttonText}>시작하기</Text>
        </TouchableOpacity>

      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: width,
    height: height,
  },
  button: {
    position: "absolute",
    bottom: 100,
    left: width * 0.25,
    width: width * 0.5,
    backgroundColor: "#4a90e2",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
});
