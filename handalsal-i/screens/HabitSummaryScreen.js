import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import { API_BASE_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

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
  const chartWidth = Math.max(Number(wp("90%")), numMonths * 40);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>습관 요약</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>이번달 카테고리별 만족도 평균</Text>
        {summaryData.satisfaction_avg_by_category.map((item) => (
          <View key={item.category} style={styles.row}>
            <Text style={styles.innerText}>{categoryNameMap[item.category]}</Text>
            <Text style={styles.innerText}>{getEmoji(item.avg_satisfaction)} {Math.round(item.avg_satisfaction)}</Text>
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
              width={chartWidth}
              height={hp("25%")}
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
    padding: wp("5%"),
    alignItems: "center",
    backgroundColor: "#FFE98A",
  },
  header: {
    fontSize: wp("6%"),
    marginVertical: hp("2%"),
    marginTop: -hp("1%"),
    fontFamily: "Jua-Regular",
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
});
