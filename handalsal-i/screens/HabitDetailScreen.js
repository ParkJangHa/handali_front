import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, Modal, TouchableWithoutFeedback, ActivityIndicator, Alert } from "react-native";
import Slider from "@react-native-community/slider";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { API_BASE_URL } from '@env';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function HabitDetailScreen({ route, navigation }) {

    const currentMonth = new Date().getMonth() + 1; // 현재 날짜에서 월 가져오기 (1~12)
    const [habits, setHabits] = useState([]); // 세부 습관 (API 응답 데이터)
    const [loading, setLoading] = useState(true); // api 응답 데이터가 로딩중인지 아닌지
    const [selectedHabit, setSelectedHabit] = useState(null); // 선택된 습관
    const [satisfaction, setSatisfaction] = useState(50); //성취만족도
    const [showPicker, setShowPicker] = useState(false); //습관 시간, datetimepicker
    const [time, setTime] = useState(() => {
        const initialTime = new Date();
        initialTime.setHours(0); // 시간 0 설정
        initialTime.setMinutes(0); // 분 0 설정
        return initialTime;
    });  //습관 시간

    //카테고리명 영문화
    const { categoryType } = route.params;
    let convertedCategoryType;
    if (categoryType == "활동")
        convertedCategoryType = "ACTIVITY"
    else if (categoryType == "지능")
        convertedCategoryType = "INTELLIGENT"
    else
        convertedCategoryType = "ART"

    // 만족도 3색 분기
    const dynamicTextColor = (satisfaction) => {
        if (satisfaction == 100) {
            return { color: '#00bc61' }
        }
        else if (satisfaction >= 75) {
            return { color: '#3076f7' };
        } else if (satisfaction >= 50) {
            return { color: 'black' };
        } else {
            return { color: '#e1e4e1' };
        }
    };

    // api 호출 
    const fetchHabits = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");

            const response = await fetch(
                `${API_BASE_URL}/habits/category-month?category=${convertedCategoryType}&month=${currentMonth}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

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
                if (data.habits.length === 0) {
                    Alert.alert(`알림`, `이번 달에 ${categoryType}의 세부습관이 없습니다.`,
                        [{ text: "확인", onPress: () => navigation.goBack() }],
                        { cancelable: false }
                    );
                } else {
                    setHabits(data.habits);
                    console.log("습관 : " + JSON.stringify(data.habits, null, 2));
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

    useEffect(() => {
        fetchHabits();
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
                        <ActivityIndicator size="large" color="#FF9730" /> // 로딩중임을 알리는 스피너
                    ) : (
                        <FlatList
                            data={habits}
                            keyExtractor={(item) => item.habit_id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.detailHabitButton, selectedHabit === item.detail && styles.selectedButton]}
                                    onPress={() => setSelectedHabit(item.detail)}
                                >
                                    <Text style={[styles.contentText, selectedHabit === item.detail && styles.selectedText]}>{item.detail}</Text>
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
                                                onChange={(event, selectedTime) => { //시간 또는 분이 바뀔 경우
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
                        minimumTrackTintColor="#3076f7" // 최소 트랙 색상
                        maximumTrackTintColor="white"
                        minimumValue={1}
                        maximumValue={100}
                        step={1}
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
                                Alert.alert("알림", '세부습관을 선택해주세요!', [{ text: "확인" }], { cancelable: false });
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
  container: {
    flex: 1,
    backgroundColor: "#FFE98A",
  },
  backButton: {
    marginTop: hp("6%"),
    marginLeft: wp("6%"),
  },
  containerRecord: {
    flex: 1,
    backgroundColor: "#76D6F4",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    padding: hp("4%"),
    marginTop: hp("3%"),
  },
  categoryName: {
    flex: 0.1,
    marginBottom: hp("3%"),
  },
  detailHabitCon: {
    flex: 0.5,
    marginBottom: hp("3%"),
  },
  habitTimeCon: {
    flex: 0.3,
    marginBottom: hp("3%"),
  },
  satisfactionCon: {
    flex: 0.3,
    marginBottom: hp("3%"),
  },
  recordCon: {
    flex: 0.2,
    justifyContent: "center",
  },

  scrollView: {
    maxHeight: hp("20%"),
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  pickerContainer: {
    width: wp("80%"),
    backgroundColor: "#fdfaeb",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },

  detailHabitButton: {
    backgroundColor: "white",
    opacity: 0.8,
    padding: hp("2%"),
    marginVertical: hp("1%"),
    borderRadius: 20,
    alignItems: "center",
  },
  selectedButton: {
    backgroundColor: "#3076f7",
  },
  recordButton: {
    backgroundColor: "#FFE98A",
    padding: hp("2%"),
    borderRadius: 30,
    alignItems: "center",
  },
  timeButton: {
    backgroundColor: "white",
    opacity: 0.8,
    padding: hp("2%"),
    marginVertical: hp("1%"),
    borderRadius: 20,
    alignItems: "center",
  },
  timeModalButton: {
    backgroundColor: "black",
    width: "100%",
    borderRadius: 20,
    padding: 12,
  },

  categoryNameText: {
    fontSize: wp("7.5%"),
    fontFamily: "Jua-Regular",
  },
  labelsText: {
    fontSize: wp("5%"),
    fontFamily: "Jua-Regular",
  },
  recordText: {
    fontSize: wp("5%"),
    color: "black",
    fontFamily: "Jua-Regular",
  },
  contentText: {
    fontSize: wp("5%"),
    fontFamily: "Jua-Regular",
  },
  modalText: {
    fontSize: wp("5%"),
    color: "white",
    alignSelf: "center",
    fontFamily: "Jua-Regular",
  },
  selectedText: {
    fontFamily: "Jua-Regular",
  },
});

