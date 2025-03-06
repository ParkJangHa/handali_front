import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const categoryMap = {
  "활동": "ACTIVITY",
  "지적": "INTELLIGENT",
  "예술": "ART"
};


const DetailSelect = ({ route, navigation }) => {
  const [habits, setHabits] = useState([]); // ✅ 습관 목록 상태 추가
  const { category, userHabits = [] } = route.params || {}; // ✅ 기본값을 빈 배열로 설정
  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

  const [selectedButtons, setSelectedButtons] = useState([]); // 다중 선택 상태
  const [progress, setProgress] = useState(65);

  useEffect(() => {
    if (userHabits && userHabits.length > 0) {
      setHabits(userHabits); // ✅ userHabits가 있으면 먼저 설정
    }
    fetchHabits(); // ✅ 이후에 API 요청 실행
  }, []);
  const fetchHabits = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("세션 만료", "다시 로그인해주세요.");
        navigation.navigate("LoginScreen");
        return;
      }

      const mappedCategory = categoryMap[category] || category;
      console.log("📌 선택한 카테고리:", category);
      console.log("📌 변환된 category 값:", mappedCategory);

      // ✅ 변수 명확하게 초기화
      let userHabitsList = [];
      let devHabitsList = [];

      // 사용자 추가 습관 조회
      const userResponse = await fetch(`http://43.201.250.84/habits/category-user?category=${mappedCategory}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
      });

      // 개발자가 미리 등록한 습관 조회
      const devResponse = await fetch(`http://43.201.250.84/habits/category-dev?category=${mappedCategory}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
      });

      const userText = await userResponse.text();
      const devText = await devResponse.text();

      console.log("📌 사용자 습관 응답:", userText);
      console.log("📌 개발자 습관 응답:", devText);

      try {
        const userData = JSON.parse(userText);
        if (userResponse.ok && userData.habits) {
          userHabitsList = userData.habits.map(habit => habit.detail);
        }
      } catch (jsonError) {
        console.error("🚨 JSON 파싱 오류 (사용자 습관): 응답이 JSON 형식이 아닙니다!", userText);
      }

      try {
        const devData = JSON.parse(devText);
        if (devResponse.ok && devData.habits) {
          devHabitsList = devData.habits.map(habit => habit.detail);
        }
      } catch (jsonError) {
        console.error("🚨 JSON 파싱 오류 (개발자 습관): 응답이 JSON 형식이 아닙니다!", devText);
      }

      // ✅ 기존 `userHabits`와 서버에서 가져온 습관을 병합하고 중복 제거
      const allHabits = [...new Set([...(userHabits || []), ...userHabitsList, ...devHabitsList])];
      console.log("📌 최종 합쳐진 습관 목록:", allHabits);
      setHabits(allHabits);

    } catch (error) {
      console.error("🚨 서버 요청 오류:", error);
    }
};
  

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
  const [loading, setLoading] = useState(false); // ✅ 로딩 상태 추가
  
  const handleNext = async () => {
    if (selectedButtons.length === 0) {
      alert("최소 한 개 이상의 항목을 선택하세요!");
      return;
    }
  
    setLoading(true); // 로딩 시작
  
    try {
      const token = await AsyncStorage.getItem("authToken");
  
      const categoryMap = {
        "활동": "ACTIVITY",
        "지적": "INTELLIGENT",
        "예술": "ART",
      };
      const convertedCategory = categoryMap[category] || category;
  
      const today = new Date();
      const currentMonth = today.getMonth() + 1; // 현재 월
  
      const requestBody = {
        habits: selectedButtons.map((habit) => ({
          category: convertedCategory,
          details: habit,
          created_type: "USER",
        })),
      };
  
      console.log("📌 이번 달 습관 지정 요청:", JSON.stringify(requestBody, null, 2));
  
      const response = await fetch("http://43.201.250.84/habits/set", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
  
      const data = await response.json();
      console.log("📌 이번 달 습관 지정 응답:", data);
  
      if (response.ok) {
        Alert.alert("완료", "이번 달 습관이 성공적으로 지정되었습니다!");
        navigation.navigate("HabitAppendScreen", { 
          category,  // ✅ 카테고리 전달
          habits: selectedButtons // ✅ 선택한 습관 목록 전달
        });
      } else {
        Alert.alert("실패", `습관 지정 실패: ${data.message || "알 수 없는 오류"}`);
      }
    } catch (error) {
      console.error("🚨 이번 달 습관 지정 중 오류 발생:", error);
      Alert.alert("오류", "네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
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


