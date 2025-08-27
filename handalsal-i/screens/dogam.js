import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";
import { useFocusEffect } from "@react-navigation/native";
// ✅ 수정: characterImageMap 대신 getCharacterImage 함수를 import 합니다.
// ⛔️ 삭제: import { characterImageMap } from "../utils/characterImageMap";
import { getCharacterImage } from "../utils/characterImageLoader"; // 경로는 실제 파일 위치에 맞게 수정해주세요.

const SHADOW_IMG = require("../assets/character/shadow.png");
const TOTAL_SLOTS = 216;
const SCREEN_W = Dimensions.get("window").width;
const COLS = 3;
const H_PADDING = Math.round(wp("3%")); // 좌우 패딩 px
const GAP = Math.max(8, Math.round(SCREEN_W * 0.02)); // 가로/세로 간격 (최소 8px)
const ITEM_SIZE = Math.floor((SCREEN_W - H_PADDING * 2 - GAP * (COLS - 1)) / COLS);
const DEFAULT_CODE = "image_0_0_0.png"; // 기본 캐릭터를 000 슬롯에 고정
const CACHE_KEY = "dex_slots_v1";

function codeToIndex(code) {
  if (!code || typeof code !== "string") return -1;
  if (code === "default_character.png") return 0;
  const m = code.match(/^image_(\d+)_(\d+)_(\d+)\.png$/);
  if (!m) return -1;
  const A = parseInt(m[1], 10);
  const B = parseInt(m[2], 10);
  const C = parseInt(m[3], 10);
  if ([A, B, C].some((v) => isNaN(v) || v < 0 || v > 5)) return -1;
  return A * 36 + B * 6 + C;
}

