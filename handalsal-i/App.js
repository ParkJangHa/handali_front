import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function App() {
  return (
    <View style={styles.container}>
      {/* 상단 바 */}
      <View style={styles.topBar}>
        <View style={styles.coinContainer}>
          <Image
            source={require("./assets/coin.png")} // 코인 아이콘 이미지 경로
            style={styles.coinIcon}
          />
          <Text style={styles.coinText}>120</Text>
        </View>
        <View style={styles.topIcons}>
          <TouchableOpacity>
            <Image
              source={require("./assets/store.png")} // 상점 아이콘 이미지 경로
              style={styles.icon}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              source={require("./assets/storage.png")} // 아파트 아이콘 이미지 경로
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 콘텐츠 영역 */}
      <View style={styles.content}>
        <Text style={styles.dayText}>n일차, 별명</Text>
        <Image
          source={require("./assets/window.png")} // 창문 이미지 경로
          style={styles.window}
        />
        <View style={styles.characterContainer}>
          <Image
            source={require("./assets/character.png")} // 캐릭터 이미지 경로
            style={styles.character}
          />
        </View>
        <Image
          source={require("./assets/sofa.png")} // 소파 이미지 경로
          style={styles.sofa}
        />
      </View>

      {/* 하단 배경 */}
      <View style={styles.bottomBackground}>
        {/* 하단 네비게이션 */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navButton}>
            <Image
              source={require("./assets/main.png")} // 홈 아이콘 이미지 경로
              style={styles.navIcon}
            />
            <Text style={styles.navText}>메인</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.recordButton}>
            <Image
              source={require("./assets/record.png")} // 아파트 네비게이션 아이콘 경로
              style={styles.recordIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Image
              source={require("./assets/apartment_nav.png")} // 아파트 네비게이션 아이콘 경로
              style={styles.navIcon}
            />
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
