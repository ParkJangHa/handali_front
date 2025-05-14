import { StyleSheet, Text, View, TouchableOpacity, Image,} from "react-native";
import React, { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from '@env';
import { characterImageMap } from "../utils/characterImageMap";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const JobScreen = ({ navigation }) => {
    //가장 마지막에 생성한 한달이를 가져옴
    const [nickname, setNickname] = useState();
    const [jobName, setJobName] = useState();
    const [salary, setSalary] = useState();
    const [startDate, setStartDate] = useState();
    const [imageSource, setImageSource] = useState(require("../assets/character/0,0,0.png"));
    // ✅ 이미지 파일명을 매핑하는 객체

    // ✅ 동적으로 이미지 파일을 가져오는 함수
    const setImageSourceByName = (imageName) => {
        const mapped = characterImageMap[imageName] || require("../assets/character/0,0,0.png");
        setImageSource(mapped);
    };

    //오늘 날짜
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

    // api 호출
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

                if (response.status === 409) {
                    Alert.alert(
                        "한달이가 존재하지 않습니다.",
                        "최근에 생성된 한달이가 존재하지 않습니다.",
                        [
                            {
                                text: "메인 화면으로 돌아가기",
                                onPress: () => navigation.navigate('MainScreen'), // ✅ 이전 화면으로 이동
                            }
                        ],
                        { cancelable: false }
                    );
                    return;
                }

                if (response.ok) {
                    const data1 = await response.json();
                    console.log("📌 한달이 ID 가져오기 성공:", data1);
                    setNickname(data1.nickname);
                    setJobName(data1.job_name);
                    setSalary(data1.salary);
                    setStartDate(data1.start_date);
                    setImageSourceByName(data1.image);

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
                    colors={["#feebe1", "#fdd7be", "#fdcfae", "#FFB08A",]} // 그라데이션 색상
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
    padding: hp("2%"),
    backgroundColor: "#FFE98A",
  },
  titleContainer: {
    marginTop: hp("7%"),
  },
  memoContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: -hp("2%"),
    marginBottom: hp("2%"),
  },
  handaliContainer: {
    alignItems: "center",
    marginBottom: hp("2%"),
  },
  circlerHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
  },
  nicknameContainer: {
    padding: hp("1%"),
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "60%",
  },
  jobCoin: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    paddingVertical: hp("1.5%"),
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center", 
  },
  circle: {
    width: wp("80%"),
    height: hp("60%"),
    backgroundColor: "#FDA44F",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp("3%"),
  },
  circleTitle: {
    backgroundColor: "#fcddd3",
    borderRadius: 10,
    height: hp("3%"),
    width: wp("20%"),
    alignItems: "center",
    justifyContent: "center",
  },
  circleDate: {
    alignItems: "center",
    justifyContent: "center",
  },
  handaliImage: {
    width: "90%",
    resizeMode: "contain",
  },
  line: {
    backgroundColor: "white",
    height: 1,
    width: "100%",
  },
  button: {
    backgroundColor: "#76D6F4",
    width: wp("80%"),
    paddingVertical: hp("2%"),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
  },

  // text styles
  dateText: {
    fontSize: wp("6%"),
    fontFamily: "Jua-Regular",
  },
  titleText: {
    fontSize: wp("6%"),
    fontFamily: "Jua-Regular",
  },
  memoText: {
    fontSize: wp("5%"),
    color: "#ff8851",
    fontFamily: "Jua-Regular",
  },
  circleHeaderText: {
    color: "#5A3A29",
  },
  nicknameText: {
    fontSize: wp("6%"),
    color: "#5A3A29",
    justifyContent: "center",
    fontFamily: "Jua-Regular",
  },
  nameText: {
    fontSize: wp("4.7%"),
    color: "white",
    fontFamily: "Jua-Regular",
  },
  valueText: {
    fontSize: wp("4.7%"),
    color: "#5A3A29",
    fontFamily: "Jua-Regular",
  },
  buttonText: {
    fontSize: wp("5%"),
    color: "#2D5D6B",
    fontFamily: "Jua-Regular",
  },
});


export default JobScreen;