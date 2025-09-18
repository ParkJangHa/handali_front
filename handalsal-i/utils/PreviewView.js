import React, { useState, useEffect } from "react";
import { View, Image, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";
import { storeItemImageMap } from "./storeItemImageMap";
import { characterImageMap } from "./characterImageMap";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

const STAGE_RATIO = 9 / 16; // ← 필요 시 조정

export default function PreviewView({ characterImage, appliedItems, navigation }) {
  const [handaliImage, setHandaliImage] = useState(characterImageMap["default_character.png"]);

  const getImage = (name) => {
    if (!name) return null;
    const key = name.replace(/ /g, "_");
    const img = storeItemImageMap[key];
    return typeof img === "number" ? img : null;
  };

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const res = await fetch(`${API_BASE_URL}/handalis/view`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          await AsyncStorage.removeItem("authToken");
          Alert.alert("세션 만료", "로그인이 만료되었습니다. 다시 로그인해주세요.");
          navigation?.navigate("Login");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          if (data.handali_img && characterImageMap[data.handali_img]) {
            setHandaliImage(characterImageMap[data.handali_img]);
          } else {
            setHandaliImage(characterImageMap["default_character.png"]);
          }
        }
      } catch {}
    })();
  }, []);

  // 좌석 타입 구분(소파/의자)
  const getSeatType = (raw) => {
    if (!raw) return "unknown";
    const norm = String(raw).trim();
    if (/의자/i.test(norm) || /_Chair$/i.test(norm.replace(/ /g, "_"))) return "chair";
    if (/소파/i.test(norm) || /_Sofa$/i.test(norm.replace(/ /g, "_"))) return "sofa";
    return "unknown";
  };
  const seatType = appliedItems["소파"] ? getSeatType(appliedItems["소파"]) : "unknown";

  return (
    <View style={styles.previewContainer}>
      {/* Stage는 메인 화면 비율을 유지하며, 미리보기 안에서 가운데 정렬됩니다 */}
      <View style={styles.stageWrapper}>
        <View style={styles.stage}>
          {/* 배경 (필요시 교체) */}
          <Image
            source={require("../assets/storeItems/배경없음.png")}
            style={styles.bg}
            resizeMode="cover"
          />

          {/* 벽장식: 메인과 동일한 % 좌표/크기 */}
          {appliedItems["벽장식"] && getImage(appliedItems["벽장식"]) && (
            <Image
              source={getImage(appliedItems["벽장식"])}
              style={styles.wall}
              resizeMode="contain"
            />
          )}

          {/* 바닥장식 */}
          {appliedItems["바닥장식"] && getImage(appliedItems["바닥장식"]) && (
            <Image
              source={getImage(appliedItems["바닥장식"])}
              style={styles.floor}
              resizeMode="contain"
            />
          )}

          {/* 소파/의자 (캐릭터 뒤 레이어) */}
          {appliedItems["소파"] && getImage(appliedItems["소파"]) && (
            <Image
              source={getImage(appliedItems["소파"])}
              style={seatType === "chair" ? styles.chair : styles.sofa}
              resizeMode="contain"
            />
          )}

          {/* 캐릭터 (최상단) */}
          <Image source={handaliImage} style={styles.character} resizeMode="contain" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  previewContainer: {
    width: wp("78%"),
    height: hp("70%"),
    alignSelf: "center",
  },

  stageWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stage: {
    width: "100%",
    aspectRatio: STAGE_RATIO, 
    backgroundColor: "transparent",
    overflow: "hidden",
    position: "relative",
  },

  bg: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "60%"
  },

  wall: {
    position: "absolute",
    width: "30%",
    height: "30%",
    left: "12%",
    top: "3%",
    zIndex: 1,
  },

  floor: {
    position: "absolute",
    width: "40%",
    height: "40%",
    left: "1%",
    top: "20%",
    zIndex: 1,
  },

  sofa: {
    position: "absolute",
    width: "70%",
    height: "34%",
    left: "35%",
    top: "23%",
    zIndex: 2,
  },

  chair: {
    position: "absolute",
    width: "40%",
    height: "35%",
    left: "58%",
    top: "23%",
    zIndex: 2,
  },

  character: {
    position: "absolute",
    width: "60%",
    height: "30%",
    left: "17%",
    top: "28%",
    zIndex: 3,
  },
});
