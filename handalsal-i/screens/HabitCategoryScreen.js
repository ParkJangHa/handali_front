import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function HabitCategoryScreen({ navigation }) {
    const [selectedType, setSelectedType] = useState(null);
    const getImageSource = () => {
        switch (selectedType) {
            case "활동":
                return require('../assets/activityLogo.png'); // 활동 이미지
            case "지적":
                return require('../assets/intelligenceLogo.png'); // 지적 이미지
            case "예술":
                return require('../assets/artLogo.png'); // 예술 이미지
            default:
                return require('../assets/default.png'); // 기본 이미지
        }
    };



    return (
        <View style={styles.container}>
            <View style={styles.backButton}>
                <TouchableOpacity
                    onPress={() => { navigation.goBack() }}>
                    <Image
                        source={require('../assets/backButton.png')}>
                    </Image>
                </TouchableOpacity>
            </View>


            <View style={styles.containerTop}>
                {selectedType === null ? (
                    <View style={styles.speechBubble}>
                        <Text style={styles.speechText}>오늘 뭐했어요?</Text>
                        <View style={styles.speechTriangle}></View>
                    </View>) : null}

                <Image
                    source={getImageSource()} // 동적으로 이미지 변경
                    style={styles.categoryImage}
                />
            </View>

            <View style={styles.containerBottom}>
                <View style={styles.todayHabitRecord}>
                    <Text style={styles.recordTitle}>오늘 습관 기록</Text>
                </View>

                <View style={styles.habitCategories}>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            selectedType === "활동" && styles.selectedButton,
                        ]}
                        onPress={() => setSelectedType("활동")}
                    >
                        <Text style={styles.buttonText}>활 동</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            selectedType === "지적" && styles.selectedButton,
                        ]}
                        onPress={() => setSelectedType("지적")}
                    >
                        <Text style={styles.buttonText}>지 적</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            selectedType === "예술" && styles.selectedButton,
                        ]}
                        onPress={() => setSelectedType("예술")}
                    >
                        <Text style={styles.buttonText}>예 술</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.selectView}>
                    <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => {
                            if (selectedType) {
                                navigation.navigate("HabitDetail", { categoryType: selectedType });
                            } else {
                                alert("하나의 카테고리를 선택해주세요!"); // 선택하지 않았을 때 경고
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
        backgroundColor: "#FF9730"
    },
    backButton: {
        marginTop: SCREEN_HEIGHT * 0.06,
        marginLeft: SCREEN_WIDTH * 0.06,
        // backgroundColor: 'pink'
    },
    containerTop: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        // backgroundColor: 'blue'
    },
    containerBottom: {
        flex: 1.3,
        backgroundColor: "#FFF1CA",
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        paddingTop: SCREEN_HEIGHT * 0.04,
        paddingLeft: SCREEN_HEIGHT * 0.05,
        paddingRight: SCREEN_HEIGHT * 0.05,
    },

    // in containerTop
    speechBubble: {
        position: 'absolute',
        top: SCREEN_HEIGHT * 0.03,
        left: SCREEN_WIDTH * 0.05,
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
        width: SCREEN_WIDTH * 0.5,
        height: SCREEN_HEIGHT * 0.3,
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
        backgroundColor: "#FFC387",
        opacity: 0.8,
        padding: SCREEN_HEIGHT * 0.02,
        marginVertical: SCREEN_HEIGHT * 0.01,
        borderRadius: 20,
        width: "100%",
        alignItems: "center",
    },
    selectedButton: {
        backgroundColor: "#FF8000", // 선택된 버튼 스타일
    },
    selectButton: {
        backgroundColor: "black",
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
        color: 'white'
    },
    speechText: {
        fontSize: SCREEN_WIDTH * 0.045,
        fontWeight: 'bold',
        color: 'black',
    },


});