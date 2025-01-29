import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, Dimensions } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const HandalStart = ({ navigation }) => {
  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

  const [progress, setProgress] = useState(100); // 진행률 (0~100)
  const [nicknameInput, setNicknameInput] = useState("");

  const MainScreen = () => {
      navigation.navigate("MainScreen");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.dateText}>{formattedDate}</Text>
      <Text style={styles.title}>이제 '한달이'가 태어나요</Text>
      <View style = {styles.progressBar}>
        <Image 
          source={require("../assets/probar.png")} // 이미지 경로 설정
          style={styles.backgroundBar} // 스타일 적용
        />
        <View style={[styles.foregroundWrapper, { width: `${progress}%` }]}>
        <Image
          source={require("../assets/probarlevel.png")}
          style={styles.foregroundBar}
        />
        </View>
      </View>
      <Text style={styles.subTitle}>앞으로 같이 성장할 '한달이'에요.</Text>
      <Image
          source={require("../assets/pikmin.png")}
          style={styles.handalImage}
        />
      <View style={styles.nicknameCon}>
        <Text style={styles.nicknameText}>한달이에게 별명을 지어주세요!</Text>
        <TextInput
              style={styles.input}
              placeholder="   별명을 입력해 주세요."
              value={nicknameInput}
              onChangeText={setNicknameInput}
            />
        </View>
      <TouchableOpacity style={styles.startButton} onPress={MainScreen}>
                        <Text style={styles.startButtonText}>시작할래요</Text>
      </TouchableOpacity>
    </View>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: SCREEN_WIDTH * 0.05,
    backgroundColor: "#FFF",
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
  handalImage: {
    width: SCREEN_WIDTH * 0.4, // 반응형 너비
    height: SCREEN_HEIGHT * 0.35, // 반응형 높이
    marginTop: SCREEN_HEIGHT * 0.02,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  nicknameCon: {
    flex: 1,
    width: SCREEN_WIDTH * 0.9, // 반응형 너비
    justifyContent: "center",
    alignItems: "center",
    borderRadius: SCREEN_WIDTH * 0.05, // 둥근 테두리 반응형
    backgroundColor: "rgba(224, 242, 31, 0.5)",
    marginBottom: SCREEN_HEIGHT * 0.02, // 반응형 아래 여백
  },
  nicknameText: {
    fontSize: SCREEN_WIDTH * 0.06, // 반응형 텍스트 크기
    marginBottom: SCREEN_HEIGHT * 0.02, // 반응형 아래 여백
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#FFF7F7",
    width: "80%",
    height: SCREEN_HEIGHT * 0.06, // 반응형 높이
    borderRadius: SCREEN_WIDTH * 0.08, // 둥근 테두리 반응형
    textAlign: "center",
    fontSize: SCREEN_WIDTH * 0.05, // 반응형 폰트 크기
    color: "#000",
  },
  startButton: {
    width: SCREEN_WIDTH * 0.9,
    backgroundColor: "#F8B66C",
    paddingVertical: SCREEN_HEIGHT * 0.02, // 반응형 세로 여백
    paddingHorizontal: SCREEN_WIDTH * 0.1, // 반응형 가로 여백
    borderRadius: SCREEN_WIDTH * 0.05, // 둥근 테두리 반응형
    alignSelf: "center",
  },
  startButtonText: {
    fontSize: SCREEN_WIDTH * 0.045, // 반응형 폰트 크기
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
});


export default HandalStart;