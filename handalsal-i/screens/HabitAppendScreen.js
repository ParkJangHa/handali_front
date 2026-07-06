import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

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
    padding: wp("5%"),
    backgroundColor: "#FFBF80",
  },
  img: {
    top: 0,
    position: "absolute",
    width: wp("100%"),
    height: hp("25%"),
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
    marginVertical: hp("3%"),
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
    marginTop: hp("7%"),
    width: wp("30%"),
    height: wp("30%"),
    marginBottom: hp("2%"),
  },
  categoryText: {
    fontSize: wp("4%"),
    color: "#2D5D6B",
    marginBottom: hp("8%"),
    fontFamily: "Jua-Regular",
  },
  selectionContainer: {
    alignItems: "center",
    width: "100%",
  },
  habitContainer: {
    width: "100%",
    height: hp("25%"),
    justifyContent: "center",
    alignItems: "center",
    padding: wp("5%"),
    marginBottom: hp("3%"),
  },
  habitText: {
    fontSize: wp("8%"),
    color: "#2D5D6B",
    textAlign: "center",
    marginBottom: hp("1%"),
    fontFamily: "Jua-Regular",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: wp("5%"),
  },
  anotherButton: {
    backgroundColor: "#ECF7F7",
    width: wp("30%"),
    height: hp("7%"),
    borderRadius: wp("5%"),
    justifyContent: "center",
    alignItems: "center",
    marginLeft: wp("3%"),
  },
  anotherButtonText: {
    fontSize: wp("3.5%"),
    color: "rgba(45, 93, 107, 0.6)",
    fontFamily: "Jua-Regular",
  },
  addButton: {
    width: wp("50%"),
    backgroundColor: "#76D6F4",
    height: hp("7%"),
    borderRadius: wp("5%"),
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("3%"),
  },
  addButtonText: {
    fontSize: wp("4.5%"),
    color: "#2D5D6B",
    fontFamily: "Jua-Regular",
  },
  background: {
    position: "absolute",
    bottom: 0,
    width: wp("100%"),
    height: hp("45%"),
    zIndex: -1,
  },
});


export default HabitAppendScreen;