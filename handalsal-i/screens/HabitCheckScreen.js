import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from '@env';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function HabitCheckScreen({ route, navigation }) {
    const { categoryName, detailedHabit, habitTime, satisfaction } = route.params;

    // 기록하기 버튼이 눌렸을 때, 습관 기록 데이터 서버로 전송
    const handleRecord = async () => {

        // habitTime (예: "3시간 30분")을 숫자형 시간(예: 3.5)으로 변환
        let totalTime = 0;
        try {
            const timeParts = habitTime.split('시간');
            const hours = parseInt(timeParts[0].trim(), 10);
            const minutes = parseInt(timeParts[1].replace('분', '').trim(), 10);
            totalTime = hours + minutes / 60;
        } catch (error) {
            console.error("시간 변환 오류:", error);
            Alert.alert("오류", "습관 시간을 올바르게 변환하지 못했습니다.");
            return;
        }

        // 오늘 날짜를 "YYYY-MM-DD" 형식으로 생성
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];

        //카테고리 영문화
        let convertedCategoryType;
        if (categoryName == "활동")
            convertedCategoryType = "ACTIVITY"
        else if (categoryName == "지적")
            convertedCategoryType = "INTELLIGENT"
        else
            convertedCategoryType = "ART"

        // POST 요청에 보낼 데이터
        const recordData = {
            category: convertedCategoryType,
            detailed_habit_name: detailedHabit,
            time: totalTime,
            satisfaction: satisfaction,
            date: formattedDate,
        };

        //api 호출
        try {
            const token = await AsyncStorage.getItem("authToken");

            const response = await fetch(`${API_BASE_URL}/habits/record`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recordData),
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

            if (response.ok) {
                const data = await response.json();

                // 외형 변화가 있을 때
                if (data.appearance_change) {
                    const response = await fetch(`${API_BASE_URL}/handalis/change`, {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })

                    if (response.ok) {
                        const imageData = await response.text();
                        console.log("한달이 이미지 변화 성공: " + imageData);
                    }

                    Alert.alert(
                        "한달이의 성장",
                        "한달이의 외형이 변화하였습니다.",
                        [
                            {
                                text: "메인 화면으로 돌아가기",
                                onPress: () => navigation.navigate("MainScreen"),
                            },
                        ],
                        { cancelable: false }
                    );
                }

                //외형 변화가 없을 때
                else {
                    Alert.alert(
                        "알림",
                        data.message, // "습관이 성공적으로 기록되었습니다."
                        [
                            {
                                text: "메인 화면으로 돌아가기",
                                onPress: () => navigation.navigate("MainScreen"),
                            },
                        ],
                        { cancelable: false }
                    );
                }

            }

            //당일 습관이 이미 기록되었을 때
            else {
                const textData = await response.text();
                Alert.alert("습관 중복 기록", textData, [
                    {
                        text: "메인 화면으로 돌아가기",
                        onPress: () => navigation.navigate("MainScreen"),
                    },
                ],
                    { cancelable: false });
            }

        } catch (error) {
            console.error("기록 요청 실패:", error);
            Alert.alert("오류", "기록 중 오류가 발생했습니다.");
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

            <View style={styles.mainContainer}>
                {/**타이틀 */}
                <View style={styles.mainTitleCon}>
                    <Text style={styles.mainTitleText}>기록할 내용을 확인해주세요</Text>
                    <Text style={styles.mainSubTitleText}>같은 습관에 대한 기록은 하루에 한번만 할 수 있어요!</Text>
                    <Text style={styles.mainSubTitleText}> 수정이 불가하니 신중히 기록해주세요!</Text>
                </View>

                {/**카테고리명 */}
                <View style={styles.categoryNameCon}>
                    <View style={styles.card}>
                        <Text style={styles.labelsText}>카테고리명</Text>
                        <Text style={styles.contentText}> {categoryName}</Text>
                    </View>
                </View>

                {/**세부습관 */}
                <View style={styles.detailedHabitNameCon}>
                    <View style={styles.card}>
                        <Text style={styles.labelsText}>세부습관</Text>
                        <Text style={styles.contentText}>{detailedHabit}</Text>
                    </View>
                </View>

                {/**습관 시간 */}
                <View style={styles.timeCon}>
                    <View style={styles.card}>
                        <Text style={styles.labelsText}>습관 시간</Text>
                        <Text style={styles.contentText}>{habitTime}</Text>
                    </View>
                </View>

                {/**성취만족도 */}
                <View style={styles.satisfactionCon}>
                    <View style={styles.card}>
                        <Text style={styles.labelsText}>성취 만족도</Text>
                        <Text style={styles.contentText}>{satisfaction}</Text>
                    </View>
                </View>

                {/**기록하기 버튼*/}
                <View style={styles.recordCon}>
                    <TouchableOpacity
                        style={styles.recordButton}
                        onPress={handleRecord}>
                        <Text style={styles.recordText}>기록하기</Text>
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
        backgroundColor: '#76D6F4',
    },
    backButton: {
        marginTop: SCREEN_HEIGHT * 0.06,
        marginLeft: SCREEN_WIDTH * 0.06,
        // backgroundColor: 'pink'
    },
    mainContainer: {
        flex: 1,
        paddingTop: SCREEN_WIDTH * 0.03,
        paddingLeft: SCREEN_WIDTH * 0.07,
        paddingRight: SCREEN_WIDTH * 0.07,
        paddingBottom: SCREEN_WIDTH * 0.07,
    },
    mainTitleCon: {
        flex: 0.8,
        justifyContent: 'center',
        alignItems: 'center',
        //backgroundColor: 'yellow',
    },
    categoryNameCon: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'red',
    },

    detailedHabitNameCon: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'yellow'
    },
    timeCon: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'green'
    },
    satisfactionCon: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'blue'
    },
    recordCon: {
        flex: 0.6,
        justifyContent: 'center',
    },

    //in view
    card: {
        backgroundColor: 'white',
        width: '100%',
        padding: SCREEN_WIDTH * 0.05,
        borderRadius: 20,
    },

    //button
    recordButton: {
        backgroundColor: "#FFE98A",
        padding: SCREEN_HEIGHT * 0.02,
        borderRadius: 30,
        alignItems: "center",
    },

    //text
    mainTitleText: {
        fontSize: SCREEN_WIDTH * 0.07,
        fontWeight: 'bold',
        color: 'black'
    },
    mainSubTitleText: {
        fontSize: SCREEN_WIDTH * 0.037,
        color: '#3076f7',
        fontWeight: 'bold'
    },
    labelsText: {
        fontSize: SCREEN_WIDTH * 0.04,
        fontWeight: 'bold',
        color: 'black'
    },
    contentText: {
        fontSize: SCREEN_WIDTH * 0.09,
        fontWeight: 400,
        alignSelf: 'center',
        color: 'black'
    },
    recordText: {
        color: 'white',
        fontSize: SCREEN_WIDTH * 0.05,
        fontWeight: 'bold',
        color: 'black'
    },

});
