import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from '@env';
import { characterImageMap } from "../utils/characterImageMap";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const GrowthScreen = ({ navigation }) => {
  const [nickname, setNickname] = useState();
  const [imageSource, setImageSource] = useState(require("../assets/character/0,0,0.png"));

  const setImageSourceByName = (imageName) => {
    const mapped = characterImageMap[imageName] || require("../assets/character/0,0,0.png");
    setImageSource(mapped);
  };

  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

  useEffect(() => {
    const fetchGrowthInfo = async () => {
      const token = await AsyncStorage.getItem("authToken");

      try {
        const response = await fetch(`${API_BASE_URL}/handalis/view`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
          const data = await response.json();
          setNickname(data.nickname);
          setImageSourceByName(data.handali_img);
        }
      } catch (error) {
        console.error("성장 정보 불러오기 실패:", error);
      }
    };

    fetchGrowthInfo();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.dateText}>{formattedDate}</Text>
        <Text style={styles.titleText}>한달이가 성장했어요! 🎉</Text>
        <View style={styles.memoContainer}>
          <Text style={styles.memoText}>새로운 외형으로 변화 했어요!</Text>
        </View>
      </View>

      <View style={styles.handaliContainer}>
        <LinearGradient
          colors={["#feebe1", "#fdd7be", "#fdcfae", "#FFB08A"]}
          style={styles.circle}
        >
          <Text style={styles.nicknameText}>{nickname}</Text>
          <Image source={imageSource} style={styles.handaliImage} />
        </LinearGradient>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.replace("MainScreen")}
        >
          <Text style={styles.buttonText}>메인 화면으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: hp("2%"),
    backgroundColor: "#FFE98A",
  },
  titleContainer: {
    marginTop: hp("7%"),
    alignItems: "center",
  },
  memoContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp("1%"),
    marginBottom: hp("2%"),
  },
  handaliContainer: {
    alignItems: "center",
    marginBottom: hp("2%"),
  },
  circle: {
    width: wp("80%"),
    height: hp("60%"),
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp("3%"),
  },
  handaliImage: {
    width: "90%",
    height: "80%",
    resizeMode: "contain",
  },
  nicknameText: {
    fontSize: wp("6%"),
    color: "#5A3A29",
    marginBottom: hp("2%"),
    fontFamily: "Jua-Regular",
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#76D6F4",
    width: wp("80%"),
    paddingVertical: hp("2%"),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
  },
  dateText: {
    fontSize: wp("5.5%"),
    fontFamily: "Jua-Regular",
  },
  titleText: {
    fontSize: wp("6%"),
    fontFamily: "Jua-Regular",
    textAlign: "center",
  },
  memoText: {
    fontSize: wp("5%"),
    color: "#ff8851",
    fontFamily: "Jua-Regular",
  },
  buttonText: {
    fontSize: wp("5%"),
    color: "#2D5D6B",
    fontFamily: "Jua-Regular",
  },
});

export default GrowthScreen;
