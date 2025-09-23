import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, TouchableWithoutFeedback, Platform, Alert, ScrollView, TextInput, KeyboardAvoidingView, Keyboard  } from "react-native";
import Slider from "@react-native-community/slider";
import DateTimePicker from "@react-native-community/datetimepicker";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import BottomNav from "../components/BottomNav";

const categoryThemes = {
    '활동': {
        themeImage: require('../assets/record/activity_w.png'),
        backgroundColor: 'rgba(194,227,255,0.8)', 
        buttonColor: 'rgba(81,127,255,0.5)',
    },
    '지능': {
        themeImage: require('../assets/record/intelligence_w.png'),
        backgroundColor: '#D1FFCD', 
        buttonColor: 'rgba(81,255,185,0.7)',
    },
    '예술': {
        themeImage: require('../assets/record/art_w.png'),
        backgroundColor: 'rgba(255,224,201,0.8)', 
        buttonColor: 'rgba(255,143,81,0.5)',
    }
};

export default function HabitDetailScreen({ route, navigation }) {
    const { categoryType } = route.params;
    const selectedHabitFromRoute = route.params?.selectedHabit;

    const theme = categoryThemes[categoryType] || categoryThemes['활동'];

    const [selectedHabit, setSelectedHabit] = useState(null);
    const [satisfaction, setSatisfaction] = useState(50);
    const [showPicker, setShowPicker] = useState(false);
    const [time, setTime] = useState(() => {
        const initialTime = new Date();
        initialTime.setHours(0);
        initialTime.setMinutes(0);
        return initialTime;
    });
    const [comment, setComment] = useState("");
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
            const keyboardDidShowListener = Keyboard.addListener(
                'keyboardDidShow',
                () => setKeyboardVisible(true) 
            );
            const keyboardDidHideListener = Keyboard.addListener(
                'keyboardDidHide',
                () => setKeyboardVisible(false) 
            );

            return () => {
                keyboardDidHideListener.remove();
                keyboardDidShowListener.remove();
            };
        }, []);
    // SelectHabitScreen에서 습관을 선택하고 돌아왔을 때 상태를 업데이트합니다.
    useEffect(() => {
        if (selectedHabitFromRoute) {
            setSelectedHabit(selectedHabitFromRoute);
        }
    }, [selectedHabitFromRoute]);

    const dynamicTextColor = (satisfaction) => {
        if (satisfaction === 100) return { color: '#00bc61' };
        if (satisfaction >= 75) return { color: '#3076f7' };
        if (satisfaction >= 50) return { color: 'black' };
        return { color: '#e1e4e1' };
    };

    return (
        <View style={styles.container}>
            {/* 상단 테마 영역 */}
            <View style={[styles.headerContainer]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Image source={require('../assets/record/back.png')} />
                </TouchableOpacity>
                <Image source={theme.themeImage} style={styles.themeImage} />
            </View>

            {/* 하단 정보 입력 패널 */}
            <View style={[styles.bottomSheet, { backgroundColor: theme.backgroundColor }]}>
                <Image source={require('../assets/record/header.png')} style={styles.panelHandle} />
                
                <ScrollView 
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: hp('22%') }}
                >
                {/* 1. 세부 습관 표시 */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.labelText}>세부습관</Text>
                        <View style={styles.displayBox}> 
                            <Text style={styles.contentText}>
                                {selectedHabit ? selectedHabit.detail : '습관을 선택해주세요'}
                            </Text>
                        </View>
                </View>
                {/* 2. 습관 시간 설정 */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.labelText}>습관시간</Text>
                    <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.displayBox}>
                        <Text style={styles.contentText}>{time.getHours()}시간 {time.getMinutes()}분</Text>
                    </TouchableOpacity>
                </View>

                {/* 3. 성취 만족도 설정 */}
                <View style={styles.sectionContainer}>
                    <View style={styles.satisfactionLabel}>
                        <Text style={styles.labelText}>성취만족도</Text>
                        <Text style={[styles.satisfactionValue, dynamicTextColor(satisfaction)]}>{satisfaction}</Text>
                    </View>
                    <Slider
                        thumbTintColor="#515151"
                        minimumTrackTintColor={theme.buttonColor}
                        maximumTrackTintColor="rgba(255,255,255,0.5)"
                        minimumValue={1}
                        maximumValue={100}
                        step={1}
                        value={satisfaction}
                        onValueChange={(value) => setSatisfaction(Math.round(value))}
                    />
                </View>
                 <View style={styles.sectionContainer}>
                        <Text style={styles.labelText}>한마디</Text>
                        <TextInput
                            style={styles.memoInput}
                            placeholder="오늘의 습관에 대한 코멘트를 남겨보세요. (선택)"
                            placeholderTextColor="#777"
                            value={comment}
                            onChangeText={setComment}
                            multiline={true} // 여러 줄 입력 가능하도록
                        />
                    </View>
                </ScrollView>

                {/* 기록하기 버튼 */}
                <TouchableOpacity
                    style={[
                            styles.recordButton, 
                            { backgroundColor: theme.buttonColor },
                            isKeyboardVisible ? styles.buttonKeyboardVisible : styles.buttonKeyboardHidden
                        ]}
                    onPress={() => {
                        if (time.getHours() === 0 && time.getMinutes() === 0) {
                            Alert.alert("알림", "습관 시간은 0시간 0분 이상으로 설정해야 합니다.");
                            return; // 함수를 여기서 중단
                        }
                        if (selectedHabit) {
                            navigation.navigate('HabitCheck', {
                                categoryName: categoryType,
                                detailedHabit: selectedHabit.detail,
                                habitTime: `${time.getHours()}시간 ${time.getMinutes()}분`,
                                satisfaction: satisfaction,
                            });
                        } else {
                            Alert.alert("알림", '세부습관을 선택해주세요!');
                        }
                    }}
                >
                    <Text style={styles.recordButtonText}>기록하기</Text>
                </TouchableOpacity>

                {/* DateTimePicker Modal (iOS용) */}
                { Platform.OS === 'ios' && (
                    <Modal visible={showPicker} transparent={true} onRequestClose={() => setShowPicker(false)}>
                        <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
                            <View style={styles.modalContainer}>
                                <View style={styles.pickerContainer}>
                                    <DateTimePicker
                                        value={time}
                                        mode="time"
                                        display="spinner"
                                        onChange={(event, selectedTime) => {
                                            if (selectedTime) setTime(selectedTime);
                                            setShowPicker(false);
                                        }}
                                    />
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                )}
                {/* DateTimePicker (Android용) */}
                { Platform.OS === 'android' && showPicker && (
                    <DateTimePicker
                        value={time}
                        mode="time"
                        display="spinner"
                        onChange={(event, selectedTime) => {
                            setShowPicker(false);
                            if (selectedTime) setTime(selectedTime);
                        }}
                    />
                )}
            </View>
            <View style={isKeyboardVisible ? { height: 0, overflow: 'hidden' } : {}}>
                <BottomNav navigation={navigation} mode="record" active="Record" />
            </View>
        </View>
    ); 
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    headerContainer: {
        height: hp('35%'),
        paddingTop: hp("6%"),
        paddingHorizontal: wp("6%"),
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        left: wp('6%'),
        top: hp('6%'),
        zIndex: 1,
    },
    themeImage: {
        width: wp('85%'),
        height: hp('22%'),
        resizeMode: 'contain',
        marginTop: hp('3%'),
    },
    bottomSheet: {
        flex: 1,
        marginTop: -hp("5%"), // 헤더와 겹치게 설정
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: wp("8%"),
    },
    panelHandle: {
        width: wp('22%'),
        height: hp('1%'),
        resizeMode: 'contain',
        alignSelf: 'center',
        marginTop: hp('1.5%'),
        marginBottom: hp('2%'),
    },
    sectionContainer: {
        marginBottom: hp('1.5%'),
    },
    labelText: {
        fontSize: wp("5%"),
        fontFamily: "Jua-Regular",
        color: '#000000',
        marginBottom: hp('1%'),
    },
    displayBox: {
        backgroundColor: "#FBFBFB",
        padding: hp("1.5%"),
        borderRadius: 20,
        alignItems: "center",
    },
    contentText: {
        fontSize: wp("4%"),
        fontFamily: "Jua-Regular",
        color: '#515151',
    },
    satisfactionLabel: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    satisfactionValue: {
        fontSize: wp("5%"),
        fontFamily: "Jua-Regular",
    },
    memoInput: {
        backgroundColor: "#FBFBFB",
        borderRadius: 20,
        padding: hp("1%"),
        fontSize: wp("4%"),
        fontFamily: "Jua-Regular",
        color: '#515151',
        minHeight: hp('1%'), // 최소 높이 지정
        textAlignVertical: 'top', // 안드로이드에서 텍스트가 위에서부터 시작
    },
    recordButton: {
        alignSelf: "center",
        width: wp("43%"),
        padding: hp("2%"),
        borderRadius: 30,
        alignItems: "center",
        marginTop: hp('2%'),   
        marginBottom: hp('2%'),
    },
    buttonKeyboardHidden: {
        bottom: hp('15%'), // 하단바가 있을 때의 위치 (위쪽)
    },
    buttonKeyboardVisible: {
        bottom: hp('0%'),  // 하단바가 없을 때의 위치 (아래쪽)
    },
    recordButtonText: {
        fontSize: wp("5%"),
        fontFamily: "Jua-Regular",
        color: '#2D5D6B',
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
});