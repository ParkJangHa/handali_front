import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const UserHabitAppendScreen = ({ route, navigation }) => {
  const { category, categoryData } = route.params; // 전달된 데이터
  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

  // 입력 필드 상태
  const [habits, setHabits] = useState(["", "", ""]); // 3개의 고정된 필드
  const [loading, setLoading] = useState(false); // 로딩 상태 추가

  // 입력 필드 값 변경 처리
  const handleInputChange = (text, index) => {
    const updatedHabits = [...habits];
    updatedHabits[index] = text;
    setHabits(updatedHabits);
  };

  // 🛠️ 습관을 서버에 저장하는 함수
  const handleSubmit = async () => {
    const nonEmptyHabits = habits.filter((habit) => habit.trim() !== ""); // 빈 필드 제거
    if (nonEmptyHabits.length === 0) {
      Alert.alert("알림", "최소 하나 이상의 습관을 입력해주세요!");
      return;
    }

    setLoading(true); // 로딩 시작

    try {
      const token = await AsyncStorage.getItem("authToken");

      // 카테고리 변환: 한글 → 대문자 영어 변환
      const categoryMap = {
        "활동": "ACTIVITY",
        "지적": "INTELLIGENT",
        "예술": "ART",
      };
      const convertedCategory = categoryMap[category] || category;

      const requestBody = {
        habits: nonEmptyHabits.map((habit) => ({
          category: convertedCategory,
          details: habit,
          created_type: "USER",
        })),
      };

      console.log("📌 서버로 전송할 JSON:", JSON.stringify(requestBody, null, 2));

      const response = await fetch("http://43.201.250.84/habits", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("📌 습관 추가 응답:", data);

      if (response.ok) {
        Alert.alert("성공", "습관이 성공적으로 추가되었습니다!");
        
        navigation.navigate("DetailSelect", { 
          category, 
          userHabits: nonEmptyHabits,  // ✅ 새로 추가한 습관만 전달
        });
      } else {
        Alert.alert("실패", `습관 추가 실패: ${data.message || "알 수 없는 오류"}`);
      }      
    } catch (error) {
      console.error("🚨 습관 추가 중 오류 발생:", error);
      Alert.alert("오류", "네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.dateText}>{formattedDate}</Text>
      <Text style={styles.title}>한달이를 시작합니다</Text>

      <View style={styles.progressBar}>
        <Image source={require("../assets/probar.png")} style={styles.backgroundBar} />
        <View style={[styles.foregroundWrapper, { width: "65%" }]}>
          <Image source={require("../assets/probarlevel.png")} style={styles.foregroundBar} />
        </View>
      </View>

      <Text style={styles.subTitle}>N3. 새로운 습관을 추가하세요</Text>

      <View style={styles.categoryCon}>
        <Image source={categoryData[category].image} style={styles.categoryImg} />
        <Text style={styles.categoryText}>{categoryData[category].label}</Text>
      </View>

      {/* 고정된 3개의 입력 필드 */}
      {habits.map((habit, index) => (
        <TextInput
          key={index}
          style={styles.input}
          placeholder={`습관 ${index + 1}을(를) 입력하세요`}
          value={habit}
          onChangeText={(text) => handleInputChange(text, index)}
        />
      ))}

      {/* 로딩 중이면 로딩 인디케이터 표시 */}
      {loading ? (
        <ActivityIndicator size="large" color="#F8B66C" />
      ) : (
        <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
          <Text style={styles.addButtonText}>추가했어요</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: SCREEN_WIDTH * 0.05,
    backgroundColor: "#FFFDF0",
    marginTop: -SCREEN_WIDTH * 0.06,
  },
  dateText: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: "bold",
    color: "#000",
    alignSelf: "flex-start",
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.08,
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
  progressBar: {
    width: "90%",
    height: SCREEN_HEIGHT * 0.01,
    justifyContent: "center",
    marginVertical: SCREEN_HEIGHT * 0.02,
  },
  backgroundBar: {
    width: "100%",
    height: "100%",
    position: "absolute",
    borderRadius: 10,
  },
  foregroundWrapper: {
    height: "100%",
    position: "absolute",
    overflow: "hidden",
  },
  foregroundBar: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  subTitle: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: "bold",
    color: "rgba(0, 0, 0, 0.5)",
    alignSelf: "flex-start",
    marginBottom: SCREEN_WIDTH * 0.05,
  },
  categoryCon: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.15,
    backgroundColor: "#F8E36E",
    borderRadius: SCREEN_WIDTH * 0.05,
    marginTop: SCREEN_HEIGHT * 0.03,
    marginBottom: SCREEN_HEIGHT * 0.05,
  },
  categoryImg: {
    width: SCREEN_WIDTH * 0.4,
    height: SCREEN_WIDTH * 0.4,
    marginRight: SCREEN_WIDTH * 0.12,
  },
  categoryText: {
    fontSize: SCREEN_WIDTH * 0.09,
    fontWeight: "bold",
    color: "#000",
  },
  input: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.06,
    borderWidth: SCREEN_WIDTH * 0.003,
    borderColor: "#000",
    borderRadius: SCREEN_WIDTH * 0.02,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    marginBottom: SCREEN_HEIGHT * 0.03,
    backgroundColor: "#FFFDF0",
    alignSelf: "center",
  },
  addButton: {
    width: "100%",
    backgroundColor: "#F8B66C",
    paddingVertical: SCREEN_HEIGHT * 0.02,
    borderRadius: 30,
    marginTop: SCREEN_HEIGHT * 0.07,
  },
  addButtonText: {
    color: "#000",
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default UserHabitAppendScreen;
