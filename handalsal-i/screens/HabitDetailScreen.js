import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, FlatList, Modal, TouchableWithoutFeedback, ActivityIndicator, Alert } from "react-native";
import Slider from "@react-native-community/slider";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { API_BASE_URL } from '@env';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function HabitDetailScreen({ route, navigation }) {
    {/**세부습관 */ }
    //카테고리 영문화
    const { categoryType } = route.params;
    let convertedCategoryType;
    if (categoryType == "활동")
        convertedCategoryType = "ACTIVITY"
    else if (categoryType == "지적")
        convertedCategoryType = "INTELLIGENT"
    else
        convertedCategoryType = "ART"

    // 현재 날짜에서 월 가져오기 (1~12)
    const currentMonth = new Date().getMonth() + 1;

    // 세부 습관 (API 응답 데이터)
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);

    // 선택된 습관
    const [selectedHabit, setSelectedHabit] = useState(null);

    // 습관 데이터 가져오기
    useEffect(() => {
        const fetchHabits = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken");

                if (!token) {
                    Alert.alert("세션만료", "재로그인 해주십시요.");
                    navigation.navigate("Login");
                    return;
                }

                const response = await fetch(
                    `${API_BASE_URL}/habits/category-month?category=${convertedCategoryType}&month=${currentMonth}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                const data = await response.json();
                if (response.ok) {
                    if (data.habits.length === 0) {
                        Alert.alert(
                            "알림",
                            "이번 달에 등록한 세부습관이 없습니다.",
                            [
                                { text: "확인", onPress: () => navigation.goBack() }
                            ],
                            { cancelable: false }
                        );
                    } else {
                        setHabits(data.habits);
                    }
                } else {
                    console.error("API 응답 오류:", data);
                }
            } catch (error) {
                console.error("습관 데이터 가져오기 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHabits();
    }, [categoryType, currentMonth]);

    {/**습관 시간 */ }
    const [time, setTime] = useState(() => {
        const initialTime = new Date();
        initialTime.setHours(0); // 시간 0 설정
        initialTime.setMinutes(0); // 분 0 설정
        return initialTime;
    });
    const [showPicker, setShowPicker] = useState(false);

    const onChange = (event, selectedTime) => {
        const currentDate = selectedTime;
        setShowPicker(true);
        setTime(currentDate); // 선택된 시간 저장
    };

    {/**성취 만족도 */ }
    const [satisfaction, setSatisfaction] = useState(50);
    // 동적 스타일 함수 (3색 분기)
    const dynamicTextColor = (satisfaction) => {
        if (satisfaction == 100) {
            return { color: '#55d406' }
        }
        else if (satisfaction >= 75) {
            return { color: '#FF9730' };
        } else if (satisfaction >= 50) {
            return { color: 'black' };
        } else {
            return { color: '#a8b7a8' };
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

            <View style={styles.containerRecord}>

                {/**카테고리명 */}
                <View style={styles.categoryName}>
                    <Text style={styles.categoryNameText}>{categoryType}</Text>
                </View>

                {/**세부습관 */}
                <View style={styles.detailHabitCon}>
                    <View style={styles.labels}>
                        <Text style={styles.labelsText}>세부습관</Text>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#FF9730" />
                    ) : (
                        <FlatList
                            data={habits}
                            keyExtractor={(item) => item.habit_id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.detailHabitButton,
                                        selectedHabit === item.detail && styles.selectedButton,
                                    ]}
                                    onPress={() => setSelectedHabit(item.detail)}
                                >
                                    <Text style={styles.contentText}>{item.detail}</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={<Text style={styles.contentText}>세부습관이 없습니다.</Text>}
                            style={styles.scrollView}
                        />
                    )}
                </View>


                {/**습관 시간*/}
                <View style={styles.habitTimeCon}>
                    <View style={styles.labels}>
                        <Text style={styles.labelsText}>습관시간</Text>
                    </View>

                    <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.timeButton}>
                        <View>
                            <Text style={styles.contentText} >{time.getHours()}시간 {time.getMinutes()}분</Text>
                        </View>
                    </TouchableOpacity>

                    {
                        Platform.OS === 'android' && showPicker && (
                            <DateTimePicker
                                value={time}
                                mode="time"
                                display="spinner"
                                themeVariant="light"
                                is24Hour={true}
                                onChange={(event, selectedTime) => {
                                    if (selectedTime) {
                                        setTime(selectedTime);
                                    }
                                    setShowPicker(false);
                                }}
                            ></DateTimePicker>
                        )
                    }

                    {
                        Platform.OS === 'ios' && (
                            <Modal
                                visible={showPicker}
                                transparent={true}
                                animationType="slide"
                                onRequestClose={() => setShowPicker(false)}
                            >
                                <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
                                    <View style={styles.modalContainer}>
                                        <View style={styles.pickerContainer}>
                                            <DateTimePicker
                                                value={time}
                                                mode="time"
                                                locale="en-GB"
                                                display="spinner"
                                                themeVariant="light"
                                                onChange={(event, selectedTime) => {
                                                    if (selectedTime) {
                                                        setTime(selectedTime);
                                                    }
                                                    setShowPicker(false);
                                                }} />
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                            </Modal>
                        )
                    }


                </View>


                {/**성취만족도 */}
                <View style={styles.satisfactionCon}>
                    <View style={styles.labels}>
                        <Text style={styles.labelsText}>성취만족도 </Text>
                        <Text style={[dynamicTextColor(satisfaction), styles.labelsText]}>{satisfaction}</Text>
                    </View>

                    <Slider
                        thumbTintColor="black"
                        minimumTrackTintColor="#FF9730" // 최소 트랙 색상
                        maximumTrackTintColor="#ddd"
                        minimumValue={1}
                        maximumValue={100}
                        step={5}
                        value={satisfaction}
                        onValueChange={(value) => setSatisfaction(value)
                        }
                    />

                </View>

                {/**기록하기 버튼*/}
                <View style={styles.recordCon}>
                    <TouchableOpacity
                        style={styles.recordButton}
                        onPress={() => {
                            if (selectedHabit) {
                                navigation.navigate('HabitCheck', {
                                    categoryName: categoryType,
                                    detailedHabit: selectedHabit,
                                    habitTime: `${time.getHours()}시간 ${time.getMinutes()}분`,
                                    satisfaction: satisfaction,
                                });
                            } else {
                                alert('세부습관을 선택해주세요!');
                            }

                        }}>
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
        backgroundColor: "#FF9730"
    },
    backButton: {
        marginTop: SCREEN_HEIGHT * 0.06,
        marginLeft: SCREEN_WIDTH * 0.06,
        // backgroundColor: 'pink'
    },
    containerRecord: {
        flex: 1,
        backgroundColor: "#FFF5DA",
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50
        , padding: SCREEN_HEIGHT * 0.04,
        marginTop: SCREEN_HEIGHT * 0.03,
    },





    //in containerRecord
    categoryName: {
        flex: 0.1,
        marginBottom: SCREEN_HEIGHT * 0.03,
        // backgroundColor: 'yellow',
    },
    // labels: {
    //     // backgroundColor: 'green',

    // },
    detailHabitCon: {
        flex: 0.5,
        marginBottom: SCREEN_HEIGHT * 0.03,
    },
    habitTimeCon: {
        flex: 0.3,
        marginBottom: SCREEN_HEIGHT * 0.03,
        // backgroundColor: 'skyblue'
    },
    satisfactionCon: {
        flex: 0.3,
        marginBottom: SCREEN_HEIGHT * 0.03,
        // backgroundColor: 'orange'
    },
    recordCon: {
        flex: 0.2,
        justifyContent: 'center',
        // backgroundColor: 'skyblue'
    },

    //in detailHabitCon
    scrollView: {
        maxHeight: SCREEN_HEIGHT * 0.15
    },


    //in habitTimeCon
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 배경
    },
    pickerContainer: {
        width: SCREEN_WIDTH * 0.8,
        backgroundColor: '#FFF5DA',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
    },

    //button
    detailHabitButton: {
        backgroundColor: "#FFC387",
        opacity: 0.8,
        padding: SCREEN_HEIGHT * 0.02,
        marginVertical: SCREEN_HEIGHT * 0.01,
        borderRadius: 20,
        alignItems: "center",
    },
    selectedButton: {
        backgroundColor: "#FF8000", // 선택된 버튼 스타일
    },
    recordButton: {
        backgroundColor: "black",
        padding: SCREEN_HEIGHT * 0.02,
        borderRadius: 30,
        alignItems: "center",
    },
    timeButton: {
        backgroundColor: "#FFC387",
        opacity: 0.8,
        padding: SCREEN_HEIGHT * 0.02,
        marginVertical: SCREEN_HEIGHT * 0.01,
        borderRadius: 20,
        alignItems: "center",
    },
    timeModalButton: {
        backgroundColor: "black",
        width: "100%",
        borderRadius: 20,
        padding: 12,
    },

    //text
    categoryNameText: {
        fontSize: SCREEN_WIDTH * 0.075,
        fontWeight: 'bold'
    },
    labelsText: {
        fontSize: SCREEN_WIDTH * 0.05,
        fontWeight: 'bold'
    },
    recordText: {
        fontSize: SCREEN_WIDTH * 0.05,
        fontWeight: 'bold',
        color: 'white'
    },
    contentText: {
        fontSize: SCREEN_WIDTH * 0.05,
    },
    modalText: {
        fontSize: SCREEN_WIDTH * 0.05,
        color: 'white',
        alignSelf: 'center'
    }

});
