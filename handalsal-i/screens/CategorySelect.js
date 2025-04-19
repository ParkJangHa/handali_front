import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CategorySelect = ({ navigation }) => {
  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

  const [progress, setProgress] = useState(35);
  const [selectedButton, setSelectedButton] = useState(null);

  const handlePress = (category) => {
    setSelectedButton(category);
  };

  const handleNext = () => {
    if (!selectedButton) {
      alert("카테고리를 선택하세요!");
    } else {
      console.log("📌 선택한 카테고리:", selectedButton); // ✅ 선택한 카테고리 확인
      navigation.navigate("DetailSelect", { category: selectedButton });
    }
  };
  

  return (
    <View style={styles.container}>
      <Image source={require("../assets/Category/Weve.png")} style={styles.img} resizeMode="stretch" />
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
      <Text style={styles.subTitle}>N1. 카테고리를 선택하세요</Text>
      <View style={styles.rowContainer}>
        <TouchableOpacity
          style={[
            styles.habitButton,
            selectedButton === "활동" && styles.selectedButton,
          ]}
          onPress={() => handlePress("활동")}
        >
          <Text style={styles.habitButtonText}>활동</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.habitButton,
            selectedButton === "지능" && styles.selectedButton,
          ]}
          onPress={() => handlePress("지능")}
        >
          <Text style={styles.habitButtonText}>지능</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.habitButton,
            selectedButton === "예술" && styles.selectedButton,
          ]}
          onPress={() => handlePress("예술")}
        >
          <Text style={styles.habitButtonText}>예술</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>카테고리를 선택했어요</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: SCREEN_WIDTH * 0.05,
    backgroundColor: "#FFE98A",
    marginTop: -SCREEN_WIDTH * 0.07,
  },
  img: {
    top: 0,
    position: "absolute",
    width: SCREEN_WIDTH * 1,
    height: SCREEN_HEIGHT * 0.3,
    zIndex: 0,
  },
  dateText: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: "bold",
    color: "#2D5D6B",
    alignSelf: "flex-start",
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.08,
    fontWeight: "bold",
    color: "#2D5D6B",
    alignSelf: "flex-start",
  },
  progressBar: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.01,
    justifyContent: "center",
    marginVertical: SCREEN_HEIGHT * 0.04,
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
    marginBottom: SCREEN_WIDTH * 0.13,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    marginBottom: SCREEN_WIDTH * 0.75,
  },
  habitButton: {
    backgroundColor: "rgba(255, 255, 255, 1)",
    width: SCREEN_WIDTH * 0.25,
    height: SCREEN_HEIGHT * 0.1,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedButton: {
    backgroundColor: "rgba(2, 80, 224, 0.5)",
  },
  habitButtonText: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: "bold",
    color: "#2D5D6B",
  },
  nextButton: {
    width: "100%",
    backgroundColor: "#76D6F4",
    paddingVertical: SCREEN_HEIGHT * 0.02,
    borderRadius: 20,
    alignItems: "center",
    marginVertical: SCREEN_HEIGHT * 0.02,
  },
  nextButtonText: {
    color: "#2D5D6B",
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: "bold",
  },
});

export default CategorySelect;
