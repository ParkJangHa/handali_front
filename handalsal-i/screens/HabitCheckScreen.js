import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function HabitCheckScreen({ route, navigation }) {
    const { categoryName, detailedHabit, habitTime, satisfaction } = route.params;


    // 기록하기 버튼을 눌렀을 때 호출되는 함수
    const handleRecord = async () => {
        // habitTime (예: "3시간 30분")을 숫자형 시간(예: 3.5)으로 변환
        let totalTime = 0;
        try {
            const timeParts = habitTime.split('시간');
            const hours = parseInt(timeParts[0].trim(), 10);
            // "분" 부분 제거 후 정수로 변환
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

        try {
            const response = await fetch('http://43.201.250.84/habits/record', {
                method: 'POST',
                headers: {
                    Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJoYWRhMTExMUBnbWFpbC5jb20iLCJ1c2VySWQiOjEsImlhdCI6MTczODkyOTU4NSwiZXhwIjoxNzM4OTMwNDg1fQ.Ge-3rzz9P9UGqJoAePaN4lR2y9Um679IpsseEHPw6b8",
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recordData),
            });

            if (response.ok) {
                const data = await response.json();
                Alert.alert(
                    "알림",
                    data.message, // "습관이 성공적으로 기록되었습니다."
                    [
                        {
                            text: "확인",
                            onPress: () => navigation.navigate("MainScreen"),
                        },
                    ],
                    { cancelable: false }
                );
            } else {
                // 409 Conflict 같은 에러 상황
                const textData = await response.text();
                Alert.alert("알림", textData);
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
        // backgroundColor: '#FF9730',
        backgroundColor: '#FFF5DA',
    },
    backButton: {
        marginTop: SCREEN_HEIGHT * 0.06,
        marginLeft: SCREEN_WIDTH * 0.06,
        // backgroundColor: 'pink'
    },
    mainContainer: {
        flex: 1,
        padding: SCREEN_WIDTH * 0.07,
    },
    mainTitleCon: {
        flex: 0.5,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'yellow',
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
        // backgroundColor: '#FFF5DA',
        backgroundColor: '#FF9730',
        opacity: 0.8,
        width: '100%',
        padding: SCREEN_WIDTH * 0.05,
        borderRadius: 20,
        borderColor: '#FFF5DA',
        borderWidth: 1,
    },

    //button
    recordButton: {
        backgroundColor: "black",
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
        color: 'white'
    },

});
