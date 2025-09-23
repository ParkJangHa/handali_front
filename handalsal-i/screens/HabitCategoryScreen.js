import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Pressable,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";
import { characterImageMap } from "../utils/characterImageMap";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useFocusEffect } from "@react-navigation/native";
import BottomNav from "../components/BottomNav"; // ✅ 네비게이션 바

const ALL_CATS_KO = ["활동", "지능", "예술"];
const CAT_TO_CODE = { 활동: "ACTIVITY", 지능: "INTELLIGENT", 예술: "ART" };

// ✅ 상단 선택용 카테고리 이미지(썸네일)
const CATEGORY_THUMB = {
  활동: require("../assets/record/activity.png"),
  지능: require("../assets/record/intelligence.png"),
  예술: require("../assets/record/art.png"),
};
const CATEGORY_THUMB_PRESSED = {
  활동: require("../assets/record/activity_pressed.png"),
  지능: require("../assets/record/intelligence_pressed.png"),
  예술: require("../assets/record/art_pressed.png"),
};

// ✅ 상단 타이틀 이미지 & 말풍선 이미지
const TITLE_IMG = require("../assets/record/title.png");
const SPEECH_IMG = require("../assets/record/speechBubble.png");

export default function HabitCategoryScreen({ navigation }) {
  const [selectedType, setSelectedType] = useState(null); // "활동" | "지능" | "예술" | null
  const [imageSource, setImageSource] = useState(require("../assets/character/default_character.png"));
  const [loading, setLoading] = useState(false);
  const [pressedCat, setPressedCat] = useState(null);

  // 이번 달 습관이 있는 카테고리만 표시
  const [visibleCats, setVisibleCats] = useState([]);
  const [catsLoading, setCatsLoading] = useState(true);

const lastPressedCatRef = useRef(null);

  const monthNow = () => new Date().getMonth() + 1; // 1~12

  /** 인증 실패 처리 공통 */
  const handleAuthFail = useCallback(async () => {
    try {
      await AsyncStorage.removeItem("authToken");
    } catch {}
    Alert.alert("인증에 실패했습니다", "다시 로그인해 주세요.", [
      { text: "확인", onPress: () => navigation.navigate("Login") },
    ]);
  }, [navigation]);

  /** 메인 캐릭터 이미지 호출 (하단 캐릭터) */
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
      const base = API_BASE_URL;
      const url = `${base?.replace(/\/$/, "")}/habits/category-month?category=${code}&month=${m}`;

      console.log("[fetchMonthCount] URL:", url, "cat:", catKo, "code:", code, "month:", m);
      console.log("[fetchMonthCount] token exists:", !!token, "API_BASE_URL:", API_BASE_URL);

      const res = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });

      console.log("[fetchMonthCount] status:", res.status);

      if (res.status === 401 || res.status === 412) {
        await handleAuthFail();
        return { count: 0, unauthorized: true };
      }

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.log("[fetchMonthCount] !ok body:", errText);
        return { count: 0, unauthorized: false };
      }

      const json = await res.json();
      const count = Array.isArray(json?.habits) ? json.habits.length : 0;
      return { count, unauthorized: false };
    } catch (e) {
      console.log("카테고리 조회 실패:", catKo, e?.message || e);
      return { count: 0, unauthorized: false };
    }
  },
  [handleAuthFail]
);


  useFocusEffect(
    useCallback(() => {
      setSelectedType(null);
      setPressedCat && setPressedCat(null);
    }, []) 
  );

  useFocusEffect(
  useCallback(() => {
    let mounted = true;
    setCatsLoading(true);

    (async () => {
      const m = monthNow();
      await fetchImage();
      if (!mounted) return;

      const results = [];
      for (const cat of ALL_CATS_KO) {
        // 순차 호출
        let r = await fetchMonthCount(cat, m);
        if (!r || r.unauthorized) {
          if (r?.unauthorized) {
            // 이미 handleAuthFail 처리됨
            results.push({ cat, count: 0 });
            continue;
          }
        }

        // 네트워크 실패 같은 비정상(카운트=0인데 로그에서 'Network request failed' 본 케이스) → 1회 재시도
        if (!r || (r.count === 0 && __DEV__)) {
          try {
            const retry = await fetchMonthCount(cat, m);
            r = retry || r;
          } catch {}
        }

        results.push({ cat, count: r?.count ?? 0 });
      }

      if (!mounted) return;
      const haveHabits = results.filter((x) => (x.count || 0) > 0).map((x) => x.cat);
      setVisibleCats(haveHabits);
    })()
      .catch((e) => console.log("카테고리 갱신 실패:", e))
      .finally(() => mounted && setCatsLoading(false));

    return () => { mounted = false; };
  }, [fetchImage, fetchMonthCount])
);



  /** 오늘 기록 초기화 (하단 캐릭터 롱프레스) */
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

  /** 카테고리 이미지 탭(한번 눌러 선택, 같은 걸 다시 누르면 이동) */
  const onPressCategory = useCallback(
    (cat) => {
      if (selectedType !== cat) {
        setSelectedType(cat);        // 선택 고정
        setPressedCat(cat);          // 시각도 눌림 상태 유지
        lastPressedCatRef.current = cat;
        return;
      }
      // 이미 선택된 걸 다시 누르면 이동
      navigation.navigate("SelectHabit", {
        categoryType: cat,
        month: monthNow(),
      });
    },
    [navigation, selectedType]
  );

  return (
    <View style={styles.container}>
      {/* 최상단 타이틀 이미지 */}
      <View style={styles.titleWrap}>
        <Image source={TITLE_IMG} style={styles.titleImg} resizeMode="contain" />
      </View>
        <View
          style={[
            styles.topRow,
            visibleCats.length === 1 && styles.rowCenter,
            visibleCats.length === 2 && styles.rowBetween,
            visibleCats.length >= 3 && styles.rowBetween,
          ]}
        >
          {catsLoading ? (
            <ActivityIndicator />
          ) : visibleCats.length === 0 ? (
            <Text style={{ fontFamily: "Jua-Regular", color: "#666" }}>
              이번 달에 등록된 카테고리가 없어요.
            </Text>
          ) : (
            visibleCats.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => onPressCategory(cat)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPressIn={() => setPressedCat(cat)}
                style={[
                  styles.itemBox,
                  visibleCats.length === 1 && styles.itemW1, // 1개일 때 폭
                  visibleCats.length === 2 && styles.itemW2, // 2개일 때 폭
                  visibleCats.length >= 3 && styles.itemW3,  // 3개 이상일 때 폭
                ]}
              >
                <Image
                  source={
                    (selectedType === cat || pressedCat === cat)
                      ? CATEGORY_THUMB_PRESSED[cat]
                      : CATEGORY_THUMB[cat]
                  }
                  style={styles.catImage}
                  resizeMode="contain"
                />
              </Pressable>
            ))
          )}
        </View>

      {/* 말풍선 이미지 + 하단 캐릭터 */}
      <View style={styles.middleArea}>
        {/* 말풍선(이미지) */}
        <Image source={SPEECH_IMG} style={styles.speechImg} resizeMode="contain" />
        {/* 하단 캐릭터 (롱프레스=오늘 기록 초기화) */}
        <Pressable onLongPress={resetTodayRecords} delayLongPress={500} disabled={loading}>
          <Image source={imageSource} style={styles.characterImg} resizeMode="contain" />
        </Pressable>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator />
          </View>
        )}
      </View>

      {/* 하단 네비게이션 바(기록 화면이므로 mode="record") */}
      <BottomNav navigation={navigation} mode="record" active="Record" />

      {/* 바 위·오른쪽 살짝 그림자(선택) */}
    </View>
  );
}

