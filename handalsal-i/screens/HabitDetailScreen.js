import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, FlatList, Modal,TouchableWithoutFeedback } from "react-native";
import Slider from "@react-native-community/slider";
import DateTimePicker from "@react-native-community/datetimepicker";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function HabitDetailScreen({ route, navigation }) {
    //카테고리
    const { categoryType } = route.params;

    //세부습관
    const [habits, setHabits] = useState([{ habit_id: 1, detailed_habit_name: '헬스장 가기' },
    { habit_id: 2, detailed_habit_name: '매일 30분 걷기' },
    { habit_id: 3, detailed_habit_name: '스트레칭 하기' },
    { habit_id: 4, detailed_habit_name: '명상 10분' },
    { habit_id: 5, detailed_habit_name: '요가 연습' },
    ]);
    // const [habits, setHabits] = useState();
    const [selectedHabit, setSelectedHabit] = useState(null);

    // 습관시간기록
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

    //만족도
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

                <View style={styles.categoryName}>
                    <Text style={styles.categoryNameText}>{categoryType}</Text>
                </View>

                <View style={styles.detailHabitCon}>
                    <View style={styles.labels}>
                        <Text style={styles.labelsText}>세부습관</Text>
                    </View>

                    <View>
                        <FlatList
                            data={habits}
                            keyExtractor={(item, index) => index.toString()} // 고유 key로 index 사용
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.detailHabitButton,
                                    selectedHabit === item.detailed_habit_name && styles.selectedButton]}
                                    onPress={() => {
                                        setSelectedHabit(item.detailed_habit_name)
                                    }}>
                                    <Text style={styles.contentText}>{item.detailed_habit_name}</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text style={styles.contentText}>세부습관이 없습니다.</Text>
                            }
                            // contentContainerStyle={styles.scrollContent}
                            style={styles.scrollView} //한번에 몇개씩 보일지
                        />
                    </View>


                </View>


                <View style={styles.habitTimeCon}>
                    <View style={styles.labels}>
                        <Text style={styles.labelsText}>습관시간</Text>
                    </View>

                    <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.timeButton}>
                        <View>
                            <Text style={styles.contentText} >{time.getHours()}시간 {time.getMinutes()}분</Text>
                        </View>
                    </TouchableOpacity>

                    <Modal
                        visible={showPicker}
                        transparent={true} // 배경을 투명하게
                        animationType="slide"
                        onRequestClose={() => setShowPicker(false)} // 안드로이드 뒤로가기 지원
                    >
                    {/* 🛠 모달 바깥을 터치하면 닫히도록 설정 */}
                        <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
                            <View style={styles.modalContainer}>
                                    {/* 🛠 DateTimePicker */}
                                    <DateTimePicker
                                        value={time}
                                        mode="time"
                                        locale="en-GB"
                                        display="spinner"
                                        onChange={(event, selectedTime) => {
                                            if (selectedTime) setTime(selectedTime); // 선택된 시간 저장
                                            setShowPicker(false); // 선택 후 모달 닫기
                                        }}
                                    />
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>

                </View>



                <View style={styles.satisfactionCon}>
                    <View style={styles.labels}>
                        <Text style={styles.labelsText}>성취만족도 </Text>
                        <Text style={[dynamicTextColor(satisfaction), styles.labelsText]}>{satisfaction}</Text>
                    </View>

                    <Slider
                        thumbTintColor="black"
                        minimumTrackTintColor="#FF9730" // 최소 트랙 색상
                        maximumTrackTintColor="#ddd"
                        minimumValue={0}
                        maximumValue={100}
                        step={5}
                        value={satisfaction}
                        onValueChange={(value) => setSatisfaction(value)
                        }
                    />

                </View>

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
