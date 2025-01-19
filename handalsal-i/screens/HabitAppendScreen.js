import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions
} from "react-native";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const HabitAppendScreen = ({ route, navigation }) => {
  // 이전 화면에서 전달된 데이터
  const { category, habits = [] } = route.params; // 여러 개의 습관 배열 받기
  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

  const [progress, setProgress] = useState(85);

  const anotherCategory = () => {
    navigation.navigate("Category"); // 카테고리 선택 화면으로 이동
  };

  const handalStart = () => {
    navigation.navigate("HandalStart");
  };

  // 카테고리별 데이터 정의
  const categoryData = {
    활동: {
      label: "활동",
      image: require("../assets/activityLogo.png"),
    },
    지적: {
      label: "지적",
      image: require("../assets/intelligenceLogo.png"),
    },
    예술: {
      label: "예술",
      image: require("../assets/artLogo.png"),
    },
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* 날짜 및 제목 */}
        <Text style={styles.dateText}>{formattedDate}</Text>
        <Text style={styles.title}>습관을 추가했어요!</Text>
  
        {/* 진행 바 */}
        <View style={styles.progressBar}>
          <Image
            source={require("../assets/probar.png")}
            style={styles.backgroundBar}
          />
          <View style={[styles.foregroundWrapper, { width: `${progress}%` }]}>
            <Image
              source={require("../assets/probarlevel.png")}
              style={styles.foregroundBar}
            />
          </View>
        </View>
      </View>
  
      <View style={styles.secondContainer}>
        {/* 선택한 항목 표시 */}
        <View style={styles.selectionContainer}>
          {/* 선택된 습관 목록 */}
          <View style={styles.habitContainer}>
            <View style={styles.habitBox}>
            {habits.map((habit, index) => (
                <Text key={index} style={styles.habitText}>
                {habit}
                </Text>  
            ))}
          </View>
          </View>
  
          <View style={styles.categoryContainer}>
            <Image
              source={categoryData[category].image}
              style={styles.categoryImage}
            />
            <Text style={styles.categoryText}>{categoryData[category].label}</Text>
  
            {/* 추가 버튼 */}
            <View style={styles.rowContainer}>
              <TouchableOpacity
                style={styles.anotherButton}
                onPress={anotherCategory}
              >
                <Text style={styles.anotherButtonText}>
                  다른 습관 추가
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton} onPress={handalStart}>
                <Text style={styles.addButtonText}>시작하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  ); 
};

// 스타일 정의
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
    borderRadius: SCREEN_WIDTH * 0.02,
  },
  foregroundWrapper: {
    height: "100%",
    position: "absolute",
    overflow: "hidden",
  },
  foregroundBar: {
    width: "100%",
    height: "100%",
    borderRadius: SCREEN_WIDTH * 0.02,
  },
  secondContainer:{
    flex: 6,
    alignItems: "center",
    backgroundColor: "#FFFDF0",
  },
  selectionContainer: {
    flex: 1,
    alignItems: "center",
    width: "100%",
  },
  habitContainer: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.5,
    backgroundColor: "#F8B66C",
    borderTopLeftRadius: SCREEN_WIDTH * 0.15,
    borderTopRightRadius: SCREEN_WIDTH * 0.15,
    justifyContent: "center",
    alignItems: "center",
    padding: SCREEN_WIDTH * 0.05,
    marginBottom: -SCREEN_WIDTH * 0.6,
  },
  habitBox: {
    flex: 1,
  },
  habitText: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  categoryContainer: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.6,
    backgroundColor: "#F8E36E",
    borderTopLeftRadius: SCREEN_WIDTH * 0.5,
    borderTopRightRadius: SCREEN_WIDTH * 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryImage: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  categoryText: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: "bold",
    color: "#000",
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: SCREEN_WIDTH * 0.02,
    marginBottom: SCREEN_HEIGHT * 0.04,
  },
  anotherButton: {
    flex: 1.4,
    backgroundColor: "rgba(255, 253, 240, 0.5)",
    height: SCREEN_HEIGHT * 0.07, // 버튼의 고정 높이
    borderRadius: SCREEN_WIDTH * 0.05,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SCREEN_WIDTH * 0.03,
  },
  anotherButtonText: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontWeight: "bold",
    color: "rgba(0, 0, 0, 0.6)",
    textAlign: "center",
    lineHeight: SCREEN_HEIGHT * 0.07, // 버튼 높이와 동일하게 설정
    textAlignVertical: "center", // 텍스트 수직 정렬
  },
  addButton: {
    flex: 2,
    backgroundColor: "#F8B66C",
    height: SCREEN_HEIGHT * 0.07, // 버튼의 고정 높이
    borderRadius: SCREEN_WIDTH * 0.05,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SCREEN_WIDTH * 0.03,
  },
  addButtonText: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    lineHeight: SCREEN_HEIGHT * 0.07, // 버튼 높이와 동일하게 설정
    textAlignVertical: "center", // 텍스트 수직 정렬
  },
  
});


export default HabitAppendScreen;

