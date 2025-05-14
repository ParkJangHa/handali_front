import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image,} from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

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
    padding: wp('5%'),
    backgroundColor: "#FFE98A",
  },
  img: {
    top: 0,
    position: "absolute",
    width: wp('100%'),
    height: hp('30%'),
    zIndex: 0,
  },
  dateText: {
    fontSize: wp('6%'),
    color: "#2D5D6B",
    alignSelf: "flex-start",
    fontFamily: "Jua-Regular",
  },
  title: {
    fontSize: wp('8%'),
    color: "#2D5D6B",
    alignSelf: "flex-start",
    fontFamily: "Jua-Regular",
  },
  progressBar: {
    width: "100%",
    height: hp('1%'),
    justifyContent: "center",
    marginVertical: hp('4%'),
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
    fontSize: wp('7%'),
    color: "rgba(0, 0, 0, 0.5)",
    alignSelf: "flex-start",
    marginBottom: wp('13%'),
    fontFamily: "Jua-Regular",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    marginBottom: wp('75%'),
  },
  habitButton: {
    backgroundColor: "rgba(255, 255, 255, 1)",
    width: wp('25%'),
    height: hp('10%'),
    borderRadius: wp('5%'),
    justifyContent: "center",
    alignItems: "center",
  },
  selectedButton: {
    backgroundColor: "rgba(2, 80, 224, 0.5)",
  },
  habitButtonText: {
    fontSize: wp('4%'),
    fontWeight: "bold",
    color: "#2D5D6B",
    fontFamily: "Jua-Regular",
  },
  nextButton: {
    width: "100%",
    backgroundColor: "#76D6F4",
    paddingVertical: hp('2%'),
    borderRadius: wp('5%'),
    alignItems: "center",
    marginVertical: hp('2%'),
  },
  nextButtonText: {
    color: "#2D5D6B",
    fontSize: wp('5%'),
    fontFamily: "Jua-Regular",
  },
});

export default CategorySelect;
