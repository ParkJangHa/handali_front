import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from '@env';
import { characterImageMap } from "../utils/characterImageMap";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const THRESHOLDS = [100, 250, 450, 700, 1000]; // 레벨 임계값

const GrowthScreen = ({ navigation }) => {
  const [nickname, setNickname] = useState();
  const [imageSource, setImageSource] = useState(
    require("../assets/character/0,0,0.png")
  );
  const [stats, setStats] = useState({
    activity_value: 0,
    intelligence_value: 0,
    art_value: 0,
    max_stat_activity: 100,
    max_stat_art: 100,
    max_stat_intelligence: 100,
  });

  const setImageSourceByName = (imageName) => {
    const mapped =
      (imageName && characterImageMap[imageName]) ||
      require("../assets/character/0,0,0.png");
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const responseBody = await response.text();
        // console.log("서버 응답 원본:", responseBody);

        if (response.ok) {
          const data = JSON.parse(responseBody);

          setNickname(data.nickname);
          setImageSourceByName(data.handali_img);

          setStats({
            activity_value: Number(data.activity_value ?? 0),
            intelligence_value: Number(data.intelligence_value ?? 0),
            art_value: Number(data.art_value ?? 0),
            max_stat_activity: Number(data.max_stat_activity ?? 100),
            max_stat_art: Number(data.max_stat_art ?? 100),
            max_stat_intelligence: Number(data.max_stat_intelligence ?? 100),
          });
        }
      } catch (error) {
        console.error("성장 정보 불러오기 실패:", error);
      }
    };

    fetchGrowthInfo();
  }, []);

  // 현재 레벨 구간에서의 진행률 계산
  const getInLevelProgress = (valueRaw, maxOfThisLevelRaw) => {
    const value = Number(valueRaw ?? 0);
    const maxOfThisLevel = Number(maxOfThisLevelRaw ?? 100);

    const idx = THRESHOLDS.findIndex((t) => t === maxOfThisLevel);
    const level = idx >= 0 ? idx + 1 : 1;
    const prev = idx > 0 ? THRESHOLDS[idx - 1] : 0;

    const span = Math.max(1, maxOfThisLevel - prev); // 이 레벨에서 필요한 총치
    const gained = Math.min(Math.max(0, value - prev), span); // 이 레벨에서 채운 양
    const percent = (gained / span) * 100;

    return { level, gained, span, percent: Math.min(100, Math.max(0, percent)) };
  };

 const StatBar = ({ label, value, max }) => {
    const { level, gained, span, percent } = getInLevelProgress(value, max);

    return (
      <View style={styles.statBarContainer}>
        <Text style={styles.statTitle}>
          {label} Lv.{level}
        </Text>
        <View style={styles.expBarBackground}>
          <View style={[styles.expBarFill, { width: `${percent}%` }]} />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.dateText}>{formattedDate}</Text>
        <Text style={styles.titleText}>한달이가 성장했어요! 🎉</Text>
        <View style={styles.memoContainer}>
          <Text style={styles.memoText}>새로운 외형으로 변화 했어요!</Text>
        </View>
      </View>

      <View style={styles.handaliContainer}>
        <LinearGradient
          colors={["#feebe1", "#fdd7be", "#fdcfae", "#FFB08A"]}
          style={styles.circle}
        >
          <Text style={styles.nicknameText}>{nickname}</Text>
          <Image source={imageSource} style={styles.handaliImage} />

          {/* 스탯 진행률 */}
          <View style={styles.statContainer}>
            <StatBar
              label="활동"
              value={stats.activity_value}
              max={stats.max_stat_activity}
            />
            <StatBar
              label="지능"
              value={stats.intelligence_value}
              max={stats.max_stat_intelligence}
            />
            <StatBar label="예술" value={stats.art_value} max={stats.max_stat_art} />
          </View>
        </LinearGradient>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.replace("MainScreen")}
        >
          <Text style={styles.buttonText}>메인 화면으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: hp("2%"),
    backgroundColor: "#FFE98A",
  },
  titleContainer: {
    marginTop: hp("7%"),
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
    marginBottom: hp("2%"),
  },
  circle: {
    width: wp("80%"),
    height: hp("60%"),
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp("3%"),
  },
  handaliImage: {
    width: "90%",
    height: "80%",
    resizeMode: "contain",
    marginTop: hp("-8%"),
  },
  nicknameText: {
    fontSize: wp("6%"),
    color: "#5A3A29",
    fontFamily: "Jua-Regular",
  },
  statContainer: {
    width: "100%",
    marginTop: hp("-8%"),
  },
  statBarContainer: {
    width: "100%",
    paddingHorizontal: wp("5%"),
    marginBottom: hp("2%"),
  },
  statTitle: {
    fontSize: wp("5%"),
    color: "#2D5D6B",
    fontFamily: "Jua-Regular",
    marginBottom: hp("0.5%"),
  },
  expBarBackground: {
    width: "100%",
    height: hp("1.6%"), // 살짝 낮춤
    backgroundColor: "#D9D9D9",
    borderRadius: hp("1%"),
    overflow: "hidden",
  },
  expBarFill: {
    height: "100%",
    backgroundColor: "#76D6F4",
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#76D6F4",
    width: wp("80%"),
    paddingVertical: hp("2%"),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
  },
  dateText: {
    fontSize: wp("5.5%"),
    fontFamily: "Jua-Regular",
  },
  titleText: {
    fontSize: wp("6%"),
    fontFamily: "Jua-Regular",
    textAlign: "center",
  },
  memoText: {
    fontSize: wp("5%"),
    color: "#ff8851",
    fontFamily: "Jua-Regular",
  },
  buttonText: {
    fontSize: wp("5%"),
    color: "#2D5D6B",
    fontFamily: "Jua-Regular",
  },
});

export default GrowthScreen;
