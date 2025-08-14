import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { LineChart, PieChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

/** === 카테고리/라벨 === */
const CAT_ORDER = ["ACTIVITY", "INTELLIGENT", "ART"];
const CATEGORY_NAME = {
  ACTIVITY: "활동",
  INTELLIGENT: "지능",
  ART: "예술",
};
const CATEGORY_COLOR = {
  ACTIVITY: "#FF6384",
  INTELLIGENT: "#36A2EB",
  ART: "#FFCE56",
};

/** === 공용 유틸 === */
const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  decimalPlaces: 0,
};
const getEmoji = (v) => (v >= 80 ? "😄" : v >= 60 ? "🙂" : v >= 40 ? "😐" : "😞");
const sortCats = (arr) =>
  [...(arr ?? [])].sort(
    (a, b) => CAT_ORDER.indexOf(a.category) - CAT_ORDER.indexOf(b.category)
  );

/** === 메인 컴포넌트 === */
export default function HabitSummaryScreen() {
  const navigation = useNavigation();
  const [summaryData, setSummaryData] = useState(null);
  const [range, setRange] = useState("month"); // 'month' | 'week'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("no token");

      const res = await fetch(`${API_BASE_URL}/habits/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 412) {
        await AsyncStorage.removeItem("authToken");
        Alert.alert("세션 만료", "다시 로그인해주세요.");
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        return;
      }

      const data = await res.json();
      setSummaryData(data);
    } catch (e) {
      console.error("❌ 습관 요약 불러오기 오류:", e);
      Alert.alert("오류", "요약 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigation]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useFocusEffect(
    useCallback(() => {
      fetchSummary();
    }, [fetchSummary])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSummary();
  };

  /** === range(월/주) 별로 키 선택 === */
  const pick = (monthKey, weekKey, fallback = []) =>
    range === "month"
      ? summaryData?.[monthKey] ?? fallback
      : summaryData?.[weekKey] ?? fallback;

  const satByCat = sortCats(
    pick("satisfaction_avg_by_category_month", "satisfaction_avg_by_category_week", [])
  );
  const timeByCat = sortCats(
    pick("total_time_by_category_month", "total_time_by_category_week", [])
  );
  const recByCat = sortCats(
    pick("total_records_by_category_month", "total_records_by_category_week", [])
  );

  const totalRecs =
    range === "month"
      ? Number(summaryData?.total_records_month ?? 0)
      : Number(summaryData?.total_records_week ?? 0);

  const monthlyCount = summaryData?.monthly_record_count ?? [];
  const numMonths = monthlyCount.length;
  const chartWidth = Math.max(Number(wp("90%")), numMonths * 40);

  if (loading || !summaryData) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const hasRecPie = totalRecs > 0 && recByCat.length > 0;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* 헤더 + 토글 */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>습관 요약</Text>
        <View style={styles.toggleRow}>
          {["month", "week"].map((r) => (
            <Text
              key={r}
              onPress={() => setRange(r)}
              style={[
                styles.toggle,
                range === r && styles.toggleActive,
              ]}
            >
              {r === "month" ? "이번달" : "이번주"}
            </Text>
          ))}
        </View>
      </View>

      {/* 만족도 평균 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {range === "month" ? "이번달" : "이번주"} 카테고리별 만족도 평균
        </Text>
        {satByCat.length === 0 ? (
          <Text style={styles.emptyText}>아직 데이터가 없어요.</Text>
        ) : (
          satByCat.map((item) => (
            <View key={item.category} style={styles.row}>
              <Text style={styles.innerText}>{CATEGORY_NAME[item.category]}</Text>
              <Text style={styles.innerText}>
                {getEmoji(Number(item.avg_satisfaction))}{" "}
                {Math.round(Number(item.avg_satisfaction))}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* 총 기록 횟수 파이차트 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {range === "month" ? "이번달" : "이번주"} 카테고리별 총 기록 비율
        </Text>

        {hasRecPie ? (
          <>
            <View style={styles.pieChartContainer}>
              <PieChart
                data={recByCat.map((item) => ({
                  name: CATEGORY_NAME[item.category],
                  value: Number(item.total_records),
                  color: CATEGORY_COLOR[item.category],
                  legendFontColor: "#333",
                  legendFontSize: 14,
                }))}
                width={Number(wp("90%"))}
                height={hp("25%")}
                chartConfig={chartConfig}
                accessor="value"
                backgroundColor="transparent"
                paddingLeft="0"
                absolute
                hasLegend={false}
              />
              <View style={styles.customLegend}>
                {recByCat.map((item) => {
                  const v = Number(item.total_records) || 0;
                  const pct = totalRecs ? Math.round((v / totalRecs) * 100) : 0;
                  return (
                    <View key={item.category} style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendColor,
                          { backgroundColor: CATEGORY_COLOR[item.category] },
                        ]}
                      />
                      <Text style={styles.legendText}>
                        {CATEGORY_NAME[item.category]} {pct}% ({v}회)
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>기록이 아직 없어요.</Text>
        )}
      </View>

      {/* 누적 시간 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {range === "month" ? "이번달" : "이번주"} 카테고리별 누적 시간
        </Text>
        {timeByCat.length === 0 ? (
          <Text style={styles.emptyText}>데이터가 없어요.</Text>
        ) : (
          timeByCat.map((item) => (
            <Text style={styles.innerText} key={item.category}>
              {CATEGORY_NAME[item.category]}: {Number(item.total_time).toFixed(1)}시간
            </Text>
          ))
        )}
      </View>

      {/* 월별 기록 횟수(최근 1년) — 항상 월 기준으로 제공됨 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>월별 기록 횟수 (최근 1년)</Text>
        {monthlyCount.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={{
                labels: monthlyCount.map((m) => `${m.month}월`),
                datasets: [
                  { data: monthlyCount.map((m) => Number(m.totalRecords) || 0) },
                ],
              }}
              width={chartWidth}
              height={hp("25%")}
              chartConfig={chartConfig}
              fromZero
            />
          </ScrollView>
        ) : (
          <Text style={styles.emptyText}>월별 데이터가 없습니다.</Text>
        )}
      </View>

      {/* 총 기록 수 요약 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {range === "month" ? "이번달 총 기록 횟수" : "이번주 총 기록 횟수"}
        </Text>
        <Text style={styles.innerText}>{totalRecs}회</Text>
      </View>
    </ScrollView>
  );
}

/** === 스타일 === */
const styles = StyleSheet.create({
  container: {
    padding: wp("5%"),
    alignItems: "center",
    backgroundColor: "#FFE98A",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFE98A",
  },
  headerRow: {
    width: wp("90%"),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: hp("1%"),
    marginBottom: hp("1%"),
  },
  header: {
    fontSize: wp("6%"),
    fontFamily: "Jua-Regular",
  },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
  },
  toggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#eee",
    fontFamily: "Jua-Regular",
    color: "#333",
  },
  toggleActive: {
    backgroundColor: "#76D6F4",
    color: "#2D5D6B",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: wp("4%"),
    marginBottom: hp("2.5%"),
    width: wp("90%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: wp("4.5%"),
    marginBottom: hp("1%"),
    fontFamily: "Jua-Regular",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp("0.8%"),
  },
  pieChartContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  customLegend: {
    marginLeft: -wp("40%"),
    justifyContent: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("1%"),
  },
  legendColor: {
    width: wp("3%"),
    height: wp("3%"),
    borderRadius: wp("1.5%"),
    marginRight: wp("1.5%"),
  },
  legendText: {
    fontSize: wp("3.5%"),
    color: "#333",
    fontFamily: "Jua-Regular",
  },
  innerText: {
    fontFamily: "Jua-Regular",
  },
  emptyText: {
    fontFamily: "Jua-Regular",
    color: "#666",
  },
});
