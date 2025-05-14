import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { storeItemImageMap } from "./storeItemImageMap";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

const scaleRatio = 0.65; // 원하는 크기에 따라 조절 가능 (0.4 ~ 0.6 추천)

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
        source={require("../assets/storeItems/배경없음.png")}
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
    width: wp(110 * scaleRatio),
    height: hp(70 * scaleRatio),
    borderRadius: 20,
    overflow: "visible",
    position: "relative",
    alignSelf: "center",
    overflow: "hidden"
  },
  backgroundImage: {
    position: "absolute",
    width: wp(120 * scaleRatio),
    height: hp(90 * scaleRatio),      // 이미지를 크게
    resizeMode: "cover",
    zIndex: -3,
    transform: [{ translateY: -hp("22%") }],
  },
  characterContainer: {
    position: "absolute",
    top: hp(17),
    left: wp(14),
    zIndex: -1,
  },
  character: {
    width: wp(60 * scaleRatio),
    height: hp(25 * scaleRatio),
    resizeMode: "contain",
  },
  sofa: {
    width: wp(100 * scaleRatio),
    height: wp(50 * scaleRatio),
    position: "absolute",
    top: hp(15),
    left: wp(15),
    zIndex: -2,
    resizeMode: "contain",
  },
  chair: {
    width: wp(40 * scaleRatio),
    height: wp(35 * scaleRatio),
    position: "absolute",
    top: hp(17.3),
    left: wp(35),
    zIndex: -2,
    resizeMode: "contain",
  },
  window: {
    width: wp(40 * scaleRatio),
    height: wp(30 * scaleRatio),
    position: "absolute",
    top: hp(5),
    left: wp(5),
    zIndex: -2,
    resizeMode: "contain",
  },
  floor: {
    width: wp(40 * scaleRatio),
    height: wp(40 * scaleRatio),
    position: "absolute",
    top: hp(15),
    left: wp(1),
    zIndex: -2,
    resizeMode: "contain",
  },
});