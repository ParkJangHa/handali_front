import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const UserHabitAppendScreen = ({ route, navigation }) => {
  const { category, categoryData } = route.params; // 전달된 데이터
  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

  // 입력 필드 상태
  const [habits, setHabits] = useState(["", "", ""]); // 3개의 고정된 필드

  // 입력 필드 값 변경 처리
  const handleInputChange = (text, index) => {
    const updatedHabits = [...habits];
    updatedHabits[index] = text;
    setHabits(updatedHabits);
  };

  // 입력 값 전달 및 검증
  const handleSubmit = () => {
    const nonEmptyHabits = habits.filter((habit) => habit.trim() !== ""); // 빈 필드 제거
    if (nonEmptyHabits.length === 0) {
      alert("최소 하나 이상의 습관을 입력해주세요!");
      return;
    }

    // 유효한 습관을 다음 화면에 전달
    navigation.navigate("DetailSelect", {
      category,
      userHabits: nonEmptyHabits,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.dateText}>{formattedDate}</Text>
      <Text style={styles.title}>한달이를 시작합니다</Text>

      <View style={styles.progressBar}>
        <Image
          source={require("../assets/probar.png")}
          style={styles.backgroundBar}
        />
        <View style={[styles.foregroundWrapper, { width: "65%" }]}>
          <Image
            source={require("../assets/probarlevel.png")}
            style={styles.foregroundBar}
          />
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

      <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
        <Text style={styles.addButtonText}>추가했어요</Text>
      </TouchableOpacity>
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
