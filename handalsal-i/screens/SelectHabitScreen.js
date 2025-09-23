import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from '@env';
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

export default function SelectHabitScreen({ route, navigation }) {
    const { categoryType } = route.params;
    const theme = categoryThemes[categoryType] || categoryThemes['활동'];

    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHabit, setSelectedHabit] = useState(null); // 사용자가 '선택'한 습관

    // 카테고리명 영문화 (기존과 동일)
    let convertedCategoryType;
    if (categoryType === "활동") convertedCategoryType = "ACTIVITY";
    else if (categoryType === "지능") convertedCategoryType = "INTELLIGENT";
    else convertedCategoryType = "ART";

    // API 호출 로직 (기존과 동일)
    useEffect(() => {
        const fetchHabits = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken");
                const currentMonth = new Date().getMonth() + 1;

                const response = await fetch(
                    `${API_BASE_URL}/habits/category-month?category=${convertedCategoryType}&month=${currentMonth}`,
                    {
                        method: "GET",
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.habits.length === 0) {
                        Alert.alert(`알림`, `이번 달에 ${categoryType}의 세부습관이 없습니다.`,
                            [{ text: "확인", onPress: () => navigation.goBack() }],
                            { cancelable: false }
                        );
                    } else {
                        setHabits(data.habits);
                    }
                } else {
                     console.error("API 응답 오류");
                }
            } catch (error) {
                console.error("습관 데이터 가져오기 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHabits();
    }, [categoryType]);

    // '다음으로' 버튼을 눌렀을 때 실행될 함수
    const confirmSelection = () => {
        if (selectedHabit) {
            // 선택한 습관 정보를 params에 담아 이전 화면으로 돌아갑니다.
            navigation.navigate('HabitDetail', { selectedHabit: selectedHabit, categoryType: categoryType });
        } else {
            // 습관을 선택하지 않았을 경우 알림
            Alert.alert("알림", "기록할 세부 습관을 선택해주세요.");
        }
    };

    return (
        <View style={styles.container}>
            {/* 상단 흰색 영역 */}
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Image source={require('../assets/record/back.png')} />
                </TouchableOpacity>
                <Image source={require('../assets/record/title.png')} style={styles.titleImage}  />
                <Image source={theme.themeImage} style={styles.themeImage} />
            </View>

            {/* 하단 카테고리별 테마 패널 (Bottom Sheet) */}
            <View style={[styles.bottomSheet, { backgroundColor: theme.backgroundColor }]}>
                 <Image source={require('../assets/record/header.png')} style={styles.header} />
                {loading ? (
                    <ActivityIndicator size="large" color="#FFFFFF" style={{ flex: 1 }}/>
                ) : (
                    <FlatList
                        data={habits}
                        keyExtractor={(item) => item.habit_id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.habitButton,
                                    // 선택된 항목의 배경색을 테마 버튼 색으로 변경
                                    selectedHabit?.habit_id === item.habit_id && { backgroundColor: theme.buttonColor }
                                ]}
                                // 이제 버튼을 누르면 '선택' 상태만 변경
                                onPress={() => setSelectedHabit(item)}
                            >
                                <Text style={[
                                    styles.habitText,
                                    selectedHabit?.habit_id === item.habit_id && { color: '#fff' }
                                ]}>
                                    {item.detail}
                                </Text>
                            </TouchableOpacity>
                        )}
                        style={styles.list}
                        // 버튼에 가려지지 않도록 리스트 하단에 공간 확보
                        contentContainerStyle={{ paddingBottom: hp('12%') }} 
                    />
                )}

                {/* '다음으로' 버튼 */}
                <TouchableOpacity
                    style={[styles.nextButton, { backgroundColor: theme.buttonColor }]}
                    onPress={confirmSelection}
                >
                    <Text style={styles.nextButtonText}>다음으로</Text>
                </TouchableOpacity>
            </View>
            <BottomNav navigation={navigation} mode="record" active="Record" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF", // 전체 기본 배경은 흰색
    },
    headerContainer: {
        paddingTop: hp("6%"),
        paddingHorizontal: wp("6%"),
        alignItems: "center",
    },
    backButton: {
        position: 'absolute',
        left: wp('6%'),
        top: hp('6%'),
    },
    titleImage: {
        width: wp('70%'),
        height: hp('20%'),
        resizeMode: 'contain',
        marginTop: hp("1%"),
    },
    themeImage: {
        width: wp('85%'),
        height: hp('18%'),
        resizeMode: 'contain',
        marginTop: -hp("4%"),
    },
    // 하단 패널 스타일
    bottomSheet: {
        flex: 1,
        marginTop: hp("1%"),
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: wp("8%"),
        paddingTop: hp("4%"),
        position: 'relative', // 버튼을 절대 위치로 두기 위함
    },
    header: {
        width: wp('22%'),
        height: hp('2%'),
        resizeMode: 'contain',
        alignSelf: 'center',
        top: -hp("3.3%"),
    },
    list: {
        flex: 1,
    },
    habitButton: {
        backgroundColor: "#FBFBFB",
        padding: hp("2.5%"),
        marginVertical: hp("1%"),
        borderRadius: 20,
        alignItems: "center",
    },
    habitText: {
        fontSize: wp("5%"),
        fontFamily: "Jua-Regular",
        color: '#515151'
    },
    // 다음으로 버튼 스타일
    nextButton: {
        position: "absolute", // 패널 하단에 고정
        width: wp("43%"),
        left: wp("28%"),
        bottom: hp('18%'),
        padding: hp("2%"),
        borderRadius: 30,
        alignItems: "center",
        justifyContent: 'center',
    },
    nextButtonText: {
        fontSize: wp("5%"),
        fontFamily: "Jua-Regular",
        color: '#2D5D6B',
    },
});