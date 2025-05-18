import React, { useState, useEffect } from "react";
import { View, Image, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";
import { storeItemImageMap } from "./storeItemImageMap";
import { characterImageMap } from "./characterImageMap";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

const scaleRatio = 0.65;

export default function PreviewView({ characterImage, appliedItems, navigation }) {
  const [handaliImage, setHandaliImage] = useState(characterImageMap["default_character.png"]);

  const getImage = (name) => {
    if (!name) return null;
    const key = name.replace(/ /g, "_");
    const image = storeItemImageMap[key];
    return typeof image === "number" ? image : null;
  };

  useEffect(() => {
    const fetchHandaliImage = async () => {
      const token = await AsyncStorage.getItem("authToken");

      try {
        const response = await fetch(`${API_BASE_URL}/handalis/view`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          await AsyncStorage.removeItem("authToken");
          Alert.alert("세션 만료", "로그인이 만료되었습니다. 다시 로그인해주세요.");
          navigation?.navigate("Login");
          return;
        }

        if (response.ok) {
          const data = await response.json();
          console.log("✅ 캐릭터 이미지 응답:", data.handali_img);
          if (data.handali_img && characterImageMap[data.handali_img]) {
            setHandaliImage(characterImageMap[data.handali_img]);
          } else {
            setHandaliImage(characterImageMap["default_character.png"]);
          }
        }
      } catch (error) {
        console.log("❌ 캐릭터 이미지 불러오기 오류:", error);
      }
    };

    fetchHandaliImage();
  }, []);

  return (
    <View style={styles.previewContainer}>
      <Image source={require("../assets/storeItems/배경없음.png")} style={styles.backgroundImage} />

      {appliedItems["벽장식"] && getImage(appliedItems["벽장식"]) && (
        <Image source={getImage(appliedItems["벽장식"])} style={styles.window} />
      )}

      {appliedItems["바닥장식"] && getImage(appliedItems["바닥장식"]) && (
        <Image source={getImage(appliedItems["바닥장식"])} style={styles.floor} />
      )}

      <View style={styles.characterContainer}>
        <Image source={handaliImage} style={styles.character} />
      </View>

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