/** 스타일 */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  /** 최상단 타이틀 */
  titleWrap: {
    marginTop: hp("10%"),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp("6%"),
  },
  titleImg: {
    width: "100%",
    height: hp("9%"),
  },

  /** 상단 3이미지 일렬 */
  topRow: {
   marginTop: hp("2%"),
   flexDirection: "row",
   alignItems: "center",
   paddingHorizontal: wp("3%"),
 },
 rowCenter: {
   justifyContent: "center",
   columnGap: 0,
 },
 rowBetween: {
   justifyContent: "space-between",
   columnGap: wp("4%"),
 },

  itemBox: {
   height: hp("35%"),
   alignItems: "center",
   justifyContent: "center",
   overflow: "hidden",
 },
 itemW1: { width: wp("26%") },  // 1개 → 가운데에 적당히 크게
 itemW2: { width: wp("26%") },  // 2개 → 좌우 균등
 itemW3: { width: wp("26%") },  // 3개 → 현재 느낌 유지
 catImage: {
   width: "100%",
   height: "100%",
   resizeMode: "contain",
 },

  /** 중간: 말풍선 + 캐릭터 */
  middleArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: wp("6%"),
  },
  speechImg: {
    position: "absolute",
    bottom: hp("34%"),
    width: wp("70%"),
    height: hp("8%"),
    zIndex: 3,
    alignSelf: "center"
  },
  characterImg: {
    width: hp("24%"),
    height: hp("24%"),
    left: wp("25%"),
    marginBottom: hp("12%"), // 아래 네비게이션 바 고려해 띄움
  },

  /** 로딩 오버레이 */
  loadingOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
