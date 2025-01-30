import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const JobScreen = ({ navigation }) => {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

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
                        <View style={styles.circleDate}><Text style={styles.circleHeaderText}>종료일. {formattedDate}</Text></View>
                    </View>

                    {/**이미지 */}
                    <View style={styles.imageContainer}><Image source={require('../assets/doctorHandali.png')} style={styles.handaliImage}></Image></View>

                    {/**구분선 */}
                    <View style={styles.line}></View>

                    {/**직업, 주급 */}
                    <View style={styles.jobCoin}>
                        <Text style={styles.nameText}>직업</Text>
                        <Text style={styles.valueText}>의사</Text>
                    </View>
                    <View style={styles.jobCoin}>
                        <Text style={styles.nameText}>주급</Text>
                        <Text style={styles.valueText}>120</Text>
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
    imageContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "70%",
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
        width: '70%',
        height: '90%',
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