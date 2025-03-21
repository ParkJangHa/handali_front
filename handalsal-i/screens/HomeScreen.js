import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import React from "react";

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.imgCon}>
        <Image 
          source={require("../assets/logo.png")}
          style={styles.img}
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
    alignItems: "center", 
    justifyContent: "center",
  },
  img: {
    width: 250, 
    height: 250, 
    resizeMode: "contain", 
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
  button: {
    backgroundColor: "#FDA44F", 
    paddingVertical: 20, 
    paddingHorizontal: 80, 
    borderRadius: 30, 
  },
  buttonlogin: {
    backgroundColor: "#FDA44F", 
    paddingVertical: 20, 
    paddingHorizontal: 90, 
    borderRadius: 30, 
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000", 
    textAlign: "center",
  },
});

export default HomeScreen;
