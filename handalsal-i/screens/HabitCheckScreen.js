import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function HabitCheckScreen({ route, navigation }) {
    const { categoryName, detailedHabit, habitTime, satisfaction } = route.params;

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
                <View style={styles.mainTitleCon}>
                    <Text style={styles.mainTitleText}>기록할 내용을 확인해주세요</Text>
                </View>

                <View style={styles.categoryNameCon}>
                    <View style={styles.card}>
                        <Text style={styles.labelsText}>카테고리명</Text>
                        <Text style={styles.contentText}> {categoryName}</Text>
                    </View>
                </View>

                <View style={styles.detailedHabitNameCon}>
                    <View style={styles.card}>
                        <Text style={styles.labelsText}>세부습관</Text>
                        <Text style={styles.contentText}>{detailedHabit}</Text>
                    </View>
                </View>

                <View style={styles.timeCon}>
                    <View style={styles.card}>
                        <Text style={styles.labelsText}>습관 시간</Text>
                        <Text style={styles.contentText}>{habitTime}</Text>
                    </View>
                </View>

                <View style={styles.satisfactionCon}>
                    <View style={styles.card}>
                        <Text style={styles.labelsText}>성취 만족도</Text>
                        <Text style={styles.contentText}>{satisfaction}</Text>
                    </View>
                </View>

                <View style={styles.recordCon}>
                    <TouchableOpacity
                        style={styles.recordButton}
                        onPress={() => {
                            navigation.navigate("MainScreen")
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
