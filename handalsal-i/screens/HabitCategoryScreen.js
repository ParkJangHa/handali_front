import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from '@env';
import { characterImageMap } from "../utils/characterImageMap";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function HabitCategoryScreen({ navigation }) {
    const [selectedType, setSelectedType] = useState(null); // 활동, 지능, 예술
    const [imageSource, setImageSource] = useState(require("../assets/character/default_character.png"));

    // 선택된 활동, 지능, 예술 이미지 반환
    const getImageSource = () => {
        switch (selectedType) {
            case "활동":
                return require('../assets/activityLogo.png');
            case "지능":
                return require('../assets/intelligenceLogo.png');
            case "예술":
                return require('../assets/artLogo.png');
            default:
                return imageSource
        }
    };
    // api 호출
    const fetchImage = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");

            const response = await fetch(`${API_BASE_URL}/handalis/view`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 412) {
                Alert.alert(
                    "세션 만료",
                    "로그인이 만료되었습니다. 다시 로그인해주세요.",
                    [{
                        text: "확인", onPress: async () => {
                            await AsyncStorage.removeItem("authToken");
                            navigation.navigate("Login");
                        }
                    }],
                    { cancelable: false }
                );
                return;
            }

            if (response.status === 404) {
                Alert.alert("한달이가 존재하지 않습니다.", "메인화면으로 이동합니다.",
                    [{ text: "확인", onPress: () => navigation.navigate("MainScreen") }]
                );
            }

            if (response.ok) {
                const data = await response.json();
                setImageSource(
                    characterImageMap[data.handali_img] ?? require("../assets/character/default_character.png")
                );
                console.log("습관 기록 화면, 이미지 호출:", data.handali_img);
            }

        } catch (error) {
            console.error("이미지 호출 실패:", error);
        }
    };

    useEffect(() => {
        fetchImage();
    }, []);

    return (
        <View style={styles.container}>
            {/**뒤로가기 버튼 */}
            <View style={styles.backButton}>
                <TouchableOpacity
                    onPress={() => { navigation.goBack() }}>
                    <Image
                        source={require('../assets/backButton.png')}>
                    </Image>
                </TouchableOpacity>
            </View>

            {/**상단 이미지 */}
            <View style={styles.containerTop}>
                {selectedType === null ? ( //선택된 값이 없을 경우, 한달이 기본 이미지
                    <View style={styles.speechBubble}>
                        <Text style={styles.speechText}>오늘 뭐했어요?</Text>
                        <View style={styles.speechTriangle}></View>
                    </View>) : null}

                <Image
                    source={getImageSource()} // 선택된 값이 있을 경우, 값(활동, 지능, 예술)에 따라 동적으로 이미지 변경
                        style={[
                            styles.categoryImage,
                            selectedType === null && {
                                width: hp("30%"),
                                height: hp("30%"),
                                zIndex: -1,
                                position: "absolute",
                                top: wp("25%"),
                                left: wp("30%"),
                            },
                        ]}
                />
            </View>

            {/**하단 버튼 */}
            <View style={styles.containerBottom}>
                {/**제목 */}
                <View style={styles.todayHabitRecord}>
                    <Text style={styles.recordTitle}>오늘 습관 기록</Text>
                </View>

                {/**세부습관 버튼 */}
                <View style={styles.habitCategories}>
                    <TouchableOpacity
                        style={[styles.button, selectedType === "활동" && styles.selectedButton,]}
                        onPress={() => setSelectedType("활동")}>
                        <Text style={[styles.buttonText, selectedType === "활동" && styles.selectedText]}>활 동</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, selectedType === "지능" && styles.selectedButton,]}
                        onPress={() => setSelectedType("지능")}>
                        <Text style={[styles.buttonText, selectedType === "지능" && styles.selectedText]}>지 능</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, selectedType === "예술" && styles.selectedButton,]}
                        onPress={() => setSelectedType("예술")}>
                        <Text style={[styles.buttonText, selectedType === "예술" && styles.selectedText]}>예 술</Text>
                    </TouchableOpacity>
                </View>

                {/**선택하기 버튼 */}
                <View style={styles.selectView}>
                    <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => {
                            if (selectedType) {
                                navigation.navigate("HabitDetail", { categoryType: selectedType });
                            } else {
                                alert("하나의 카테고리를 선택해주세요!");
                            }
                        }}
                    >
                        <Text style={styles.selectButtonText}>선택하기</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE98A",
  },
  backButton: {
    marginTop: hp("6%"),
    marginLeft: wp("6%"),
  },
  containerTop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  containerBottom: {
    flex: 1.3,
    backgroundColor: "#76D6F4",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingTop: hp("4%"),
    paddingLeft: hp("5%"),
    paddingRight: hp("5%"),
  },

  // in containerTop
  speechBubble: {
    position: "absolute",
    top: hp("8%"),
    left: wp("30%"),
    backgroundColor: "white",
    borderRadius: 15,
    padding: wp("2%"),
    width: wp("60%"),
    alignItems: "center",
  },
  speechTriangle: {
    position: "absolute",
    bottom: -15,
    left: "50%",
    marginLeft: -5,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 15,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "white",
  },
  categoryImage: {
    width: hp("25%"),
    height: hp("25%"),
    resizeMode: "contain",
  },

  // in containerBottom
  todayHabitRecord: {
    flex: 0.4,
  },
  habitCategories: {
    flex: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  selectView: {
    flex: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },

  // buttons
  button: {
    backgroundColor: "white",
    opacity: 0.8,
    padding: hp("2%"),
    marginVertical: hp("1%"),
    borderRadius: 20,
    width: "100%",
    alignItems: "center",
  },
  selectedButton: {
    backgroundColor: "#3076f7",
  },
  selectButton: {
    backgroundColor: "#FFE98A",
    padding: hp("2.3%"),
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
  },

  // text
  recordTitle: {
    fontSize: wp("5%"),
    fontFamily: "Jua-Regular",
  },
  buttonText: {
    fontSize: wp("4.9%"),
    fontFamily: "Jua-Regular",
  },
  selectButtonText: {
    fontSize: wp("4.9%"),
    color: "black",
    fontFamily: "Jua-Regular",
  },
  speechText: {
    fontSize: wp("4.5%"),
    color: "black",
    fontFamily: "Jua-Regular",
  },
  selectedText: {
    fontFamily: "Jua-Regular",
  },
});
