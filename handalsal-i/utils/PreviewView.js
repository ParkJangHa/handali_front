import React from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import { storeItemImageMap } from "./storeItemImageMap";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const scaleRatio = 0.55; // 원하는 크기에 따라 조절 가능 (0.4 ~ 0.6 추천)

export default function PreviewView({ characterImage, appliedItems }) {
  const getImage = (name) => {
    if (!name) return null;
    const key = name.replace(/ /g, "_");
    const image = storeItemImageMap[key];
    return typeof image === "number" ? image : null;
  };

  return (
    <View style={styles.previewContainer}>
      <Image
      source={require("../assets/storeItems/room.png")}
      style={styles.backgroundImage}
      />
      {/* 벽장식 */}
      {appliedItems["벽장식"] && getImage(appliedItems["벽장식"]) && (
        <Image source={getImage(appliedItems["벽장식"])} style={styles.window} />
      )}

      {/* 바닥장식 */}
      {appliedItems["바닥장식"] && getImage(appliedItems["바닥장식"]) && (
        <Image source={getImage(appliedItems["바닥장식"])} style={styles.floor} />
      )}

      {/* 캐릭터 */}
      <View style={styles.characterContainer}>
        <Image source={characterImage} style={styles.character} />
      </View>

      {/* 소파 또는 의자 */}
      {appliedItems["소파"] && getImage(appliedItems["소파"]) && (
        <Image
          source={getImage(appliedItems["소파"])}
          style={
            appliedItems["소파"].includes("의자")
              ? styles.chair
              : styles.sofa
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  previewContainer: {
    width: SCREEN_WIDTH * 1.2 * scaleRatio,
    height: SCREEN_HEIGHT * 0.7 * scaleRatio,
    borderRadius: 20,
    overflow: "visible",
    position: "relative",
    alignSelf: "center",
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    zIndex: -3,
  },
  characterContainer: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.17,   // 🔧 TODO: 캐릭터 위치 조정
    left: SCREEN_WIDTH * 0.14,   // 🔧 TODO: 캐릭터 좌우 위치 조정
    zIndex: -1,
  },
  character: {
    width: SCREEN_WIDTH * 0.6 * scaleRatio,
    height: SCREEN_HEIGHT * 0.25 * scaleRatio,
    resizeMode: "contain",
  },
  sofa: {
    width: SCREEN_WIDTH * 1 * scaleRatio,
    height: SCREEN_WIDTH * 0.6 * scaleRatio,
    position: "absolute",
    top: SCREEN_HEIGHT * 0.13,    // 🔧 TODO: 소파 높이 조정
    left: SCREEN_WIDTH * 0.15,     // 🔧 TODO: 소파 좌우 위치 조정
    zIndex: -2,
    resizeMode: "contain",
  },
  chair: {
    width: SCREEN_WIDTH * 0.4 * scaleRatio,
    height: SCREEN_WIDTH * 0.35 * scaleRatio,
    position: "absolute",
    top: SCREEN_HEIGHT * 0.173,     // 🔧 TODO: 의자 높이 조정
    left: SCREEN_WIDTH * 0.35,    // 🔧 TODO: 의자 좌우 위치 조정
    zIndex: -2,
    resizeMode: "contain",
  },
  window: {
    width: SCREEN_WIDTH * 0.4 * scaleRatio,
    height: SCREEN_WIDTH * 0.3 * scaleRatio,
    position: "absolute",
    top: SCREEN_HEIGHT * 0.05,    // 🔧 TODO: 창문 높이 조정
    left: SCREEN_WIDTH * 0.05,    // 🔧 TODO: 창문 좌우 위치 조정
    zIndex: -2,
    resizeMode: "contain",
  },
  floor: {
    width: SCREEN_WIDTH * 0.4 * scaleRatio,
    height: SCREEN_WIDTH * 0.4 * scaleRatio,
    position: "absolute",
    top: SCREEN_HEIGHT * 0.15,    // 🔧 TODO: 바닥 위치 조정
    left: SCREEN_WIDTH * 0.01,   // 🔧 TODO: 바닥 좌우 위치 조정
    zIndex: -2,
    resizeMode: "contain",
  },
});
