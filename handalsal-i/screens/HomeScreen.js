import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  ImageBackground,
} from "react-native";
import React, { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

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
            source={require("../assets/HomeScreen/달력 그림.png")}
            style={styles.img}
          />
        </View>

        {/* 타이틀 및 버튼 */}
        <View style={styles.titeCon}>
          <Text style={styles.titetext}>한달이</Text>

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

      <View style={styles.versionBox}>
        <Text style={styles.versionText}>v1.0.0</Text>
      </View>

    </View>

  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FFE98A",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: SCREEN_HEIGHT * 0.05,
    zIndex: 1,
  },
  background: {
    position: "absolute",
    bottom: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.38,
    zIndex: 0,
  },
  imgCon: {
    flex: SCREEN_HEIGHT * 0.2
  },
  img: {
    width: 215,
    height: 226,
    resizeMode: "contain",
  },
  titeCon: {
    flex: SCREEN_HEIGHT * 0.5,
    alignItems: "center",
    gap: 20,
  },
  titetext: {
    fontSize: 48,
    fontWeight: "bold",
  },
  buttonlogin: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#76D6F4",
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 30,
    width: SCREEN_WIDTH * 0.5,
    gap: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#76D6F4",
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 30,
    width: SCREEN_WIDTH * 0.5,
    gap: 10,
  },
  icon: {
    width: 13.42,
    height: 20,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D5D6B",
  },
  catIcon: {
    position: "absolute",
    bottom: SCREEN_HEIGHT * 0.05,
    width: 209,
    height: 197,
    resizeMode: "contain",
    alignSelf: "center",
    zIndex: 2,
  },
  versionBox: {
    position: 'absolute',
    bottom: 10,      // 화면 하단으로부터 10px
    width: '100%',
    alignItems: 'center',
  },
  versionText: {
    color: '#999',
    fontSize: 12,
  },
});

export default HomeScreen;