import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import { API_BASE_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const categoryNameMap = {
  ACTIVITY: "활동",
  INTELLIGENT: "지능",
  ART: "예술",
};


const getEmoji = (value) => {
  if (value >= 80) return "😄";
  if (value >= 60) return "🙂";
  if (value >= 40) return "😐";
  return "😞";
};

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  decimalPlaces: 0,
};

export default function HabitSummaryScreen() {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchSummary = async () => {
      const token = await AsyncStorage.getItem("authToken");
      try {
        const response = await fetch(`${API_BASE_URL}/habits/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setSummaryData(data);
      } catch (error) {
        console.error("❌ 습관 요약 불러오기 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);


  if (loading || !summaryData) {
    return (
      <View style={styles.centered}><ActivityIndicator size="large" color="#000" /></View>
    );
  }
  const numMonths = summaryData.monthly_record_count.length;
  const chartWidth = Math.max(SCREEN_WIDTH * 0.9, numMonths * 40); // 1개당 40~50 정도 너비
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>습관 요약</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>이번달 카테고리별 만족도 평균</Text>
        {summaryData.satisfaction_avg_by_category.map((item) => (
          <View key={item.category} style={styles.row}>
            <Text style={styles.innerText}>{categoryNameMap[item.category]}</Text>
            <Text style={styles.innerText}>{getEmoji(item.avg_satisfaction)} {item.avg_satisfaction}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>이번달 카테고리별 총 기록 횟수</Text>

        <View style={styles.pieChartContainer}>
          <PieChart
            data={summaryData.total_records_by_category.map((item, index) => ({
              name: categoryNameMap[item.category],
              value: item.total_records,
              color: ["#FF6384", "#36A2EB", "#FFCE56"][index],
              legendFontColor: "#333",
              legendFontSize: 14,
            }))}
            width={SCREEN_WIDTH * 0.9}
            height={220}
            chartConfig={chartConfig}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="0"
            absolute
            hasLegend={false}
          />

          <View style={styles.customLegend}>
            {summaryData.total_records_by_category.map((item, index) => {
              const total = summaryData.total_records;
              const percent = ((item.total_records / total) * 100).toFixed(0);
              return (
                <View key={item.category} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendColor,
                      { backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"][index] },
                    ]}
                  />
                  <Text style={styles.legendText}>
                    {categoryNameMap[item.category]} {percent}% ({item.total_records}회)
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>이번달 카테고리별 누적 시간</Text>
        {summaryData.total_time_by_category.map(item => (
          <Text style={styles.innerText} key={item.category}>{categoryNameMap[item.category]}: {item.total_time}시간</Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>월별 기록 횟수 (1년)</Text>

        {summaryData?.monthly_record_count ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={{
                labels: summaryData.monthly_record_count.map((m) => `${m.month}월`),
                datasets: [{
                  data: summaryData.monthly_record_count.map((m) => m.totalRecords),
                }],
              }}
              width={Math.max(SCREEN_WIDTH * 0.9, summaryData.monthly_record_count.length * 40)}
              height={220}
              chartConfig={chartConfig}
              fromZero
            />
          </ScrollView>
        ) : (
          <Text style={styles.innerText}>월별 데이터가 없습니다.</Text>
        )}
      </View>


      <View style={styles.card}>
        <Text style={styles.cardTitle}>총 기록 횟수</Text>
        <Text style={styles.innerText}>{summaryData.total_records}회</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#FFE98A",
  },
  header: {
    fontSize: 24,
    // fontWeight: "bold",
    marginVertical: 15,
    marginTop: -10,
    fontFamily: "Jua-Regular"
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    width: SCREEN_WIDTH * 0.9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    // fontWeight: "bold",
    marginBottom: 10,
    fontFamily: "Jua-Regular"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pieChartContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  customLegend: {
    marginLeft: -150,
    justifyContent: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Jua-Regular"
  },
  innerText: {
    fontFamily: "Jua-Regular"
  },
});