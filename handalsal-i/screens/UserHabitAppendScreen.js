import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from '@env';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

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
        "지능": "INTELLIGENT",
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

      const response = await fetch(`${API_BASE_URL}/habits`, {
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
      <Image source={require("../assets/Category/Weve.png")} style={styles.img} resizeMode="stretch" />
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
          placeholderTextColor="#2D5D6B"
          value={habit}
          onChangeText={(text) => handleInputChange(text, index)}
        />
      ))}

      {/* 로딩 중이면 로딩 인디케이터 표시 */}
      {loading ? (
        <ActivityIndicator size="large" color="#F8B66C" />
      ) : (
        <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
          <Text style={styles.addButtonText}>입력했어요</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: wp("5%"),
    backgroundColor: "#FFE98A",
    marginTop: -wp("6%"),
  },
  img: {
    top: 0,
    position: "absolute",
    width: wp("100%"),
    height: hp("70%"),
    zIndex: 0,
  },
  dateText: {
    fontSize: wp("6%"),
    color: "#2D5D6B",
    alignSelf: "flex-start",
    fontFamily: "Jua-Regular",
  },
  title: {
    fontSize: wp("8%"),
    color: "#2D5D6B",
    alignSelf: "flex-start",
    fontFamily: "Jua-Regular",
  },
  progressBar: {
    width: "100%",
    height: hp("1%"),
    justifyContent: "center",
    marginVertical: hp("2%"),
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
    fontSize: wp("5%"),
    color: "rgba(0, 0, 0, 0.5)",
    alignSelf: "flex-start",
    marginBottom: wp("6%"),
    fontFamily: "Jua-Regular",
  },
  categoryCon: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: wp("90%"),
    height: hp("15%"),
    backgroundColor: "#FFFFFF",
    borderRadius: wp("5%"),
    marginTop: hp("3%"),
    marginBottom: hp("5%"),
  },
  categoryImg: {
    width: wp("40%"),
    height: wp("40%"),
    marginRight: wp("12%"),
  },
  categoryText: {
    fontSize: wp("9%"),
    color: "#2D5D6B",
    fontFamily: "Jua-Regular",
  },
  input: {
    width: "100%",
    height: hp("7%"),
    borderWidth: wp("0.3%"),
    borderColor: "#000",
    borderRadius: wp("2%"),
    paddingHorizontal: wp("3%"),
    marginBottom: hp("3%"),
    backgroundColor: "#FFFDF0",
    alignSelf: "center",
    color: "#2D5D6B",
    fontFamily: "Jua-Regular",
  },
  addButton: {
    width: "100%",
    backgroundColor: "#76D6F4",
    paddingVertical: hp("2%"),
    borderRadius: 30,
    marginTop: hp("7%"),
    fontFamily: "Jua-Regular",
  },
  addButtonText: {
    color: "#2D5D6B",
    fontSize: wp("4.5%"),
    textAlign: "center",
    fontFamily: "Jua-Regular",
  },
});


export default UserHabitAppendScreen;
