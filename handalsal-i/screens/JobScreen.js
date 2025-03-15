import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions } from "react-native";
import React, { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from '@env';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const JobScreen = ({ navigation }) => {
    //가장 마지막에 생성한 한달이를 가져옴
    const [nickname, setNickname] = useState();
    const [jobName, setJobName] = useState();
    const [salary, setSalary] = useState();
    const [startDate, setStartDate] = useState();
    const imageSource = require("../assets/000.png");

    // ✅ 이미지 파일명을 매핑하는 객체
    const imageMap = {
        "image_0_0_0.png": require("../assets/000.png"),
        "image_0_0_1.png": require("../assets/001.png"),
        "image_0_1_0.png": require("../assets/010.png"),
        "image_0_1_1.png": require("../assets/011.png"),
        "image_1_0_0.png": require("../assets/100.png"),
        //add more...
    }

    // ✅ 동적으로 이미지 파일을 가져오는 함수
    const setImageSource = (imageName) => {
        imageSource = imageMap[imageName] || require("../assets/000.png");
    };

    //오늘 날짜
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

    // 화면이 로드되면 POST 요청을 보내서 한달이 정보 가져옴
    useEffect(() => {
        const fetchJobDetails = async () => {
            const token = await AsyncStorage.getItem("authToken");

            try {
                const response = await fetch(`${API_BASE_URL}/handalis/recent`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // ✅ 409 응답 처리 (한달이가 존재하지 않는 경우)
                if (response.status === 409) {
                    Alert.alert(
                        "한달이가 존재하지 않습니다.",
                        "최근에 생성된 한달이가 존재하지 않습니다.",
                        [
                            {
                                text: "확인",
                                onPress: () => navigation.navigate('MainScreen'), // ✅ 이전 화면으로 이동
                            }
                        ],
                        { cancelable: false }
                    );
                    return;
                }

                const data1 = await response.json();

                if (response.ok) {
                    console.log("📌 한달이 ID 가져오기 성공:", data1);
                    setNickname(data1.nickname);
                    setJobName(data1.job_name);
                    setSalary(data1.salary);
                    setStartDate(data1.start_date);
                    setImageSource(data1.image);

                } else {
                    console.log("API 응답 오류:", data1);
                }

            } catch (error) {
                console.log("❌ 한달이 ID API 응답 오류:", data1);
            }
        };

        fetchJobDetails();
    }, []);


    return (
        <View style={styles.container}>
            {/* 제목 */}
            <View style={styles.titleContainer}>
                <Text style={styles.dateText}>{formattedDate}</Text>
                <Text style={styles.titleText}>한달이의 성장이 끝나 독립하였어요!</Text>
                <Text style={styles.titleText}></Text>
                <View style={styles.memoContainer}>
                    <Text style={styles.memoText}>한달이는 취업을 하고 주급을 벌어오게 돼요.</Text>
                </View>
            </View>

            { /* 한달이*/}
            <View style={styles.handaliContainer}>
                <LinearGradient
                    colors={["#FFE0B2", "#FFB07F", "#FF865E"]} // 그라데이션 색상
                    style={styles.circle}
                >
                    { /**헤더 */}
                    <View style={styles.circlerHeaderContainer}>
                        <View style={styles.circleTitle}><Text style={styles.circleHeaderText}>한달이 독립</Text></View>
                        <View style={styles.circleDate}><Text style={styles.circleHeaderText}>시작일. {startDate}</Text></View>
                    </View>

                    {/**닉네임 */}
                    <View style={styles.nicknameContainer}>
                        <Text style={styles.nicknameText}>{nickname}</Text>
                    </View>

                    {/**이미지 */}
                    <View style={styles.imageContainer}><Image source={imageSource} style={styles.handaliImage}></Image></View>

                    {/**구분선 */}
                    <View style={styles.line}></View>

                    {/**직업, 주급 */}
                    <View style={styles.jobCoin}>
                        <Text style={styles.nameText}>직업</Text>
                        <Text style={styles.valueText}>{jobName}</Text>
                    </View>
                    <View style={styles.jobCoin}>
                        <Text style={styles.nameText}>주급</Text>
                        <Text style={styles.valueText}>{salary}</Text>
                    </View>
                </LinearGradient>
            </View>

            {/* 버튼 */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Category')}>
                    <Text style={styles.buttonText}>다음 한달이 시작하기</Text>
                </TouchableOpacity>
            </View>

        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: SCREEN_HEIGHT * 0.02,
        backgroundColor: '#FFFDF0'
    },


    titleContainer: {
        flex: 0.2,
        marginTop: SCREEN_HEIGHT * 0.06,
        // backgroundColor: 'blue'
    },
    memoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SCREEN_HEIGHT * 0.03,
        // backgroundColor: 'red'
    },


    handaliContainer: {
        flex: 0.67,
        alignItems: 'center',
        // backgroundColor: 'orange'
    },
    circlerHeaderContainer: {
        flexDirection: "row",
        justifyContent: 'space-between',
        width: "90%",
        // backgroundColor: 'green'
    },
    nicknameContainer: {
        padding: SCREEN_HEIGHT * 0.01,
        // backgroundColor: 'red'
    },
    imageContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "60%",
        // backgroundColor: 'blue',
    },
    jobCoin: {
        flexDirection: "row",
        justifyContent: 'space-between',
        width: "90%",
        paddingVertical: 15,
        // backgroundColor: 'red'
    },


    buttonContainer: {
        flex: 0.13,
        justifyContent: 'center',
        alignItems: 'center'
    },


    circle: {
        width: SCREEN_WIDTH * 0.8,
        height: SCREEN_HEIGHT * 0.6,
        backgroundColor: '#FDA44F',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SCREEN_WIDTH * 0.03
    },
    circleTitle: {
        backgroundColor: "#FFF4E1",
        borderRadius: 10,
        height: SCREEN_HEIGHT * 0.03,
        width: SCREEN_WIDTH * 0.2,
        alignItems: 'center',
        justifyContent: 'center'
    },
    circleDate: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    handaliImage: {
        width: '60%',
        resizeMode: "contain" //이미지 비율 유지
    },
    line: {
        backgroundColor: '#FFEBD8',
        height: 1,
        width: '100%',
    },

    button: {
        backgroundColor: 'black',
        width: SCREEN_WIDTH * 0.8,
        paddingVertical: SCREEN_HEIGHT * 0.02,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30
    },


    dateText: {
        fontSize: SCREEN_WIDTH * 0.06,
        fontWeight: 'bold'
    },
    titleText: {
        fontSize: SCREEN_WIDTH * 0.06,
        fontWeight: 'bold'
    },
    memoText: {
        fontSize: SCREEN_WIDTH * 0.05,
        color: '#FF8000',
        fontWeight: 'bold'
    },
    circleHeaderText: {
        color: "#8B5E3C"
    },
    nicknameText: {
        fontSize: SCREEN_WIDTH * 0.06,
        fontWeight: 'bold',
        color: "#8B5E3C",
        justifyContent: 'center',
    },
    nameText: {
        fontSize: SCREEN_WIDTH * 0.047,
        color: '#FFEBD8'
    },
    valueText: {
        fontSize: SCREEN_WIDTH * 0.047,
        fontWeight: 'bold',
        color: "#8B5E3C"
    },
    buttonText: {
        color: 'white',
        fontSize: SCREEN_WIDTH * 0.05,
        fontWeight: 'bold'
    }

});

export default JobScreen;