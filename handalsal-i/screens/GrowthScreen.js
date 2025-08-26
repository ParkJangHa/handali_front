import { StyleSheet, Text, View, TouchableOpacity, Image, ImageBackground } from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";
import { characterImageMap } from "../utils/characterImageMap";
import LottieView from "lottie-react-native";
import { useRoute } from "@react-navigation/native"; // ✅ Import useRoute
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const CATEGORY_ICON = {
  ACTIVITY: require("../assets/icons/activity.png"),
  INTELLIGENCE: require("../assets/icons/intelligence.png"),
  ART: require("../assets/icons/art.png"),
};

const CATEGORY_COLOR = {
  ACTIVITY: "#FFCF2A",      // 활동
  INTELLIGENCE: "#92CBE0",  // 지능
  ART: "#FA8772",           // 예술
};
const THRESHOLDS = [10, 25, 45, 70, 100];

const GrowthScreen = ({ navigation }) => {
  const route = useRoute();
  const { grownCategory } = route.params || {}; // 이전 화면에서 넘겨준 grownCategory 값을 받습니다.

  const [nickname, setNickname] = useState();
  const [imageSource, setImageSource] = useState(require("../assets/character/0,0,0.png"));
  const [stats, setStats] = useState({
    activity_value: 0,
    intelligence_value: 0,
    art_value: 0,
  });

  const setImageSourceByName = (imageName) => {
    const mapped = (imageName && characterImageMap[imageName]) || require("../assets/character/0,0,0.png");
    setImageSource(mapped);
  };

  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

  useEffect(() => {
    const fetchGrowthInfo = async () => {
      const token = await AsyncStorage.getItem("authToken");
      try {
        const response = await fetch(`${API_BASE_URL}/handalis/view`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const bodyText = await response.text();
        // console.log("📩 /handalis/view RAW:", bodyText);
        if (!response.ok) return;
        const data = JSON.parse(bodyText);
        setNickname(data.nickname);
        setImageSourceByName(data.handali_img);
        setStats({
          activity_value: Number(data.activity_value ?? 0),
          intelligence_value: Number(data.intelligence_value ?? 0),
          art_value: Number(data.art_value ?? 0),
        });
      } catch (e) {
        console.error("성장 정보 불러오기 실패:", e);
      }
    };
    fetchGrowthInfo();
  }, []);

  const getLevelProgressByValue = (rawValue) => {
    const value = Math.max(0, Number(rawValue ?? 0));
    let idx = THRESHOLDS.findIndex((t) => value < t);
    if (idx === -1) idx = THRESHOLDS.length - 1;
    const level = idx + 1;
    const prev = idx > 0 ? THRESHOLDS[idx - 1] : 0;
    const span = Math.max(1, THRESHOLDS[idx] - prev);
    const gained = Math.min(Math.max(0, value - prev), span);
    const percent = Math.min(100, Math.max(0, (gained / span) * 100));
    return { level, percent };
  };

  const StatBar = ({ label, value, icon, barColor, isGrownCategory }) => {
    const { level, percent } = getLevelProgressByValue(value);

    // ✅ isGrownCategory가 true일 경우, 글자색을 해당 카테고리 색상으로 변경
    const titleStyle = [
      styles.statTitle,
      isGrownCategory && { color: '#ff5a5a' }
    ];

    return (
      <View style={styles.statBarRow}>
        <Image source={icon} style={styles.statIcon} resizeMode="contain" />
        <View style={styles.statRight}>
          <Text style={titleStyle}> {/* ✅ 수정된 스타일 적용 */}
            {label} Lv.{level}
          </Text>
          <View style={styles.expBarBackground}>
            <View style={[styles.expBarFill, { width: `${percent}%`, backgroundColor: barColor }]} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require("../assets/bg_gr.png")}   // ✅ 고정 배경 이미지
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.titleContainer}>
        <Text style={styles.dateText}>{formattedDate}</Text>
        <Text style={styles.titleText}>한달이가 성장했어요! 🎉</Text>
        <View style={styles.memoContainer}>
          <Text style={styles.memoText}>새로운 외형으로 변화 했어요!</Text>
        </View>
      </View>

      {/* 한달이 영역 (카드 제거, 배경 위로 직접 배치) */}
      <View style={styles.handaliContainer}>
        {/* Lottie: 항상 무한 반복 */}
        <LottieView
          source={require("../assets/card_shine.json")}
          autoPlay
          loop
          style={styles.lottieEffect}
          renderMode="AUTOMATIC"
        />

        <Text style={styles.nicknameText}>{nickname}</Text>
        <Image source={imageSource} style={styles.handaliImage} />

        <View style={styles.statContainer}>
          <StatBar
            label="활동"
            value={stats.activity_value}
            icon={CATEGORY_ICON.ACTIVITY}
            barColor={CATEGORY_COLOR.ACTIVITY}
            isGrownCategory={grownCategory === 'ACTIVITY'} // ✅ 추가
          />
          <StatBar
            label="지능"
            value={stats.intelligence_value}
            icon={CATEGORY_ICON.INTELLIGENCE}
            barColor={CATEGORY_COLOR.INTELLIGENCE}
            isGrownCategory={grownCategory === 'INTELLIGENT'} // ✅ 추가
          />
          <StatBar
            label="예술"
            value={stats.art_value}
            icon={CATEGORY_ICON.ART}
            barColor={CATEGORY_COLOR.ART}
            isGrownCategory={grownCategory === 'ART'} // ✅ 추가
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.replace("MainScreen")}
        >
          <Text style={styles.buttonText}>메인 화면으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: hp("2%"),
  },
  titleContainer: {
    marginTop: hp("4%"),
    alignItems: "center",
  },
  memoContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp("1%"),
    marginBottom: hp("2%"),
  },

  handaliContainer: {
    alignItems: "center",
    marginTop: hp("-6%"),
    height: hp("80%"),            // 이전 카드 높이만큼 영역 확보
    position: "relative",         // Lottie absolute 기준
    justifyContent: "center",
  },
  lottieEffect: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 150,  // 한달이 영역 전체 덮기
    pointerEvents: "none",
    zIndex: 1,
  },
  handaliImage: {
    width: "80%",
    maxHeight: "75%",             // 컨테이너를 꽉 채우지 않도록 제한
    resizeMode: "contain",
    marginTop: hp("-10%"),
    left: wp("-4%"),
    zIndex: 2,
  },
  nicknameText: {
    fontSize: wp("6%"),
    color: "#5A3A29",
    fontFamily: "Jua-Regular",
    marginTop: hp("8%"),
    zIndex: 2,
  },

  statContainer: {
    width: "80%",
    marginTop: hp("-10%"),
    zIndex: 2,
    left: wp("-3%"),
  },
  statBarContainer: {
    width: "70%",
    paddingHorizontal: wp("5%"),
  },
  statBarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("1%"),
    paddingHorizontal: wp("5%"),
  },

  statIcon: {
    width: wp("12%"),
    height: wp("12%"),
    marginRight: wp("3%"),
  },

  statRight: {
    flex: 1, // 아이콘 제외한 공간 전부 사용
  },

  statTitle: {
    fontSize: wp("5%"),
    color: "#2D5D6B",
    fontFamily: "Jua-Regular",
    marginBottom: hp("0.6%"),
  },

  expBarBackground: {
    width: "100%",
    height: hp("1.5%"),
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: hp("1%"),
    overflow: "hidden",
  },

  expBarFill: {
    height: "100%",
  },

  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp("-8%"),
  },
  button: {
    backgroundColor: "#F7B61B",
    width: wp("80%"),
    paddingVertical: hp("2%"),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
  },

  dateText: {
    fontSize: wp("6%"),
    fontFamily: "Jua-Regular",
    textAlign: "center",
  },
  titleText: {
    fontSize: wp("8%"),
    fontFamily: "Jua-Regular",
    textAlign: "center",
  },
  memoText: {
    fontSize: wp("6%"),
    color: "black",
    fontFamily: "Jua-Regular",
    textAlign: "center",
  },
  buttonText: {
    fontSize: wp("5%"),
    color: "#000000",
    fontFamily: "Jua-Regular",
  },
});

export default GrowthScreen;
