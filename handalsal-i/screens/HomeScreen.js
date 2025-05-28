import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";


const HomeScreen = ({ navigation }) => {
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/handalis/view`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          navigation.navigate("MainScreen");
        } else if (response.status === 404) {
          navigation.navigate("Category");
        } else {
          await AsyncStorage.removeItem("authToken");
        }
      } catch (error) {
        console.error("자동 로그인 확인 오류:", error);
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <View style={styles.wrapper}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* 상단 이미지 */}
        <View style={styles.imgCon}>
          <Image
            source={require("../assets/HomeScreen/calendarImg.png")}
            style={styles.calendarImg}
          />
          <Image
            source={require("../assets/HomeScreen/turtle.png")}
            style={styles.turtleImg}
          />
        </View>

        {/* 타이틀 및 버튼 */}
        <View style={styles.titeCon}>
          <TouchableOpacity
            style={styles.buttonlogin}
            onPress={() => navigation.navigate("Login")}
          >
            <Image
              source={require("../assets/HomeScreen/Assign_icon.png")}
              style={styles.icon}
            />
            <Text style={styles.buttonText}>login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Signup")}
          >
            <Image
              source={require("../assets/HomeScreen/Login_icon.png")}
              style={styles.icon}
            />
            <Text style={styles.buttonText}>assign</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 고양이 이미지 */}
      <Image
        source={require("../assets/HomeScreen/Yellow.png")}
        style={styles.catIcon}
      />

      {/* 하단 배경 이미지 */}
      <Image
        source={require("../assets/HomeScreen/Weve.png")}
        style={styles.background}
        resizeMode="stretch"
      />

      {/**하단 버전 정보 */}
      <View style={styles.versionBox}>
        <Text style={styles.versionText}>v1.0.0</Text>
      </View>

    </View>

  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FFF5CB",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: hp("5%"),
    zIndex: 1,
  },
  background: {
    position: "absolute",
    bottom: 0,
    width: wp("100%"),
    height: hp("38%"),
    zIndex: 0,
  },
  imgCon: {
    height: hp("20%"),
    marginTop: hp("5%"),
  },
  calendarImg: {
    width: wp("50%"),
    height: hp("25%"),
    resizeMode: "contain",
  },
  turtleImg: {
    width: wp("14%"),
    height: hp("9%"),
    resizeMode: "contain",
    top: hp("-4%"),
    left: wp("-15%"),
  },
  titeCon: {
    height: hp("66%"),
    alignItems: "center",
    gap: hp("2%"),
    marginTop: hp("15%"),
  },
  buttonlogin: {
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#76D6F4",
    paddingVertical: hp("0.8%"),
    paddingHorizontal: wp("20%"),
    borderRadius: 30,
    width: wp("60%"),
    gap: wp("2.5%"),
  },
  button: {
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#76D6F4",
    paddingVertical: hp("0.8%"),
    paddingHorizontal: wp("20%"),
    borderRadius: 30,
    width: wp("60%"),
    gap: wp("2.5%"),
  },
  icon: {
    width: wp("3.8%"),
    height: hp("2.5%"),
  },
  buttonText: {
    fontSize: 15,
    color: "#2D5D6B",
    fontFamily: "Jua-Regular",
  },
  catIcon: {
    position: "absolute",
    bottom: hp("5%"),
    width: wp("55%"),
    height: hp("25%"),
    resizeMode: "contain",
    alignSelf: "center",
    zIndex: 2,
  },
  versionBox: {
    position: 'absolute',
    bottom: hp("1.5%"),
    width: '100%',
    alignItems: 'center',
  },
  versionText: {
    color: '#999',
    fontSize: 12,
  },
});

export default HomeScreen;