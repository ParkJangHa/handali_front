import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from '@env';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function HabitCategoryScreen({ navigation }) {
    const [selectedType, setSelectedType] = useState(null); // 활동, 지능, 예술
    const [imageSource, setImageSource] = useState(require("../assets/default_character.png"));

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

    // 이미지 파일명을 매핑하는 객체
    const imageMap = {
        "image_0_0_0.png": require("../assets/0,0,0.png"),
        "image_0_0_1.png": require("../assets/0,0,1.png"),
        "image_0_1_0.png": require("../assets/0,1,0.png"),
        "image_0_1_1.png": require("../assets/0,1,1.png"),
        "image_1_0_0.png": require("../assets/1,0,0.png"),
        //add more...
    }

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
                setImageSource(imageMap[data.image]) || require("../assets/default_character.png");
                console.log("습관 기록 화면, 이미지 호출: " + data.image);
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
                    style={[styles.categoryImage,
                        selectedType === null && { 
                            width: SCREEN_HEIGHT * 0.8, 
                            height: SCREEN_HEIGHT * 0.8,
                            zIndex: -1,
                            position: 'absolute',
                            top: -SCREEN_WIDTH * 0.2,
                            left: -SCREEN_WIDTH * 0.18,
                        } // 선택 안 했을 때 키우기
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
    //container
    container: {
        flex: 1,
        backgroundColor: "#FFE98A"
    },
    backButton: {
        marginTop: SCREEN_HEIGHT * 0.06,
        marginLeft: SCREEN_WIDTH * 0.06,
        // backgroundColor: 'pink'
    },
    containerTop: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: 'blue'
    },
    containerBottom: {
        flex: 1.3,
        backgroundColor: "#76D6F4",
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        paddingTop: SCREEN_HEIGHT * 0.04,
        paddingLeft: SCREEN_HEIGHT * 0.05,
        paddingRight: SCREEN_HEIGHT * 0.05,
    },

    // in containerTop
    speechBubble: {
        position: 'absolute',
        top: SCREEN_HEIGHT * 0.08,
        left: SCREEN_WIDTH * 0.3,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: SCREEN_WIDTH * 0.02,
        width: SCREEN_WIDTH * 0.6,
        alignItems: 'center'
    },
    speechTriangle: {
        position: 'absolute',
        bottom: -15,
        left: '50%',
        marginLeft: -5,
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderTopWidth: 15,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: 'white',
    },
    categoryImage: {
        width: SCREEN_HEIGHT * 0.25,
        height: SCREEN_HEIGHT * 0.25,
        resizeMode: 'contain',
    },

    //in containerBottom
    todayHabitRecord: {
        flex: 0.4,
        // marginTop: SCREEN_HEIGHT * 0.05,
        // marginLeft: SCREEN_WIDTH * 0.1,
        // backgroundColor: 'skyblue'
    },
    habitCategories: {
        flex: 3,
        alignItems: "center",
        justifyContent: 'center',
        // backgroundColor: 'pink'
    },
    selectView: {
        flex: 1.5,
        alignItems: "center",
        justifyContent: 'center',
        // backgroundColor: 'yellow'
    },

    //buttons
    button: {
        backgroundColor: "white",
        opacity: 0.8,
        padding: SCREEN_HEIGHT * 0.02,
        marginVertical: SCREEN_HEIGHT * 0.01,
        borderRadius: 20,
        width: "100%",
        alignItems: "center",
    },
    selectedButton: {
        backgroundColor: "#3076f7", // 선택된 버튼 스타일
    },
    selectButton: {
        backgroundColor: "#FFE98A",
        padding: SCREEN_HEIGHT * 0.023,
        borderRadius: 30,
        width: "100%",
        alignItems: "center",
    },


    //text
    recordTitle: {
        fontSize: SCREEN_WIDTH * 0.05,
        fontWeight: 'bold'
    },
    buttonText: {
        fontSize: SCREEN_WIDTH * 0.049,
        // fontWeight: 'bold'
    },
    selectButtonText: {
        fontSize: SCREEN_WIDTH * 0.049,
        fontWeight: 'bold',
        color: 'black'
    },
    speechText: {
        fontSize: SCREEN_WIDTH * 0.045,
        fontWeight: 'bold',
        color: 'black',
    },
    selectedText: {
        fontWeight: 'bold'
    }

});