// 얕은 배열 비교 (슬롯 업데이트 최소화)
function shallowEqualArray(a, b) {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

// 개별 칸 컴포넌트 (메모)
const DexItem = React.memo(function DexItem({ code, codeToAsset }) {
  const unlocked = !!code;
  const src = unlocked ? codeToAsset(code) : SHADOW_IMG;
  return (
    <View style={styles.itemBox}>
      <Image
        source={src}
        style={[
          styles.itemImage,
          unlocked ? styles.unlockedBorder : styles.lockedBorder,
        ]}
        fadeDuration={Platform.OS === "android" ? 0 : undefined}
        progressiveRenderingEnabled
      />
    </View>
  );
});

export default function DexScreen({ navigation }) {
  const [slots, setSlots] = useState(Array(TOTAL_SLOTS).fill(null));
  const [loading, setLoading] = useState(false);

  // ✅ 수정: characterImageMap 객체에서 값을 찾는 대신 getCharacterImage 함수를 호출하도록 변경합니다.
  const codeToAsset = useCallback((code) => {
    if (!code) {
      // 이 경우는 DexItem 컴포넌트에서 SHADOW_IMG로 처리되므로 사실상 호출되지 않습니다.
      return require("../assets/character/default_character.png");
    }
    // 맵에서 조회하는 것이 아니라, 함수를 호출하여 필요한 이미지만 동적으로 로드합니다.
    return getCharacterImage(code);
  }, []);

  // 캐시 로드
  const loadFromCache = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (!raw) return false;
      const cached = JSON.parse(raw);
      if (!Array.isArray(cached) || cached.length !== TOTAL_SLOTS) return false;
      setSlots((prev) => (shallowEqualArray(prev, cached) ? prev : cached));
      return true;
    } catch {
      return false;
    }
  }, []);

  // 서버 호출 (최초 1회)
  const fetchHandbooks = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");

      const res = await fetch(`${API_BASE_URL}/handbooks`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        // 세션 만료 처리 (선택)
        await AsyncStorage.removeItem("authToken");
        Alert.alert("세션 만료", "다시 로그인해주세요.");
        navigation.navigate("Login");
        return;
      }

      const raw = await res.text();
      console.log("[DEX] /handbooks status:", res.status);
      // console.log("[DEX] /handbooks raw:", raw); // raw 데이터가 길 수 있으므로 필요시에만 활성화

      if (!res.ok) {
        Alert.alert("오류", `GET /handbooks 실패: ${res.status}`);
        // 네트워크 실패 시에도 기본 슬롯(000)만 보이게
        const fallback = Array(TOTAL_SLOTS).fill(null);
        fallback[0] = DEFAULT_CODE;
        setSlots((prev) => (shallowEqualArray(prev, fallback) ? prev : fallback));
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fallback));
        return;
      }

      let json = null;
      try {
        json = raw ? JSON.parse(raw) : null;
      } catch (e) {
        console.warn("[DEX] JSON parse 실패:", e);
      }

      const list = Array.isArray(json?.handbooks) ? json.handbooks : [];
      console.log("[DEX] handbooks count:", list.length);

      // 슬롯 초기화 + 기본(000) 보장
      const next = Array(TOTAL_SLOTS).fill(null);
      const i0 = codeToIndex(DEFAULT_CODE);
      if (i0 >= 0) next[i0] = DEFAULT_CODE;

      for (const h of list) {
        const idx = codeToIndex(h.code);
        if (idx >= 0 && idx < TOTAL_SLOTS) next[idx] = h.code;
        else console.warn("[DEX] invalid code (skip):", h.code);
      }

      setSlots((prev) => (shallowEqualArray(prev, next) ? prev : next));
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error("[DEX] fetch error:", e);
      Alert.alert("도감 불러오기 실패", e?.message || "네트워크 오류가 발생했어요.");
      const fallback = Array(TOTAL_SLOTS).fill(null);
      fallback[0] = DEFAULT_CODE;
      setSlots((prev) => (shallowEqualArray(prev, fallback) ? prev : fallback));
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fallback));
    } finally {
      setLoading(false);
    }
  }, [navigation]); // navigation을 의존성 배열에 추가하는 것이 좋습니다.

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const cacheLoaded = await loadFromCache();
        // 캐시가 성공적으로 로드되었더라도 서버에서 최신 데이터를 가져옵니다.
        // 만약 캐시 로드 시 서버 호출을 막고 싶다면 조건문을 추가할 수 있습니다.
        await fetchHandbooks();
      })();
    }, [loadFromCache, fetchHandbooks])
  );

  const ownedCount = useMemo(() => slots.filter(Boolean).length, [slots]);
  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require("../assets/backButton.png")} />
        </TouchableOpacity>
        <Text style={styles.headerText}>도감</Text>
      </View>

      {/* 서브헤더 */}
      <View style={styles.twoheader}>
        <Image source={require("../assets/lock.png")} style={styles.lockicon} />
        <Text style={styles.lockText}>
          {ownedCount} / {TOTAL_SLOTS}
        </Text>
      </View>

      {/* 로딩 */}
      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>불러오는 중…</Text>
        </View>
      )}

      {/* 리스트 */}
      {!loading && (
        <FlatList
          data={slots}
          renderItem={({ item }) => (
            <DexItem code={item} codeToAsset={codeToAsset} />
          )}
          keyExtractor={(item, index) => `${index}-${item || "lock"}`}
          numColumns={3}
          contentContainerStyle={styles.itemList}
          columnWrapperStyle={styles.rowWrap}
          initialNumToRender={24}
          maxToRenderPerBatch={12} // 조금 늘려도 괜찮습니다.
          windowSize={11} // windowSize는 양옆, 현재 화면의 아이템 수를 포함 (3열 기준 5~7 정도면 충분)
          removeClippedSubviews={false}
        />
      )}

      {/* 빈 상태 */}
      {!loading && ownedCount === 0 && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>아직 수집된 캐릭터가 없어요</Text>
          <Text style={styles.emptyDesc}>성장 화면에서 캐릭터를 수집해보세요!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EAF1FA" },

  header: {
    flexDirection: "row",
    gap: wp("27%"),
    alignItems: "center",
    padding: wp("5%"),
    backgroundColor: "#B9D7F1",
  },
  headerText: {
    fontSize: wp("8%"),
    fontFamily: "Jua-Regular",
    color: "#002D73",
  },

  twoheader: {
    flexDirection: "row",
    gap: wp("4%"),
    alignItems: "center",
    padding: wp("5%"),
    backgroundColor: "#EAF1FA",
  },
  lockicon: { marginLeft: wp("30%") },
  lockText: {
    fontSize: wp("5%"),
    fontFamily: "Jua-Regular",
    color: "#000000",
    marginTop: hp("1%"),
  },

  itemList: {
    paddingHorizontal: H_PADDING,
    paddingBottom: hp("10%"),
  },
  rowWrap: {
    justifyContent: "space-between", // 3열 가로 간격 고정
  },
  itemBox: {
    width: ITEM_SIZE,
    marginBottom: GAP,
    alignItems: "center",
  },
  itemImage: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    resizeMode: "contain",
    borderWidth: 1.5,
    borderRadius: Math.round(wp("3%")),
    backgroundColor: "#fff",
  },
  unlockedBorder: { borderColor: "#6BA8E5" },
  lockedBorder: { borderColor: "#CCCCCC" },

  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: hp("10%"),
  },
  loadingText: {
    marginTop: hp("1%"),
    fontSize: wp("4%"),
    color: "#333",
  },

  emptyBox: {
    position: "absolute",
    top: hp("40%"),
    width: "100%",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: wp("4.5%"),
    fontFamily: "Jua-Regular",
    color: "#002D73",
    marginBottom: hp("0.5%"),
  },
  emptyDesc: {
    fontSize: wp("3.5%"),
    color: "#333",
  },
});