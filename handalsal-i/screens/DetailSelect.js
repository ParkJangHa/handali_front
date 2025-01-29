import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const DetailSelect = ({ route, navigation }) => {
  const { category, userHabits } = route.params || {};
  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

  const [selectedButtons, setSelectedButtons] = useState([]); // 다중 선택 상태
  const [progress, setProgress] = useState(65);
  const [habits, setHabits] = useState(["예 1", "예 2", "예 3"]); // 기본 습관

  useEffect(() => {
    if (userHabits) {
      // 새로운 습관 추가
      setHabits((prevHabits) => {
        const newHabits = userHabits.filter((habit) => !prevHabits.includes(habit));
        return [...prevHabits, ...newHabits];
      });
    }
  }, [userHabits]);

  // 선택 로직 (다중 선택)
  const handlePress = (habit) => {
    setSelectedButtons((prevSelected) => {
      if (prevSelected.includes(habit)) {
        // 이미 선택된 항목이면 제거
        return prevSelected.filter((item) => item !== habit);
      } else if (prevSelected.length < 3) {
        // 선택된 항목이 3개 미만이면 추가
        return [...prevSelected, habit];
      } else {
        // 선택된 항목이 이미 3개라면 경고
        alert("최대 3개까지 선택할 수 있습니다!");
        return prevSelected;
      }
    });
  };

  const handleNext = () => {
    if (selectedButtons.length === 0) {
      alert("최소 한 개 이상의 항목을 선택하세요!");
    } else {
      // 다음 화면으로 선택된 습관 배열 전달
      navigation.navigate("HabitAppendScreen", {
        category,
        habits: selectedButtons,
      });
    }
  };

  const habitAppend = () => {
    navigation.navigate("UserHabitAppendScreen", {
      category,
      categoryData: {
        활동: {
          image: require("../assets/activityLogo.png"),
          label: "활동",
        },
        지적: {
          image: require("../assets/intelligenceLogo.png"),
          label: "지적",
        },
        예술: {
          image: require("../assets/artLogo.png"),
          label: "예술",
        },
      },
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
        <View style={[styles.foregroundWrapper, { width: `${progress}%` }]}>
          <Image
            source={require("../assets/probarlevel.png")}
            style={styles.foregroundBar}
          />
        </View>
      </View>

      <Text style={styles.subTitle}>N2. 세부 습관을 선택하세요</Text>

      <View style={styles.categoryCon}>
        <Image
          source={
            category === "활동"
              ? require("../assets/activityLogo.png")
              : category === "지적"
              ? require("../assets/intelligenceLogo.png")
              : require("../assets/artLogo.png")
          }
          style={styles.categoryImg}
        />
        <Text style={styles.categoryText}>{category || "카테고리 없음"}</Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        {habits.map((habit, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.habitButton,
              selectedButtons.includes(habit) && styles.selectedButton,
            ]}
            onPress={() => handlePress(habit)}
          >
            <Text style={styles.habitButtonText}>{habit}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.habitAppendContainer}>
        <TouchableOpacity style={styles.habitAppendButton} onPress={habitAppend}>
          <Text style={styles.habitAppendButtonText}>습관 추가하기</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>선택했어요</Text>
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
  habitButton: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.08,
    borderWidth: 2,
    borderColor: "#000",
    marginBottom: SCREEN_HEIGHT * 0.01,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    borderRadius: SCREEN_WIDTH * 0.03,
    backgroundColor: "#FFFDF0",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedButton: {
    backgroundColor: "rgba(248, 227, 110, 0.9)",
  },
  habitButtonText: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: "#000",
    fontWeight: "bold",
  },
  habitAppendContainer: {
    width: "100%",
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  habitAppendButton: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  habitAppendButtonText: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: "bold",
    color: "#0250E0",
    textAlign: "center",
  },
  nextButton: {
    width: SCREEN_WIDTH * 0.9,
    backgroundColor: "#000000",
    paddingVertical: SCREEN_HEIGHT * 0.02,
    borderRadius: 30,
    marginTop: SCREEN_HEIGHT * 0.01,
    marginBottom: SCREEN_HEIGHT * 0.01
  },
  nextButtonText: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: "#FFF",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default DetailSelect;


