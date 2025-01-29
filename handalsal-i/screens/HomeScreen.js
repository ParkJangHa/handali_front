import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import React from "react";

const HomeScreen = ({ navigation }) => { // navigation props 받음
  return (
    <View style={styles.container}>
      {/* 이미지 추가 */}
      <View style={styles.imgCon}>
        <Image 
          source={require("../assets/logo.png")} // 이미지 경로 설정
          style={styles.img} // 스타일 적용
        />
      </View>
      <View style={styles.titeCon}>
        <View style={styles.tite}>
          <Text style={styles.titetext}>한달이</Text>
        </View>
        <View style={styles.ButtonCon}>
          {/* 로그인 버튼 */}
          <TouchableOpacity 
            style={styles.buttonlogin} 
            onPress={() => navigation.navigate("Login")} // navigation 객체 사용
          >
            <Text style={styles.buttonText}>로그인</Text>
          </TouchableOpacity>
          {/* 회원가입 버튼 */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate("Signup")} // navigation 객체 사용
          >
            <Text style={styles.buttonText}>회원가입</Text>
          </TouchableOpacity>
        </View>
      </View>
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFD563",
  },
  imgCon: {
    flex: 0.9,
    alignItems: "center", // 이미지 중앙 정렬
    justifyContent: "center",
  },
  img: {
    width: 250, // 이미지 너비
    height: 250, // 이미지 높이
    resizeMode: "contain", // 이미지 비율 유지
  },
  titeCon: {
    flex: 1,
  },
  tite: {
    flex: 0.2,
    alignItems: "center",
    justifyContent: "center",
  },
  titetext: {
    fontSize: 50,
    fontWeight: "bold",
    marginTop: -50,
  },
  ButtonCon: {
    flex: 0.5,
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  // 버튼 스타일 추가
  button: {
    backgroundColor: "#FDA44F", // 버튼 배경색
    paddingVertical: 20, // 버튼 높이
    paddingHorizontal: 80, // 버튼 너비
    borderRadius: 30, // 버튼 둥근 테두리
  },
  buttonlogin: {
    backgroundColor: "#FDA44F", // 버튼 배경색
    paddingVertical: 20, // 버튼 높이
    paddingHorizontal: 90, // 버튼 너비
    borderRadius: 30, // 버튼 둥근 테두리
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000", // 버튼 텍스트 색상 검정색
    textAlign: "center",
  },
});

export default HomeScreen;
