// HabitCategoryScreen.js
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";
import { characterImageMap } from "../utils/characterImageMap";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useFocusEffect } from "@react-navigation/native";

const ALL_CATS_KO = ["활동", "지능", "예술"];
const CAT_TO_CODE = { 활동: "ACTIVITY", 지능: "INTELLIGENT", 예술: "ART" };

export default function HabitCategoryScreen({ navigation }) {
  const [selectedType, setSelectedType] = useState(null); // "활동" | "지능" | "예술" | null
  const [imageSource, setImageSource] = useState(
    require("../assets/character/default_character.png")
  );
  const [loading, setLoading] = useState(false);

  // 이번 달 습관이 있는 카테고리만 표시
  const [visibleCats, setVisibleCats] = useState([]); // string[]
  const [catsLoading, setCatsLoading] = useState(true);

  const monthNow = () => new Date().getMonth() + 1; // 1~12
  const showPrompt = selectedType === null;

  /** 캐릭터/로고 이미지 선택 */
  const getImageSource = () => {
    switch (selectedType) {
      case "활동":
        return require("../assets/activityLogo.png");
      case "지능":
        return require("../assets/intelligenceLogo.png");
      case "예술":
        return require("../assets/artLogo.png");
      default:
        // 선택 전: 캐릭터 이미지 보여주기
        return imageSource;
    }
  };

  /** 인증 실패 처리 공통 */
  const handleAuthFail = useCallback(async () => {
    try {
      await AsyncStorage.removeItem("authToken");
    } catch {}
    Alert.alert("인증에 실패했습니다", "다시 로그인해 주세요.", [
      { text: "확인", onPress: () => navigation.navigate("Login") },
    ]);
  }, [navigation]);

  /** 메인 캐릭터 이미지 호출 */
  const fetchImage = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return handleAuthFail();

      const url = `${API_BASE_URL}/handalis/view`;
      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401 || response.status === 412) return handleAuthFail();
      if (response.status === 404) {
        Alert.alert("한달이가 존재하지 않습니다.", "메인화면으로 이동합니다.", [
          { text: "확인", onPress: () => navigation.navigate("MainScreen") },
        ]);
        return;
      }

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        const src =
          characterImageMap?.[data?.handali_img] ??
          require("../assets/character/default_character.png");
        setImageSource(src);
      }
    } catch (error) {
      console.error("이미지 호출 실패:", error);
    }
  }, [navigation, handleAuthFail]);

  /** 달·카테고리별 습관 개수 조회 */
  const fetchMonthCount = useCallback(
    async (catKo, m) => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          await handleAuthFail();
          return { count: 0, unauthorized: true };
        }

        const code = CAT_TO_CODE[catKo];
        const url = `${API_BASE_URL}/habits/category-month?category=${code}&month=${m}`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (res.status === 401 || res.status === 412) {
          await handleAuthFail();
          return { count: 0, unauthorized: true };
        }
        if (!res.ok) return { count: 0, unauthorized: false };

        const json = await res.json().catch(() => ({ habits: [] }));
        const count = Array.isArray(json?.habits) ? json.habits.length : 0;
        return { count, unauthorized: false };
      } catch (e) {
        console.log("카테고리 조회 실패:", catKo, e);
        return { count: 0, unauthorized: false };
      }
    },
    [handleAuthFail]
  );

  /** 포커스 진입마다: 이번 달 습관이 있는 카테고리만 노출 + 캐릭터 갱신 */
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      setCatsLoading(true);

      (async () => {
        const m = monthNow();

        // 캐릭터 이미지 갱신
        await fetchImage();
        if (!mounted) return;

        // 카테고리별 습관 확인
        const results = await Promise.all(
          ALL_CATS_KO.map((c) => fetchMonthCount(c, m))
        );
        if (!mounted) return;

        const hadAuthError = results.some((r) => r.unauthorized);
        if (hadAuthError) {
          setVisibleCats([]);
          setCatsLoading(false);
          return;
        }

        const counts = results.map((r) => r.count);
        const haveHabits = ALL_CATS_KO.filter((_, i) => (counts[i] ?? 0) > 0);

        setVisibleCats(haveHabits);
        // 자동 선택 UX
        if (selectedType && !haveHabits.includes(selectedType)) setSelectedType(null);
      })()
        .catch((e) => console.log("카테고리 갱신 실패:", e))
        .finally(() => mounted && setCatsLoading(false));

      return () => {
        mounted = false;
      };
    }, [fetchImage, fetchMonthCount, selectedType])
  );

  /** 오늘 기록 초기화 */
  const resetTodayRecords = useCallback(async () => {
    if (loading) return;
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return handleAuthFail();

      const url = `${API_BASE_URL}/habits/record-delete`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });

      if (res.status === 401 || res.status === 412) return handleAuthFail();

      if (res.ok) {
        Alert.alert("완료", "오늘 기록이 초기화되었습니다.\n(스탯 값은 유지됩니다.)");
        await fetchImage();
      } else {
        const text = await res.text().catch(() => "");
        Alert.alert("실패", `초기화 중 오류가 발생했어요.\n${res.status} ${text}`);
      }
    } catch (e) {
      Alert.alert("네트워크 오류", e?.message ?? "다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }, [loading, navigation, fetchImage, handleAuthFail]);

  const onLongPressCharacter = useCallback(() => {
    if (selectedType !== null) return;
    Alert.alert(
      "오늘 기록 초기화",
      "오늘 입력한 모든 습관 기록이 삭제됩니다.\n(스탯 값은 그대로 유지)",
      [
        { text: "취소", style: "cancel" },
        { text: "초기화", style: "destructive", onPress: resetTodayRecords },
      ]
    );
  }, [selectedType, resetTodayRecords]);

  const onPressSelect = useCallback(() => {
    if (!selectedType) {
      Alert.alert("알림", "하나의 카테고리를 선택해주세요!");
      return;
    }
    navigation.navigate("HabitDetail", {
      categoryType: selectedType,
      month: monthNow(),
    });
  }, [navigation, selectedType]);

  /** 렌더 */
  const renderBody = () => {
    if (catsLoading) {
      return (
        <View style={styles.habitCategories}>
          <ActivityIndicator />
        </View>
      );
    }

    if (visibleCats.length === 0) {
      return (
        <View style={styles.habitCategories}>
          <Text style={styles.infoText}>
            이번 달에 등록된 습관이 있는 카테고리가 없어요.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.habitCategories}>
        {visibleCats.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.button, selectedType === cat && styles.selectedButton]}
            onPress={() => setSelectedType(cat)}
          >
            <Text style={[styles.buttonText, selectedType === cat && styles.selectedText]}>
              {cat === "활동" ? "활 동" : cat === "지능" ? "지 능" : "예 술"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.backButton}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require("../assets/backButton.png")} />
        </TouchableOpacity>
      </View>

      {/* 상단: 캐릭터(선택 전) 또는 카테고리 로고(선택 후) */}
      <View style={styles.containerTop}>
        {showPrompt && (
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>오늘 뭐했어요?</Text>
            <View style={styles.speechTriangleBorder} />
            <View style={styles.speechTriangle} />
          </View>
        )}

        <Pressable
          onLongPress={onLongPressCharacter}
          delayLongPress={500}
          disabled={loading}
        >
          <Image
            source={getImageSource()}
            style={[
              styles.categoryImage,
              showPrompt && { width: hp("30%"), height: hp("30%") }, // 선택 전엔 크게
            ]}
            resizeMode="contain"
          />
        </Pressable>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator />
          </View>
        )}
      </View>

      {/* 하단: 카테고리 버튼 + 선택하기 */}
      <View style={styles.containerBottom}>
        <View style={styles.todayHabitRecord}>
          <Text style={styles.recordTitle}>오늘 습관 기록</Text>
        </View>

        {renderBody()}

        <View style={styles.selectView}>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={onPressSelect}
            disabled={!selectedType}
          >
            <Text style={styles.selectButtonText}>선택하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/** 스타일 */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  backButton: { marginTop: hp("6%"), marginLeft: wp("6%") },
  containerTop: { flex: 1, alignItems: "center", justifyContent: "center" },
  containerBottom: {
    flex: 1.3,
    backgroundColor: "#76D6F4",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingTop: hp("4%"),
    paddingLeft: hp("5%"),
    paddingRight: hp("5%"),
  },
  speechBubble: {
    position: "absolute",
    top: hp("0%"),
    left: wp("30%"),
    backgroundColor: "white",
    borderRadius: 15,
    padding: wp("2%"),
    width: wp("60%"),
    alignItems: "center",
    borderWidth: 2,
    borderColor: "black",
  },
  speechTriangle: {
    position: "absolute",
    bottom: -15,
    left: "50%",
    marginLeft: -5,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 15,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "white",
  },
  speechTriangleBorder: {
    position: "absolute",
    bottom: -17,
    left: "50%",
    marginLeft: -7,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 17,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "black",
  },
  categoryImage: { width: hp("25%"), height: hp("25%") },
  todayHabitRecord: { flex: 0.4 },
  habitCategories: {
    flex: 3,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  selectView: { flex: 1.5, alignItems: "center", justifyContent: "center" },
  button: {
    backgroundColor: "white",
    opacity: 0.8,
    padding: hp("2%"),
    marginVertical: hp("1%"),
    borderRadius: 20,
    width: "100%",
    alignItems: "center",
  },
  selectedButton: { backgroundColor: "#3076f7" },
  selectButton: {
    backgroundColor: "#FFE98A",
    padding: hp("2.3%"),
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
    opacity: 1,
  },
  recordTitle: { fontSize: wp("5%"), fontFamily: "Jua-Regular" },
  buttonText: { fontSize: wp("4.9%"), fontFamily: "Jua-Regular" },
  selectButtonText: { fontSize: wp("4.9%"), color: "black", fontFamily: "Jua-Regular" },
  speechText: { fontSize: wp("4.5%"), color: "black", fontFamily: "Jua-Regular" },
  selectedText: { fontFamily: "Jua-Regular" },
  loadingOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center", justifyContent: "center",
  },
  infoText: {
    fontSize: wp("4.2%"),
    color: "#0b3a5e",
    textAlign: "center",
    lineHeight: wp("6%"),
  },
});
