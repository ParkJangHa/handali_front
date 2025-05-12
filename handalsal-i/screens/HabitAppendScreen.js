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
  const { category, habits = [] } = route.params;
  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

  const [progress, setProgress] = useState(85);

  const anotherCategory = () => {
    navigation.navigate("Category");
  };

  const handalStart = () => {
    navigation.navigate("HandalStart", {
      category,
      habits,
    });
  };

  const categoryData = {
    활동: {
      label: "활동",
      image: require("../assets/activityLogo.png"),
    },
    지능: {
      label: "지능",
      image: require("../assets/intelligenceLogo.png"),
    },
    예술: {
      label: "예술",
      image: require("../assets/artLogo.png"),
    },
  };

  return (
    <View style={styles.container}>
      <Image source={require("../assets/Category/Weve.png")} style={styles.img} resizeMode="stretch" />
      <Text style={styles.dateText}>{formattedDate}</Text>
      <Text style={styles.title}>습관을 추가했어요!</Text>

      <View style={styles.progressBar}>
        <Image source={require("../assets/probar.png")} style={styles.backgroundBar} />
        <View style={[styles.foregroundWrapper, { width: `${progress}%` }]}>
          <Image source={require("../assets/probarlevel.png")} style={styles.foregroundBar} />
        </View>
      </View>

      <Image source={categoryData[category].image} style={styles.categoryImage} />
      <Text style={styles.categoryText}>{categoryData[category].label}</Text>

      <View style={styles.selectionContainer}>
        <View style={styles.habitContainer}>
          {habits.map((habit, index) => (
            <Text key={index} style={styles.habitText}>{habit}</Text>
          ))}
        </View>

        <View style={styles.rowContainer}>
          <TouchableOpacity style={styles.anotherButton} onPress={anotherCategory}>
            <Text style={styles.anotherButtonText}>다른 습관 추가</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handalStart}>
            <Text style={styles.addButtonText}>시작하기</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Image source={require("../assets/Category/B_weve.png")} style={styles.background} resizeMode="stretch" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: SCREEN_WIDTH * 0.05,
    backgroundColor: "#FFBF80",
    marginTop: -SCREEN_WIDTH * 0.07,
  },
  img: {
    top: 0,
    position: "absolute",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.25,
    zIndex: 0,
  },
  dateText: {
    fontSize: SCREEN_WIDTH * 0.06,
    // fontWeight: "bold",
    color: "#2D5D6B",
    alignSelf: "flex-start",
    fontFamily: "Jua-Regular"
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.08,
    // fontWeight: "bold",
    color: "#2D5D6B",
    alignSelf: "flex-start",
    fontFamily: "Jua-Regular"
  },
  progressBar: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.01,
    justifyContent: "center",
    marginVertical: SCREEN_HEIGHT * 0.03,
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
  categoryImage: {
    marginTop: SCREEN_HEIGHT * 0.07,
    width: SCREEN_WIDTH * 0.3,
    height: SCREEN_WIDTH * 0.3,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  categoryText: {
    fontSize: SCREEN_WIDTH * 0.04,
    // fontWeight: "bold",
    color: "#2D5D6B",
    marginBottom: SCREEN_HEIGHT * 0.08,
    fontFamily: "Jua-Regular"
  },
  selectionContainer: {
    alignItems: "center",
    width: "100%",
  },
  habitContainer: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.25,
    justifyContent: "center",
    alignItems: "center",
    padding: SCREEN_WIDTH * 0.05,
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  habitText: {
    fontSize: SCREEN_WIDTH * 0.08,
    // fontWeight: "bold",
    color: "#2D5D6B",
    textAlign: "center",
    marginBottom: SCREEN_HEIGHT * 0.01,
    fontFamily: "Jua-Regular"
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: SCREEN_WIDTH * 0.05,
  },
  anotherButton: {
    backgroundColor: "#ECF7F7",
    width: SCREEN_WIDTH * 0.3,
    height: SCREEN_HEIGHT * 0.07,
    borderRadius: SCREEN_WIDTH * 0.05,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SCREEN_WIDTH * 0.03,
  },
  anotherButtonText: {
    fontSize: SCREEN_WIDTH * 0.035,
    // fontWeight: "bold",
    color: "rgba(45, 93, 107, 0.6)",
    fontFamily: "Jua-Regular"
  },
  addButton: {
    width: SCREEN_WIDTH * 0.5,
    backgroundColor: "#76D6F4",
    height: SCREEN_HEIGHT * 0.07,
    borderRadius: SCREEN_WIDTH * 0.05,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SCREEN_WIDTH * 0.03,
  },
  addButtonText: {
    fontSize: SCREEN_WIDTH * 0.045,
    // fontWeight: "bold",
    color: "#2D5D6B",
    fontFamily: "Jua-Regular"
  },
  background: {
    position: "absolute",
    bottom: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.45,
    zIndex: -1,
  },
});

export default HabitAppendScreen;