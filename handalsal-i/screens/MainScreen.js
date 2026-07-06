import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  ImageBackground,
  Animated,
  Pressable,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";
import { useFocusEffect } from "@react-navigation/native";
import { characterImageMap } from "../utils/characterImageMap";
import { storeItemImageMap } from "../utils/storeItemImageMap";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import BottomNav from "../components/BottomNav";

const SCREEN_W = Dimensions.get("window").width;
const CARD_W = SCREEN_W * 0.6;
const CARD_GAP = SCREEN_W * 0.03;
const SNAP = CARD_W + CARD_GAP;

export default function MainScreen({ navigation }) {
  const [nickname, setNickname] = useState("");
  const [daysSinceCreated, setDaysSinceCreated] = useState(0);
  const [totalCoin, setTotalCoin] = useState(0);
  const [handaliImage, setHandaliImage] = useState(
    characterImageMap["default_character.png"]
  );
  // ===== 공통 유틸 =====
  const toDateStr = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };
  const getThisMonday = () => {
    const now = new Date();
    const day = now.getDay(); // 0=일,1=월,...6=토
    const diffToMon = (day + 6) % 7; // 월:0
    const mon = new Date(now);
    mon.setHours(0, 0, 0, 0);
    mon.setDate(now.getDate() - diffToMon);
    return mon;
  };
  // "YYYY년 M월 N주차" 타이틀
  const getWeekTitle = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const first = new Date(y, m - 1, 1);
    const firstDay = first.getDay();
    const offset = (firstDay + 6) % 7;
    const weekNo = Math.ceil((offset + now.getDate()) / 7);
    return `${y}년 ${m}월 ${weekNo}주차`;
  };
  const getWeekParts = () => {
    const full = getWeekTitle(); // 예: "2025년 9월 2주차"
    const m = full.match(/^(.*\s)(\d+주차)$/);
    if (m) return { ym: m[1].trim(), week: m[2] };
    return { ym: full, week: "" };
  };

  // ===== 주급 패널 상태 =====
  const [weeklyPanelOpen, setWeeklyPanelOpen] = useState(false);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [weeklyBadge, setWeeklyBadge] = useState(false); // 월요일 + 미확인 시 true
  const [weeklyData, setWeeklyData] = useState({
    totalSalary: 0,
    totalCount: 0,
    items: [],
  });

  const scrollRef = useRef(null);
  const [page, setPage] = useState(0);
  const pageMax = Math.max(0, (weeklyData.items?.length || 1) - 1);

  const goPrev = () => {
    const p = Math.max(0, page - 1);
    setPage(p);
    scrollRef.current?.scrollTo({ x: p * SNAP, animated: true });
  };
  const goNext = () => {
    const p = Math.min(pageMax, page + 1);
    setPage(p);
    scrollRef.current?.scrollTo({ x: p * SNAP, animated: true });
  };
  React.useEffect(() => setPage(0), [weeklyData.items]);

  const [appliedItems, setAppliedItems] = useState({
    소파: null,
    배경: null,
    벽장식: null,
    바닥장식: null,
  });
  const [stats, setStats] = useState({
    activity_value: 0,
    intelligence_value: 0,
    art_value: 0,
  });

  const getSeatType = (rawName) => {
    if (!rawName) return "unknown";
    const norm = String(rawName).trim().replace(/ /g, "_");
    if (/_Chair$/i.test(norm)) return "chair";
    if (/_Sofa$/i.test(norm)) return "sofa";
    return "unknown";
  };

  // === D-day 유틸: 다음달 1일까지 남은 일수 계산 (로컬 타임존 기준) ===
  const getNextMonthFirstInfo = () => {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + 1, 1); // 다음달 1일 00:00
    target.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const msPerDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.max(0, Math.ceil((target - today) / msPerDay));

    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, "0");
    const dd = String(target.getDate()).padStart(2, "0");

    return { dday: diffDays, dateStr: `${yyyy}-${mm}-${dd}` };
  };

  // 설정 모달
  const [modalVisible, setModalVisible] = useState(false);

  // ===== 레벨/퍼센트 계산 =====
  const THRESHOLDS = [10, 25, 45, 70, 100];
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

  // ===== 일일 퀘스트 상태 =====
  const [quest, setQuest] = useState(null);
  const [questPanelOpen, setQuestPanelOpen] = useState(false);
  const [questLoading, setQuestLoading] = useState(false);
  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = (d) => d === todayStr;
  const shouldHideQuestUI =
    quest && isToday(quest.date) && quest.status === "COMPLETED";

  const debounce = (fn, delay = 600) => {
    let timer;
    return (...args) => {
      if (timer) return;
      fn(...args);
      timer = setTimeout(() => {
        timer = null;
      }, delay);
    };
  };

  const QUEST_POOL = [
    { id: "q_any_record", title: "오늘의 습관 기록하기", coin: 15, match: { type: "ANY_RECORD" } },
    { id: "q_water_5", title: "물 5잔 마시기", coin: 10, match: { type: "MANUAL" } },
    { id: "q_diary_5", title: "일기 5줄 쓰기", coin: 10, match: { type: "MANUAL" } },
  ];

  const pickRandomQuest = () => {
    const q = QUEST_POOL[Math.floor(Math.random() * QUEST_POOL.length)];
    return {
      id: q.id,
      title: q.title,
      coin: q.coin,
      match: q.match,
      date: todayStr,
      status: "AVAILABLE", // AVAILABLE | ACCEPTED | COMPLETABLE | COMPLETED
      localToken: null,
      recordedAt: null,
    };
  };

  const resetTodayQuest = async () => {
    await AsyncStorage.removeItem("daily_quest");
    const newQuest = pickRandomQuest();
    setQuest(newQuest);
    await AsyncStorage.setItem("daily_quest", JSON.stringify(newQuest));
    Alert.alert("리셋", "오늘 퀘스트가 초기화되었습니다.");
    setQuestPanelOpen(true);
  };

  const loadOrCreateTodayQuest = async () => {
    try {
      const saved = await AsyncStorage.getItem("daily_quest");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === todayStr) {
          setQuest(parsed);
          return;
        }
      }
      const newQuest = pickRandomQuest();
      setQuest(newQuest);
      await AsyncStorage.setItem("daily_quest", JSON.stringify(newQuest));
    } catch (e) { }
  };

  const refreshQuestFromStorage = async () => {
    try {
      const raw = await AsyncStorage.getItem("daily_quest");
      if (raw) setQuest(JSON.parse(raw));
    } catch (e) { }
  };

  const handleAcceptQuest = debounce(async () => {
    if (!quest) return;
    if (quest.status !== "AVAILABLE") return;
    const next = {
      ...quest,
      status: quest?.match?.type === "MANUAL" ? "COMPLETABLE" : "ACCEPTED",
    };
    setQuest(next);
    await AsyncStorage.setItem("daily_quest", JSON.stringify(next));
  }, 500);

  const handleCompleteQuest = debounce(async () => {
    if (!quest) return;

    if (quest.match?.type === "ANY_RECORD") {
      if (quest.status !== "COMPLETABLE" || !quest.localToken) {
        Alert.alert("안내", "먼저 오늘의 습관을 기록해주세요!");
        return;
      }
    } else if (quest.match?.type === "MANUAL") {
      if (!(quest.status === "ACCEPTED" || quest.status === "COMPLETABLE")) {
        Alert.alert("안내", "수락 후 완료할 수 있어요.");
        return;
      }
    } else {
      Alert.alert("안내", "완료 조건이 정의되지 않은 퀘스트입니다.");
      return;
    }

    try {
      setQuestLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      const res = await fetch(`${API_BASE_URL}/quest-award`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ coin: quest.coin }),
      });

      if (!res.ok) {
        Alert.alert("보상 실패", `상태코드: ${res.status}`);
        return;
      }

      const next = { ...quest, status: "COMPLETED", localToken: null };
      setQuest(next);
      await AsyncStorage.setItem("daily_quest", JSON.stringify(next));
      await fetchHandaliStatus();
      Alert.alert("축하!", `일일 퀘스트 보상 ${quest.coin}코인을 받았어요!`);
    } catch (e) {
      Alert.alert("오류", "보상 지급 중 문제가 발생했어요.");
    } finally {
      setQuestLoading(false);
    }
  }, 800);

  // ===== 서버 연동 =====
  const fetchHandaliStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("세션 만료", "다시 로그인해주세요.");
        navigation.navigate("Login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/handalis/view`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        await AsyncStorage.removeItem("authToken");
        Alert.alert("세션 만료", "로그인이 만료되었습니다. 다시 로그인해주세요.");
        navigation.navigate("Login");
        return;
      }

      if (response.ok) {
        const data = await response.json();

        setStats({
          activity_value: Number(data.activity_value ?? 0),
          intelligence_value: Number(data.intelligence_value ?? 0),
          art_value: Number(data.art_value ?? 0),
        });
        setNickname(data.nickname);
        setDaysSinceCreated(data.days_since_created);
        setTotalCoin(data.total_coin);

        if (data.handali_img && characterImageMap[data.handali_img]) {
          setHandaliImage(characterImageMap[data.handali_img]);
        } else {
          setHandaliImage(characterImageMap["default_character.png"]);
        }

        const applied = {
          소파: data.sofa_img?.includes("none") ? null : data.sofa_img,
          배경: data.background_img?.includes("none") ? null : data.background_img,
          벽장식: data.wall_img?.includes("none") ? null : data.wall_img,
          바닥장식: data.floor_img?.includes("none") ? null : data.floor_img,
        };
        setAppliedItems(applied);
      } else if (response.status === 404) {
        checkLastHandali();
      } else {
        Alert.alert("오류", `오류 코드: ${response.status}`);
      }
    } catch (error) {
      console.error("한달이 상태 조회 오류:", error);
      Alert.alert("오류", "네트워크 오류가 발생했습니다.");
      setHandaliImage(characterImageMap["default_character.png"]);
    }
  };

  const checkLastHandali = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/handalis/recent`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        navigation.navigate("JobScreen", { handaliId: data.handali_id });
      } else if (response.status === 404) {
        navigation.navigate("CategorySelectScreen");
      } else {
        Alert.alert("오류", "서버 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("마지막 생성된 한달이 조회 오류:", error);
      navigation.navigate("CategorySelectScreen");
    }
  };
  const fetchWeeklySalary = async () => {
    try {
      setWeeklyLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      const res = await fetch(`${API_BASE_URL}/handalis/week-salary`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`status ${res.status}`);

      const json = await res.json();
      const arr = Array.isArray(json?.handalis_salary) ? json.handalis_salary : [];
      const items = arr.map((x) => ({
        nickname: x.nickname,
        job: x.job ?? null,                                 // ← job_name → job
        salary: Number(x.salary ?? 0),
        start_date: x.start_date,
        activity_level: x.activity_level ?? null,
        intelligent_level: x.intelligent_level ?? null,     // ← 철자 변경
        art_level: x.art_level ?? null,
      }));
      items.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

      setWeeklyData({
        totalSalary: Number(json?.total_salary ?? 0),       // ← API 총합 사용
        totalCount: Number(json?.total_handali ?? items.length),
        items,
      });
    } catch (e) {
      console.log("week-salary error", e);
    } finally {
      setWeeklyLoading(false);
    }
  };
  const updateWeeklyBadge = async () => {
    try {
      const monStr = toDateStr(getThisMonday());
      const seenKey = `weekly_seen_${monStr}`;
      const seen = await AsyncStorage.getItem(seenKey);

      const isMonday = new Date().getDay() === 1;
      setWeeklyBadge(isMonday && !seen);

      // 데이터 프리페치
      fetchWeeklySalary();
    } catch (e) { }
  };

  const openWeeklyPanel = async () => {
    // 월요일 아니어도 언제든 열 수 있음
    const monStr = toDateStr(getThisMonday());
    const seenKey = `weekly_seen_${monStr}`;
    await AsyncStorage.setItem(seenKey, "1");
    setWeeklyBadge(false);

    if (!weeklyData.items?.length) await fetchWeeklySalary();
    setWeeklyPanelOpen(true);
  };

  // ===== 화면 포커스 시 데이터 갱신 =====
  const intervalRef = useRef(null);
  useFocusEffect(
    React.useCallback(() => {
      fetchHandaliStatus();
      loadOrCreateTodayQuest();
      refreshQuestFromStorage();
      updateWeeklyBadge();
      intervalRef.current = setInterval(fetchHandaliStatus, 60000);
      return () => clearInterval(intervalRef.current);
    }, [])
  );

  // ===== 캐릭터 말풍선 =====
  const [quoteVisible, setQuoteVisible] = useState(false);
  const quotes = [
    "오늘도 수고했어!",
    "한 걸음 한 걸음이 모여~",
    "성장하고 있어, 나도 너도!",
    "잠깐 쉬는 것도 괜찮아",
    "기록은 곧 힘이야!",
    "오늘도 스스로를 위해 \n노력한 당신, 정말 멋져요!",
    "한 달 뒤 멋진 나를 기대해요!",
    "하루하루 쌓인 당신의 습관이,\n한달이의 날개가 되고 있어요!",
    "잠깐 쉬어도 괜찮아요. 중요한 건 \n다시 일어나는 당신의 마음이에요.",
    "오늘의 작은 실천이 내일의\n 큰 변화를 만들어요.",
    "포기하지 않는 당신을 한달이는\n 누구보다 자랑스러워해요!",
    "지금 이 순간도 당신은 성장하고 있어요.\n 느껴지지 않아도 괜찮아요.",
    "완벽하지 않아도 괜찮아요.\n 꾸준함이 당신을 빛나게 해요.",
    "오늘도 자기 자신을 위해 \n시간을 낸 당신, 정말 대단해요!",
    "슬픈 날도, 기쁜 날도 당신의 기록은\n 한달이에게 소중해요.",
    "한 걸음 느려도 괜찮아요. 멈추지 않는\n 당신이 최고예요.",
    "내일도 함께해요. 한달이는\n 항상 당신 편이에요.",
  ];
  const getRandomQuote = () => quotes[Math.floor(Math.random() * quotes.length)];

  // ===== 미니 스탯 바 컴포넌트 =====
  const StatMiniBar = ({ label, value, icon }) => {
    const { level, percent } = getLevelProgressByValue(value);
    return (
      <View style={styles.statRow}>
        <Image source={icon} style={styles.statIcon} />
        <Text style={styles.statLabel}>{label}</Text>

        <View style={styles.statBarBg}>
          <View style={[styles.statBarFill, { width: `${percent}%` }]} />
        </View>

        <Text style={styles.statLevel}>Lv.{level}</Text>
      </View>
    );
  };

  // ====== 우하단 FAB (기록소/도감) + 퀘스트 버튼 동시 상승 ======
  const [fabOpen, setFabOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);        // ✅ 애니메이션 잠금
  const fabAnim = useRef(new Animated.Value(0)).current; // 0 닫힘, 1 열림

  const toggleFab = () => {
    if (isAnimating) return;
    const next = !fabOpen;
    setFabOpen(next);
    setIsAnimating(true);

    Animated.timing(fabAnim, {
      toValue: next ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setIsAnimating(false);
    });
  };

  const actions = [
    {
      key: "summary", label: "기록소", icon: require("../assets/icons/summary.png"),
      onPress: () => navigation.navigate("Summary")
    },
    {
      key: "dogam", label: "도감", icon: require("../assets/icons/dogam.png"),
      onPress: () => navigation.navigate("Dogam")
    },
  ];
  const gap = hp("7%");
  const rise = gap * actions.length + hp("2%");

  const handleLogout = async () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "확인",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("authToken");
            if (token) {
              await fetch(`${API_BASE_URL}/logout`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
              });
            }
          } catch (e) { }
          await AsyncStorage.removeItem("authToken");
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    const confirm = await new Promise((resolve) => {
      Alert.alert(
        "회원 탈퇴",
        "정말로 탈퇴하시겠습니까?",
        [
          { text: "취소", style: "cancel", onPress: () => resolve(false) },
          { text: "탈퇴", style: "destructive", onPress: () => resolve(true) },
        ],
        { cancelable: true }
      );
    });

    if (!confirm) return;

    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        Alert.alert("탈퇴 완료", "정상적으로 탈퇴되었습니다.");
        await AsyncStorage.removeItem("authToken");
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      } else {
        const text = await response.text();
        Alert.alert("에러", `탈퇴 실패: ${text}`);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("에러", "네트워크 오류가 발생했습니다.");
    }
  };
  const { ym, week } = getWeekParts();
  return (
    <ImageBackground
      source={require("../assets/storeItems/배경없음.png")}
      style={styles.background}
      resizeMode="cover"
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.container}>
        {/* 상단바: 코인 + 설정 */}
        <View style={styles.topBar}>
          {/* 왼쪽 묶음: 코인 + D-day */}
          <View style={styles.topLeftCluster}>
            {/* 코인 알약 */}
            <TouchableOpacity style={styles.coinPill} onPress={openWeeklyPanel} onLongPress={resetTodayQuest}>
              <Image
                source={
                  weeklyBadge && new Date().getDay() === 1
                    ? require("../assets/icons/exclamation.png")
                    : require("../assets/icons/coin.png")
                }
                style={styles.coinIcon}
              />
              <Text style={styles.coinValue}>{totalCoin}</Text>
              <Text style={styles.coinLabel}>coin</Text>
            </TouchableOpacity>

            {/* D-day 박스 (탭 시 안내) */}
            <TouchableOpacity
              style={styles.profilePill}
              activeOpacity={0.9}
              onPress={() => {
                const { dday, dateStr } = getNextMonthFirstInfo();
                const display = dday === 0 ? "D-DAY" : `D-${dday}`;
                Alert.alert(
                  "독립 예정",
                  `다음달 1일에 독립해요!\n(${dateStr})\n남은 일수: ${display}`
                );
              }}
            >
              <Text style={styles.profileText}>
                {(() => {
                  const { dday } = getNextMonthFirstInfo();
                  return dday === 0 ? "D-DAY" : `D-${dday}`;
                })()}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 설정 알약 */}
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.settingsPill}>
            <Image source={require("../assets/icons/setting.png")} style={styles.settingsIcon} />
          </TouchableOpacity>
        </View>

        {/* 미니 스탯 카드 */}
        <View style={styles.miniStatsCard}>
          <StatMiniBar
            label="활동"
            value={stats.activity_value}
            icon={require("../assets/icons/activity.png")}
          />
          <StatMiniBar
            label="지능"
            value={stats.intelligence_value}
            icon={require("../assets/icons/intelligence.png")}
          />
          <StatMiniBar
            label="예술"
            value={stats.art_value}
            icon={require("../assets/icons/art.png")}
          />
        </View>

        {/* 설정 모달 */}
        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* <TouchableOpacity
                onPress={() => { setModalVisible(false); navigation.navigate("JobScreen"); }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>[개발용]직업 화면</Text>
              </TouchableOpacity> */}

              {/* <TouchableOpacity
                onPress={() => { setModalVisible(false); navigation.navigate("GrowthScreen"); }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>[개발용]성장 화면</Text>
              </TouchableOpacity> */}

              <TouchableOpacity
                onPress={async () => {
                  await AsyncStorage.removeItem("tutorial_seen");
                  setModalVisible(false);
                  navigation.replace("TutorialScreen");
                }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>[수정중]튜토리얼 보기</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLogout} style={styles.button}>
                <Text style={styles.buttonText}>로그아웃</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteAccount} style={styles.button}>
                <Text style={styles.buttonText}>회원탈퇴</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 본문 콘텐츠 */}
        <View style={styles.content}>
          {/* 벽장식 */}
          {appliedItems["벽장식"] && (
            <Image
              source={
                storeItemImageMap[appliedItems["벽장식"].replace(/ /g, "_")] ||
                storeItemImageMap.default
              }
              style={styles.window}
            />
          )}

          {/* 바닥장식 */}
          {appliedItems["바닥장식"] && (
            <Image
              source={
                storeItemImageMap[appliedItems["바닥장식"].replace(/ /g, "_")] ||
                storeItemImageMap.default
              }
              style={styles.floor}
            />
          )}

          {/* 소파/의자 */}
          {appliedItems["소파"] && (() => {
            const name = appliedItems["소파"];
            const key = name.replace(/ /g, "_");
            const type = getSeatType(name); // "chair" | "sofa" | "unknown"

            return (
              <Image
                source={storeItemImageMap[key] || storeItemImageMap.default}
                style={
                  type === "chair" ? styles.chair :
                    type === "sofa" ? styles.sofa :
                      styles.sofa // 기본은 소파 스타일
                }
              />
            );
          })()}

          {/* 캐릭터 */}
          <TouchableOpacity
            style={styles.characterContainer}
            onPress={() => {
              setQuoteVisible(true);
              setTimeout(() => setQuoteVisible(false), 7000);
            }}
          >
            {quoteVisible && (
              <View style={styles.speechBubble}>
                <Text style={styles.speechText}>{getRandomQuote()}</Text>
              </View>
            )}
            <Image source={handaliImage} style={styles.character} />
          </TouchableOpacity>
        </View>

        {/* === 우하단 FAB & 액션 === */}
        {(fabOpen || isAnimating) && (
          <Pressable
            style={styles.fabBackdrop}
            pointerEvents={fabOpen && !isAnimating ? "auto" : "none"}  // ✅ 이동 중 닫기 탭 방지
            onPress={toggleFab}
          />
        )}

        {/* FAB 메인 버튼(우하단, 네비 위) */}
        <TouchableOpacity
          style={[
            styles.fabMain,
            { backgroundColor: fabOpen ? "#84CBFE" : "#84CBFE" },
          ]}
          onPress={toggleFab}
          activeOpacity={0.9}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Image source={require("../assets/icons/menu.png")} style={styles.fabMainIcon} />
        </TouchableOpacity>

        {/* 펼쳐지는 액션: 기록소/도감 */}
        {(fabOpen || isAnimating) && (
          <View
            pointerEvents={fabOpen && !isAnimating ? "box-none" : "none"}  // ✅ 닫힘/이동 중 터치 차단
            style={styles.fabActionsWrap}
          >
            {actions.map((a, idx) => {
              const translateY = fabAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -gap * (idx + 1)],
              });
              const opacity = fabAnim.interpolate({
                inputRange: [0, 0.6, 1],
                outputRange: [0, 0.9, 1],
              });
              const scale = fabAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              });

              return (
                <Animated.View
                  key={a.key}
                  style={[
                    styles.fabActionItem,
                    { transform: [{ translateY }, { scale }], opacity },
                  ]}
                >
                  <View style={styles.fabLabelBubbleRight}>
                    <Text style={styles.fabLabelText}>{a.label}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.fabIconBtn}
                    activeOpacity={0.85}
                    disabled={!fabOpen || isAnimating}               // ✅ 애니메이션 중 비활성
                    onPress={() => {
                      toggleFab();
                      setTimeout(() => a.onPress(), 160);
                    }}
                  >
                    <Image source={a.icon} style={styles.fabIcon} />
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        )}

        {/* 퀘스트 버튼: FAB 열림에 맞춰 함께 위로 이동 (우하단 기준) */}
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.questAnchor,
            {
              transform: [
                {
                  translateY: fabAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -rise],
                  }),
                },
              ],
            },
          ]}
        >
          {!shouldHideQuestUI && (
            <TouchableOpacity
              style={[
                styles.questFabAbs,
                { backgroundColor: questPanelOpen ? "#84CBFE" : "#84CBFE" },
              ]}
              activeOpacity={0.85}
              disabled={isAnimating}                                // ✅ 이동 중 클릭 금지
              onPress={() => setQuestPanelOpen(v => !v)}
              onLongPress={async () => {
                await AsyncStorage.removeItem("daily_quest");
                const newQuest = pickRandomQuest();
                setQuest(newQuest);
                await AsyncStorage.setItem("daily_quest", JSON.stringify(newQuest));
                Alert.alert("리셋", "오늘 퀘스트가 초기화되었습니다.");
              }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Image
                source={require("../assets/icons/quest.png")}
                style={styles.questIcon}
              />
            </TouchableOpacity>
          )}

          {(!shouldHideQuestUI) && questPanelOpen && quest && (
            <View
              style={styles.questPanelRightAbs}
              pointerEvents={isAnimating ? "none" : "auto"}          // ✅ 이동 중 패널 조작 금지
            >
              {/* ── (A) 헤더: 아이콘 + 타이틀 + 상태칩 ── */}
              <View style={styles.qHeaderRow}>
                <View style={styles.qHeaderLeft}>
                  <Image source={require("../assets/icons/quest.png")} style={styles.qHeaderIcon} />
                  <Text style={styles.qHeaderTitle}>일일 퀘스트</Text>
                </View>

                <View
                  style={[
                    styles.qStatusChip,
                    quest.status === "AVAILABLE" && { backgroundColor: "#EAF6FF" },
                    quest.status === "ACCEPTED" && { backgroundColor: "#FFF7E8" },
                    quest.status === "COMPLETABLE" && { backgroundColor: "#EFFFF3" },
                    quest.status === "COMPLETED" && { backgroundColor: "#F1F1F1" },
                  ]}
                >
                  <Text
                    style={[
                      styles.qStatusText,
                      quest.status === "AVAILABLE" && { color: "#2D5D6B" },
                      quest.status === "ACCEPTED" && { color: "#B66600" },
                      quest.status === "COMPLETABLE" && { color: "#0F8A3A" },
                      quest.status === "COMPLETED" && { color: "#555" },
                    ]}
                  >
                    {quest.status === "AVAILABLE" ? "대기"
                      : quest.status === "ACCEPTED" ? "진행중"
                        : quest.status === "COMPLETABLE" ? "완료 가능"
                          : "완료"}
                  </Text>
                </View>
              </View>

              {/* ── (B) 본문: 내용 + 보상 ── */}
              <Text style={styles.qBodyText}>{quest.title}</Text>

              <View style={styles.qRewardRow}>
                <Image source={require("../assets/icons/coin.png")} style={styles.qRewardIcon} />
                <Text style={styles.qRewardText}>{quest.coin} 코인</Text>
              </View>

              <View style={styles.qDivider} />

              {/* ── (C) CTA: 상태별 버튼 ── */}
              {quest.status === "AVAILABLE" && (
                <TouchableOpacity
                  style={[styles.qPrimaryBtn, styles.qBtnBlue]}
                  onPress={handleAcceptQuest}
                  activeOpacity={0.9}
                >
                  <Text style={styles.qPrimaryBtnText}>수락</Text>
                </TouchableOpacity>
              )}

              {(quest.status === "ACCEPTED" && quest?.match?.type === "ANY_RECORD") && (
                <TouchableOpacity
                  style={[styles.qPrimaryBtn, styles.qBtnBlue]}
                  onPress={() => {
                    setQuestPanelOpen(false);
                    navigation.navigate("Record");
                  }}
                  activeOpacity={0.9}
                >
                  <Text style={styles.qPrimaryBtnText}>기록하러 가기</Text>
                </TouchableOpacity>
              )}

              {quest.status === "COMPLETABLE" && (
                <TouchableOpacity
                  style={[styles.qPrimaryBtn, styles.qBtnGreen]}
                  onPress={handleCompleteQuest}
                  disabled={questLoading}
                  activeOpacity={0.9}
                >
                  <Text style={styles.qPrimaryBtnText}>
                    {questLoading ? "지급 중..." : "완료"}
                  </Text>
                </TouchableOpacity>
              )}

              {quest.status === "COMPLETED" && (
                <View style={[styles.qPrimaryBtn, styles.qBtnGray]}>
                  <Text style={styles.qPrimaryBtnText}>완료됨</Text>
                </View>
              )}
            </View>
          )}

        </Animated.View>

        {/* === 주급 확인 오버레이 === */}
        {weeklyPanelOpen && (
          <>
            <Pressable pointerEvents="auto" style={styles.weeklyBackdrop} onPress={() => setWeeklyPanelOpen(false)} />
            <View style={styles.weeklyPanel}>
              {/* 상단 요약 */}
              <Text style={styles.weeklyHeader}>
                주급내역   <Text style={styles.weeklyHeaderYM}>{ym} </Text>
                <Text style={styles.weeklyWeekEmph}>{week}</Text>
              </Text>
              <View style={styles.sep} />
              <View style={styles.weeklySummaryWrap}>
                <Text style={styles.weeklySub}>
                  보유 한달이 수: {weeklyLoading ? "-" : weeklyData.totalCount}
                </Text>
                <Text style={styles.weeklySub}>
                  총 주급: {weeklyLoading ? "-" : `${weeklyData.totalSalary.toLocaleString()} 코인`}
                </Text>
              </View>
              <View style={styles.sep} />

              {/* 중앙: 한 달이 1명 = 1페이지 (좌/우 스와이프 페이징) */}
              <View style={styles.weeklyPagerFrame}>
                <Animated.ScrollView
                  ref={scrollRef}
                  horizontal
                  snapToInterval={SNAP}
                  decelerationRate="fast"
                  snapToAlignment="start"
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={({ nativeEvent }) => {
                    const p = Math.round(nativeEvent.contentOffset.x / SNAP);
                    setPage(Math.max(0, Math.min(pageMax, p)));
                  }}
                  contentContainerStyle={{
                    alignItems: "stretch",
                    paddingLeft: CARD_GAP,
                    paddingRight: CARD_GAP / 2, // 양끝 여백
                  }}
                >
                  {(weeklyData.items?.length ? weeklyData.items : [{
                    nickname: "한달이",
                    salary: 0,
                    start_date: "-",
                    activity_level: null, intelligent_level: null, art_level: null, job: null,
                  }]).map((it, idx) => (
                    <View key={`${it.nickname}-${idx}`} style={styles.oneHandaliCard}>
                      <View style={styles.cardGrid}>
                        {/* 블록 1: 별명 */}
                        <View style={styles.block}>
                          <Text style={styles.blockTitle}>별명</Text>
                          <Text style={styles.blockValue} numberOfLines={1}>
                            {it.nickname ?? "-"}
                          </Text>
                        </View>

                        {/* 블록 2: 활동/지능/예술 (2행 구조: 라벨행 / 값행) */}
                        <View style={styles.block}>
                          <Text style={styles.blocktitleStat}>스탯</Text>
                          <View style={styles.blockStatRow}>
                            <Text style={styles.statLabel}>활동</Text>
                            <Text style={styles.statLabel}>지능</Text>
                            <Text style={styles.statLabel}>예술</Text>
                          </View>
                          <View style={styles.blockStatRow}>
                            <Text style={styles.statValue}>{it.activity_level ?? "-"}</Text>
                            <Text style={styles.statValue}>{it.intelligent_level ?? "-"}</Text>
                            <Text style={styles.statValue}>{it.art_level ?? "-"}</Text>
                          </View>
                        </View>

                        {/* 블록 3: 직업 */}
                        <View style={styles.block}>
                          <Text style={styles.blockTitle}>직업</Text>
                          <Text style={styles.blockValue} numberOfLines={1}>
                            {it.job ?? "-"}
                          </Text>
                        </View>

                        {/* 블록 4: 주급 */}
                        <View style={styles.block}>
                          <Text style={styles.blocktitleSalary}>주급</Text>
                          <Text style={styles.blockvalueSalary}>
                            {(it.salary ?? 0).toLocaleString()} 코인
                          </Text>
                        </View>

                      </View>

                      {/* 하단 메모 */}
                      <Text style={styles.weeklyFootNote}>시작일: {it.start_date ?? "-"}</Text>
                    </View>
                  ))}
                </Animated.ScrollView>
                <TouchableOpacity
                  onPress={goPrev}
                  disabled={page === 0}
                  style={[styles.arrowBtn, styles.arrowLeft, page === 0 && styles.arrowDisabled]}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Image source={require("../assets/icons/arrow_l_week.png")} style={styles.arrowIcon} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={goNext}
                  disabled={page === pageMax}
                  style={[styles.arrowBtn, styles.arrowRight, page === pageMax && styles.arrowDisabled]}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Image source={require("../assets/icons/arrow_r_week.png")} style={styles.arrowIcon} />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
        <BottomNav navigation={navigation} mode="default" active="Main" />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: wp("100%"),
    height: hp("100%"),
  },
  backgroundImage: {
    width: wp("102%"),
    left: -wp("1%"),
  },
  container: {
    flex: 1,
    position: "relative",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp("5%"),
    marginTop: hp("5%"),
  },

  topLeftCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("2.5%"),
  },
  coinContainer: {
    width: wp("35%"),
    height: wp("10%"),
    borderRadius: wp("3%"),
    backgroundColor: "rgba(217, 217, 217, 0.48)",
    flexDirection: "row",
    alignItems: "center",
  },
  coinPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("4%"),
    height: wp("10%"),
    borderRadius: wp("3%"),
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  coinIcon: {
    width: wp("6.2%"),
    height: wp("6.2%"),
    marginRight: wp("6%"),
    resizeMode: "contain",
  },
  coinLabel: {
    fontSize: wp("3.6%"),
    color: "#000000",
    marginRight: wp("2%"),
    fontFamily: "Jua-Regular",
  },
  coinValue: {
    fontSize: wp("4%"),
    color: "#1D1D1D",
    fontFamily: "Jua-Regular",
    marginRight: wp("4%"),
  },
  settingsPill: {
    height: wp("12%"),
    width: wp("12%"),
    borderRadius: wp("6%"),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  settingsIcon: {
    width: wp("15%"),
    height: wp("15%"),
    resizeMode: "contain",
  },
  // 모달 버튼 래퍼
  button: {
    width: "100%",
    paddingVertical: hp("1.2%"),
    alignItems: "center",
  },
  buttonText: {
    fontSize: wp("4%"),
    color: "red",
    fontFamily: "Jua-Regular",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    width: wp("70%"),
    backgroundColor: "#fff",
    borderRadius: wp("2%"),
    padding: wp("5%"),
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "black",
    alignSelf: "center",
    fontFamily: "Jua-Regular",
  },
  modalCloseButton: {
    marginTop: hp("2%"),
    backgroundColor: "#FFE98A",
    width: "100%",
    padding: hp("1.5%"),
    borderRadius: wp("10%"),
    alignItems: "center",
  },
  content: { flex: 1 },
  profilePill: {
    paddingHorizontal: wp("3.5%"),
    height: wp("10%"),
    borderRadius: wp("5%"),
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  profileText: {
    fontSize: wp("4%"),
    color: "#000",
    fontFamily: "Jua-Regular",
  },
  characterContainer: {
    position: "absolute",
    top: hp("8%"),
    left: wp("6%"),
    transform: [{ translateX: wp("11%") }, { translateY: wp("35%") }],
    zIndex: 2,
  },
  character: {
    width: wp("60%"),
    height: hp("30%"),
    resizeMode: "contain",
  },
  sofa: {
    width: wp("80%"),
    height: wp("60%"),
    position: "absolute",
    top: hp("22%"),
    left: wp("30%"),
    zIndex: 1,
    resizeMode: "contain",
  },
  chair: {
    width: wp("50%"),
    height: wp("40%"),
    position: "absolute",
    top: hp("25%"),
    left: wp("55%"),
    zIndex: 1,
    resizeMode: "contain",
  },
  window: {
    width: wp("40%"),
    height: wp("30%"),
    position: "absolute",
    top: hp("5%"),
    left: wp("5%"),
    resizeMode: "contain",
  },
  floor: {
    width: wp("45%"),
    height: wp("45%"),
    position: "absolute",
    top: hp("25%"),
    left: wp("-5%"),
    resizeMode: "contain",
  },

  /* 캐릭터 말풍선 */
  speechBubble: {
    position: "absolute",
    bottom: "100%",
    left: "50%",
    transform: [{ translateX: -wp("30%") }],
    width: wp("60%"),
    backgroundColor: "white",
    borderRadius: 10,
    padding: wp("3%"),
    borderWidth: 1,
    borderColor: "#aaa",
    zIndex: 5,
  },
  speechText: {
    fontSize: wp("3.5%"),
    textAlign: "center",
    color: "#333",
    fontFamily: "Jua-Regular",
  },

  /* === 우하단 FAB & 액션 === */
  fabBackdrop: {
    position: "absolute",
    left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: "transparent",
    zIndex: 10,
  },
  fabMain: {
    position: "absolute",
    right: wp("6%"),
    bottom: hp("13%"), // 네비(약 7~8%) 바로 위
    width: wp("16%"),
    height: wp("16%"),
    borderRadius: wp("8%"),
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 24,            // ✅ 네비보다 위
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    marginBottom: hp("2%"),
  },
  fabMainIcon: {
    width: wp("9%"),
    height: wp("9%"),
    resizeMode: "contain",
    tintColor: "#282828",
  },
  fabActionsWrap: {
    position: "absolute",
    right: wp("8%"),
    bottom: hp("22%"),
    zIndex: 20,           // ✅ 네비보다 위, 메인FAB 아래
    alignItems: "flex-end",
    marginBottom: hp("2%"),
  },
  fabActionItem: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fabLabelBubbleRight: {
    marginRight: wp("2.5%"),
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("0.7%"),
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: wp("2.5%"),
  },
  fabLabelText: {
    color: "#fff",
    fontSize: wp("3.5%"),
    fontFamily: "Jua-Regular",
  },
  fabIconBtn: {
    width: wp("12%"),
    height: wp("12%"),
    borderRadius: wp("6%"),
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  fabIcon: {
    width: wp("7%"),
    height: wp("7%"),
    resizeMode: "contain",
  },

  /* 퀘스트: 우하단 기준 */
  questAnchor: {
    position: "absolute",
    right: wp("8%"),
    bottom: hp("22%"),
    zIndex: 31,
    elevation: 12,
    alignItems: "flex-end",
    marginBottom: hp("2%"),
  },
  questIcon: {
    width: wp("9%"),
    height: wp("9%"),
    resizeMode: "contain",
    tintColor: "#282828",
  },
  questFabAbs: {
    position: "absolute",
    right: -8,
    bottom: 0,
    width: wp("16%"),
    height: wp("16%"),
    borderRadius: wp("8%"),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    elevation: 13,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  questPanelRightAbs: {
    position: "absolute",
    right: 0,
    bottom: wp("14%"), // 버튼 높이(12%) + 여백(2%) 정도
    width: wp("60%"),
    borderRadius: wp("3%"),
    padding: wp("4%"),
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    zIndex: 30,
    elevation: 11,
    alignItems: "center",
  },

  // ── 퀘스트 카드 내부 ──
  qHeaderRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp("0.8%"),
  },
  qHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  qHeaderIcon: {
    width: wp("5.2%"),
    height: wp("5.2%"),
    resizeMode: "contain",
    marginRight: wp("2%"),
  },
  qHeaderTitle: {
    fontSize: wp("4.2%"),
    color: "#2D5D6B",
    fontFamily: "Jua-Regular",
  },
  qStatusChip: {
    paddingHorizontal: wp("2.7%"),
    paddingVertical: hp("0.4%"),
    borderRadius: 999,
  },
  qStatusText: {
    fontSize: wp("3.2%"),
    fontFamily: "Jua-Regular",
  },

  qBodyText: {
    width: "100%",
    fontSize: wp("3.8%"),
    color: "#222",
    fontFamily: "Jua-Regular",
    marginTop: hp("0.2%"),
    marginBottom: hp("0.6%"),
    lineHeight: hp("2.6%"),
  },
  qRewardRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("0.6%"),
  },
  qRewardIcon: {
    width: wp("4.8%"),
    height: wp("4.8%"),
    resizeMode: "contain",
    marginRight: wp("1.5%"),
  },
  qRewardText: {
    fontSize: wp("3.6%"),
    color: "#333",
    fontFamily: "Jua-Regular",
  },
  qDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginVertical: hp("1.0%"),
  },

  qPrimaryBtn: {
    width: "100%",
    paddingVertical: hp("1.2%"),
    borderRadius: wp("2.8%"),
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp("0.5%"),
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  qPrimaryBtnText: {
    color: "#2D5D6B",
    fontSize: wp("4%"),
    fontFamily: "Jua-Regular",
  },
  qBtnBlue: { backgroundColor: "#76D6F4" },
  qBtnGreen: { backgroundColor: "#4CD964" },
  qBtnGray: { backgroundColor: "#C7C7CC" },

  // 미니 스탯
  miniStatsCard: {
    marginTop: hp("1%"),
    width: wp("75%"),
    marginHorizontal: wp("5%"),
    paddingVertical: hp("1.2%"),
    paddingHorizontal: wp("3%"),
    borderRadius: wp("4%"),
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: hp("0%"),
  },
  statIcon: {
    width: wp("5.5%"),
    height: wp("5.5%"),
    marginRight: wp("2.3%"),
    resizeMode: "contain",
  },
  statLabel: {
    width: wp("12%"),
    fontSize: wp("3.6%"),
    color: "#2D5D6B",
    fontFamily: "Jua-Regular",
  },
  statBarBg: {
    width: wp("40%"),
    height: hp("1%"),
    backgroundColor: "rgba(0,0,0,0.12)",
    borderRadius: 999,
    overflow: "hidden",
    marginRight: wp("2.3%"),
  },
  statBarFill: {
    height: "100%",
    backgroundColor: "#76D6F4",
  },
  statLevel: {
    width: wp("12%"),
    textAlign: "left",
    fontSize: wp("3.6%"),
    color: "#2D5D6B",
    fontFamily: "Jua-Regular",
  },
  //주급 관련 스타일
  weeklyBackdrop: {
    position: "absolute",
    left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: "transparent",
    zIndex: 60,
  },
  weeklyPanel: {
    position: "absolute",
    left: wp("5%"),
    right: wp("20%"),
    top: hp("11%"),
    bottom: hp("50%"),
    backgroundColor: "#fff",
    borderRadius: wp("3%"),
    padding: wp("4%"),
    zIndex: 61,
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  weeklyHeader: {
    fontSize: wp("5%"),
    fontFamily: "Jua-Regular",
    marginBottom: hp("0.6%"),
  },
  weeklyHeaderYM: {
    fontSize: wp("3%"),
    color: "#1D1D1D",        // 기본색
    fontFamily: "Jua-Regular",
  },
  weeklyWeekEmph: {
    fontSize: wp("3%"),
    color: "#FF3B30",        // ← 주차만 빨강
    fontFamily: "Jua-Regular",
  },
  weeklySummaryWrap: {
    marginTop: hp("0.4%"),   // 헤더와 살짝 띄우기
    marginBottom: hp("0.2%"),
  },
  weeklySub: {
    fontSize: wp("4%"),
    fontFamily: "Jua-Regular",
    marginBottom: hp("0.2%"),
  },
  sep: {
    width: "100%",
    height: 1,
    backgroundColor: "#EDEDED",
    marginTop: hp("0.6%"),
    marginBottom: hp("1%"),
  },

  weeklyPagerFrame: { flex: 1, marginTop: hp("1%") },
  oneHandaliCard: {
    width: CARD_W,
    marginHorizontal: CARD_GAP / 2,
    alignSelf: "center",
  },

  weeklyFootNote: {
    marginTop: hp("0.4%"),
    fontSize: wp("3.2%"),
    color: "#666",
    fontFamily: "Jua-Regular",
    textAlign: "center",
  },
  closeBtn: {
    marginTop: hp("1.2%"),
    padding: hp("1.1%"),
    backgroundColor: "#84CBFE",
    borderRadius: wp("2%"),
    alignItems: "center",
  },
  closeBtnText: {
    color: "#fff",
    fontSize: wp("4%"),
    fontFamily: "Jua-Regular",
  },
  arrowBtn: {
    position: "absolute",
    top: "40%",
    transform: [{ translateY: -hp("3%") }],
    width: wp("10%"),
    height: wp("10%"),
    borderRadius: wp("5%"),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  arrowLeft: { left: wp("-5%") },
  arrowRight: { right: wp("-5%") },
  arrowIcon: { width: wp("4%"), height: wp("4%"), resizeMode: "contain" },
  arrowDisabled: { opacity: 0.35 },

  cardGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",

  },

  block: {
    width: "48%",                      // ← 항상 2열 유지
    flexGrow: 0,
    flexShrink: 0,
    paddingVertical: hp("0.8%"),
    paddingHorizontal: 0,
    backgroundColor: "transparent",
    borderRadius: 0,
    marginBottom: hp("0.5%"),
  },

  blockTitle: {
    fontSize: wp("3.4%"),
    color: "#6B7B83",
    fontFamily: "Jua-Regular",
    marginBottom: hp("0.2%"),
  },
  blocktitleStat: {
    fontSize: wp("3.4%"),
    color: "#6B7B83",
    fontFamily: "Jua-Regular",
    marginBottom: hp("0.2%"),
    left: wp("9.5%"),
  },
  blocktitleSalary: {
    fontSize: wp("3.4%"),
    color: "#6B7B83",
    fontFamily: "Jua-Regular",
    marginBottom: hp("0.2%"),
    left: wp("9.5%"),
  },

  blockValue: {
    fontSize: wp("4.2%"),
    color: "#1D1D1D",
    fontFamily: "Jua-Regular",
  },
  blockvalueSalary: {
    fontSize: wp("4.2%"),
    color: "#1D1D1D",
    fontFamily: "Jua-Regular",
    alignSelf: "center",
    right: wp("1%"),
  },

  blockStatRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: hp("0.2%"),
    right: wp("2%"),
  },

  statLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: wp("3.4%"),
    color: "#2D5D6B",
    fontFamily: "Jua-Regular",
  },

  statValue: {
    flex: 1,
    textAlign: "center",
    fontSize: wp("4%"),
    color: "#1D1D1D",
    fontFamily: "Jua-Regular",
  },

  // ─ 페이지 도트 ─
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp("1%"),
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: "#D6D6D6",
    marginHorizontal: 3,
  },
  dotActive: { backgroundColor: "#84CBFE" },
});
