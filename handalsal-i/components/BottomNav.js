import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

const icons = {
  store: require("../assets/icons/store.png"),
  record: require("../assets/icons/record.png"),
  apart: require("../assets/icons/apartment_nav.png"),
  home: require("../assets/icons/home.png"), // ✅ 홈 아이콘 추가
};

export default function BottomNav({
  navigation,
  active = "Main",
  mode = "default", // "default" | "apart" | "record"
}) {
  // Left: 상점(고정)
  const onPressLeft = () => navigation.navigate("Store");

  // Center: 기본=기록 / "record" 모드면 홈으로
  const isCenterHome = mode === "record";
  const onPressCenter = () =>
    isCenterHome ? navigation.navigate("MainScreen") : navigation.navigate("Record");

  // Right: 기본=아파트 / "apart" 모드면 홈으로
  const isRightHome = mode === "apart";
  const onPressRight = () =>
    isRightHome ? navigation.navigate("MainScreen") : navigation.navigate("ApartScreen");

  return (
    <View style={styles.bottomNav}>
      {/* 좌: 상점 */}
      <TouchableOpacity style={styles.navButton} onPress={onPressLeft}>
        <Image source={icons.store} style={styles.navIcon} />
        <Text style={[styles.navText, active === "Store" && styles.activeText]}>상점</Text>
      </TouchableOpacity>

      {/* 중간: 기록 or 홈(모드에 따라) */}
      <TouchableOpacity style={styles.recordButton} onPress={onPressCenter} activeOpacity={0.9}>
        <Image source={isCenterHome ? icons.home : icons.record} style={styles.recordIcon} />
      </TouchableOpacity>

      {/* 우: 아파트 or 홈(모드에 따라) */}
      <TouchableOpacity style={styles.navButton} onPress={onPressRight}>
        <Image source={isRightHome ? icons.home : icons.apart} style={styles.navIcon} />
        <Text
          style={[
            styles.navText,
            (active === "Apart" || (isRightHome && active === "Main")) && styles.activeText,
          ]}
        >
          {isRightHome ? "홈" : "아파트"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    bottom: hp("1.5%"),
    width: "85%",
    height: hp("7%"),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp("15%"),
    paddingVertical: hp("2%"),
    zIndex: 49,
    elevation: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: wp("7%"),
    marginBottom: hp("3%"),
    alignSelf: "center",
  },
  navButton: { alignItems: "center" },
  navIcon: { width: wp("7%"), height: wp("7%") },
  navText: { fontSize: wp("4%"), color: "#2D5D6B", fontFamily: "Jua-Regular" },
  activeText: { color: "#1d1d1d", fontWeight: "700" },
  recordButton: { alignItems: "center" },
  recordIcon: { width: wp("19%"), height: wp("17%"), marginBottom: hp("4%") },
});
