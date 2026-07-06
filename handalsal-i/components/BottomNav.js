import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const icons = {
  store: require("../assets/icons/store.png"),
  record: require("../assets/icons/record.png"),
  apart: require("../assets/icons/apartment_nav.png"),
  home: require("../assets/icons/home.png"),
  home_record: require("../assets/icons/home_record.png"),
  summary: require("../assets/icons/summary.png"), // ✅ 기록소 아이콘
};

export default function BottomNav({
  navigation,
  active = "Main",            // "Main" | "Store" | "Apart" | "Summary" 등
  mode = "default",            // "default" | "apart" | "record"
}) {
  const insets = useSafeAreaInsets();
  const isRecordMode = mode === "record";
  const isRightHome = mode === "apart";

  // === Left: 기본=상점 / record 모드=기록소 ===
  const leftLabel = isRecordMode ? "기록소" : "상점";
  const leftIcon = isRecordMode ? icons.summary : icons.store;
  const onPressLeft = () =>
    isRecordMode ? navigation.navigate("Summary") : navigation.navigate("Store");
  const isLeftActive = isRecordMode ? active === "Summary" : active === "Store";

  // === Center: 기본=기록 / record 모드=홈 ===
  const isCenterHome = isRecordMode;
  const onPressCenter = () =>
    isCenterHome ? navigation.navigate("MainScreen") : navigation.navigate("Record");

  // === Right: 기본=아파트 / apart 모드=홈 ===
  const onPressRight = () =>
    isRightHome ? navigation.navigate("MainScreen") : navigation.navigate("ApartScreen");
  const isRightActive = active === "Apart" || (isRightHome && active === "Main");

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + hp("2%") }]}>
      <View style={styles.navContainer}>
        {/* ⬆️ 상단 그림자 */}
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(0,0,0,0.40)", "rgba(0,0,0,0.0)"]}
          style={styles.topShadow}
        />
      {/* 바 본체 */}
    <View style={[styles.bottomNav, styles.upRightShadow]}>
      {/* 왼쪽: 상점 or 기록소 */}
      <TouchableOpacity style={styles.navButton} onPress={onPressLeft}>
        <Image source={leftIcon} style={styles.navIcon} />
        <Text style={[styles.navText, isLeftActive && styles.activeText]}>{leftLabel}</Text>
      </TouchableOpacity>

      {/* 가운데: 기록 or 홈 */}
      <TouchableOpacity style={styles.recordButton} onPress={onPressCenter} activeOpacity={0.9}>
        <Image source={isCenterHome ? icons.home_record : icons.record} style={styles.recordIcon} />
      </TouchableOpacity>

      {/* 오른쪽: 아파트 or 홈 */}
      <TouchableOpacity style={styles.navButton} onPress={onPressRight}>
        <Image source={isRightHome ? icons.home : icons.apart} style={styles.navIcon} />
        <Text style={[styles.navText, isRightActive && styles.activeText]}>
          {isRightHome ? "홈" : "아파트"}
        </Text>
      </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    width: "100%",
    alignItems: "center",
  },

  // 바와 오버레이를 같은 기준으로 절대배치하기 위한 컨테이너
  navContainer: {
    width: wp("85%"),
    height: hp("7%"),
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  // 바 본체
  bottomNav: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp("15%"),
    paddingVertical: hp("2%"),
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: wp("7%"),
  },
  recordButton: {
    transform:[{translateY: -hp("2%")},]
  },

  // iOS: 위(-height) + 오른쪽(+width) 방향 그림자
  // Android: elevation으로 살짝 띄우고, 방향은 그라디언트가 담당
  upRightShadow: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.22,
      shadowRadius: 12,
      shadowOffset: { width: 10, height: -10 }, // ➡️ + ⬆️
    },
    android: {
      elevation: 10,
    },
  }),

  // 상단 그라디언트 그림자 (컨테이너 기준)
  topShadow: {
    position: "absolute",
    top: -hp("0.8%"),           // 바 윗변 바깥으로 조금
    left: wp("1%"),
    right: -wp("1%"),
    height: hp("5%"),         // 그늘 두께
    borderTopLeftRadius: wp("7%"),
    borderTopRightRadius: wp("7%"),
  },

  navButton: { alignItems: "center" },
  navIcon: { width: wp("7%"), height: wp("7%") },
  navText: { fontSize: wp("4%"), color: "#2D5D6B", fontFamily: "Jua-Regular" },
  activeText: { color: "#1d1d1d", fontWeight: "700" },
});