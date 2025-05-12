import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, Dimensions, FlatList, Image } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from '@env';
import { characterImageMap } from "../utils/characterImageMap";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ApartScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false); // 모달 상태
  const [selectedData, setSelectedData] = useState(null); // 선택된 층의 데이터
  const [apartments, setApartments] = useState([]); //여러 아파트 데이터
  const [selectedApartIndex, setSelectedApartindex] = useState(0); //현재 선택된 동
  const flatListRef = useRef(null); //층 리스트 참조

  //api 호출
  const fetchApartments = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      const response = await fetch(`${API_BASE_URL}/apartments`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        }
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

      if (response.status === 404) {
        Alert.alert(
          "아파트 입주 이전 입니다.",
          "아파트에 입주한 한달이가 존재하지 않습니다.",
          [
            {
              text: "메인 화면으로 돌아가기",
              onPress: () => navigation.navigate('MainScreen'),
            }
          ],
          { cancelable: false }
        );
        return;
      }

      const textResponse = await response.text();
      console.log("📌 서버 응답 (텍스트):", textResponse);

      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (jsonError) {
        console.error("📌 JSON 파싱 오류:", jsonError);
        Alert.alert("데이터 오류", "서버에서 올바른 JSON 데이터를 받지 못했습니다.");
        return;
      }

      console.log("📌 서버 응답 (JSON 파싱 완료):", data);



      // ✅ 한달이가 있는 층을 저장하는 맵 생성 (apart_id별로 구분)
      const groupedApartments = {};
      data.forEach((item) => {
        if (!groupedApartments[item.apart_id]) {
          groupedApartments[item.apart_id] = {};
        }
        groupedApartments[item.apart_id][item.floor] = item;
      });

      console.log("📌 그룹화된 데이터:", groupedApartments);

      // ✅ 항상 12층을 유지하면서 데이터를 채우는 로직
      const formattedApartments = Object.keys(groupedApartments).map((apart_id) => {
        return {
          apart_id,
          floors: Array.from({ length: 12 }, (_, index) => {
            const floorNumber = 12 - index; //index=0~11

            return groupedApartments[apart_id][floorNumber] || {
              //층에 한달이가 없는 경우
              apart_id,
              floor: floorNumber,
              nickname: null,
              start_date: null,
              job_name: null,
              week_salary: null,
              image: null,
              locked: true,
            };
          }),
        };
      });

      console.log("📌 최종 정리된 아파트 데이터:", formattedApartments);
      setApartments(formattedApartments);

      //현재 연도에 해당하는 동이 존재하면 첫 화면에 표시
      const currentYear = new Date().getFullYear();
      const currentYearIndex = formattedApartments.findIndex(
        (apt) => apt.apart_id.toString().startsWith(currentYear.toString())
      );

      setSelectedApartindex(currentYearIndex !== -1 ? currentYearIndex : 0);

    } catch (error) {
      console.log("api 요청 실패", error);
    }
  };

  useEffect(() => {
    fetchApartments();
  }, []);


  {/*자동 스크롤---------------------------------*/ }
  // 현재 달(층)로 부드럽게 스크롤하는 함수
  const scrollToCurrentMonth = () => {
    if (flatListRef.current && apartments[selectedApartIndex]?.floors.length > 0) {
      // 현재 월을 기반으로 해당 층(인덱스) 찾기
      const currentMonthFloor = new Date().getMonth();
      const index = apartments[selectedApartIndex]?.floors.findIndex(item => item.floor === currentMonthFloor);
      if (index !== -1) {
        setTimeout(() => {
          flatListRef.current.scrollToIndex({ index, animated: true });
        }, 300);
      }
    }
  };

  // FlatList가 각 항목의 높이를 미리 알도록 설정
  const getItemLayout = (_, index) => ({
    length: SCREEN_HEIGHT * 0.3, // ✅ 각 아이템의 높이
    offset: SCREEN_HEIGHT * 0.3 * index, // ✅ 각 아이템의 위치
    index,
  });

  // 스크롤 실패 시 자동 재시도 (버그 방지)
  const onScrollToIndexFailed = (info) => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
    }, 500);
  };

  //아파트 화면이 열릴 때 해당 달(층)로 부드럽게 이동
  useFocusEffect(
    React.useCallback(() => {
      scrollToCurrentMonth();
    }, [apartments, selectedApartIndex])
  );
  {/*자동 스크롤---------------------------------*/ }

  {/**동 변경------------------------------------- */ }
  //이전 동으로 변경
  const handlePrevApart = () => {
    if (selectedApartIndex > 0) {
      setSelectedApartindex(selectedApartIndex - 1);
    }
  }

  //다음 동으로 변경
  const handleNextApart = () => {
    if (selectedApartIndex < apartments.length - 1) {
      setSelectedApartindex(selectedApartIndex + 1);
    }
  }
  {/**동 변경------------------------------------- */ }


  {/**한달이 이미지------------------------------------------ */ }
  // ✅ 이미지 파일명을 매핑하는 객체


  // ✅ 동적으로 이미지 파일을 가져오는 함수
  const getImageSource = (imageName) => {
    return characterImageMap[imageName] || require("../assets/character/0,0,0.png");
  };
  {/**한달이 이미지------------------------------------------ */ }

  return (
    <View style={styles.container}>
      {/**뒤로가기 버튼 */}
      <View style={styles.navContainer}>
        <View style={styles.backButton}>
          <TouchableOpacity
            onPress={() => { navigation.goBack() }}>
            <Image
              source={require('../assets/x.png')}>
            </Image>
          </TouchableOpacity>
        </View>
      </View>

      {/** 동 변경 버튼 */}
      <View style={styles.navContainer2}>
        <TouchableOpacity
          onPress={handlePrevApart}
          disabled={selectedApartIndex === 0}
          style={[styles.navButton,
          selectedApartIndex === 0 && styles.disabledButton]}>
          <Text style={styles.navButtonText}>&lt;</Text>
        </TouchableOpacity>

        <Text style={styles.apartTitle}>{apartments.length > 0 ? `${apartments[selectedApartIndex].apart_id}동` : "불러오는 중"}</Text>

        <TouchableOpacity
          onPress={handleNextApart}
          disabled={selectedApartIndex === apartments.length - 1}
          style={[styles.navButton, selectedApartIndex === apartments.length - 1 ? styles.disabledButton : null]}
        >
          <Text style={styles.navButtonText}>&gt;</Text>
        </TouchableOpacity>

      </View>

      {/* 잠금 및 한달이 층 */}
      <FlatList
        ref={flatListRef}
        data={apartments[selectedApartIndex]?.floors || []}
        keyExtractor={(item) => item.floor.toString()}
        getItemLayout={getItemLayout} // ✅ 각 항목 높이 설정
        onScrollToIndexFailed={onScrollToIndexFailed} // ✅ 스크롤 실패 시 자동 재시도
        onContentSizeChange={scrollToCurrentMonth} // ✅ 처음 렌더링될 때 자동 스크롤
        ListHeaderComponent={ //아파트 꼭대기
          <View style={styles.rooftopColor}>
            <Image
              source={require("../assets/apartRoofTop.png")}
              style={styles.rooftopImage}
            />
          </View>
        }


        renderItem={({ item }) => (
          <TouchableOpacity //잠금인지 아닌지 판별
            style={styles.itemContainer}
            onPress={() => {
              if (item.nickname) {
                setSelectedData(item); //모달로 전달할 데이터
                setModalVisible(true);
              }
            }}
          >
            {item.nickname ? ( // ✅ 한달이가 있을 경우

              <View style={styles.floors}>
                <View style={styles.handaliTextCon}>
                  <Text style={styles.title}>{item.floor}층   {item.nickname}</Text>
                </View>
                <Image
                  style={styles.handaliImage}
                  source={getImageSource(item.image)}
                />

              </View>
            ) : ( // ✅ 한달이가 없을 경우

              <View style={styles.floors}>
                <Image
                  style={styles.lockIcon}
                  source={require("../assets/apartLock.png")}
                />

              </View>
            )}
            <View style={styles.lockLine}></View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent} // 스크롤을 부드럽게 유지

      />

      {/* 한달이 세부사항 모달 */}
      {selectedData && (
        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.detailContainer}>
              <Text style={styles.modalTitle}>{selectedData.floor}층</Text>
              <Text style={styles.modalText}>닉네임: {selectedData.nickname || "없음"}</Text>
              <Text style={styles.modalText}>시작일: {selectedData.start_date || "없음"}</Text>
              <Text style={styles.modalText}>직업명: {selectedData.job_name || "없음"}</Text>
              <Text style={styles.modalText}>주급: {selectedData.week_salary ? `${selectedData.week_salary} 코인` : "없음"}</Text>

              <TouchableOpacity
                onPress={() => setModalVisible(false)} // 모달 닫기
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "black"
  },

  navContainer: {
    justifyContent: "space-around",
    flexDirection: "row",
    backgroundColor: "#4f291b",
    padding: SCREEN_HEIGHT * 0.01,
    paddingTop: SCREEN_HEIGHT * 0.06,
  },
  navContainer2: {
    justifyContent: "space-around",
    flexDirection: "row",
    backgroundColor: "#4f291b",
    padding: SCREEN_HEIGHT * 0.04,
  },

  rooftopImage: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.5,
  },
  rooftopColor: {
    backgroundColor: '#A66E38'
  },
  itemContainer: {
    backgroundColor: '#FFE98A',
  },
  floors: {
    height: SCREEN_HEIGHT * 0.3,
  },
  lockIcon: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.3,
  },
  lockLine: {
    backgroundColor: "#684626",
    height: SCREEN_HEIGHT * 0.01,
  },
  handaliTextCon: {
    paddingLeft: SCREEN_WIDTH * 0.04,
    paddingTop: SCREEN_WIDTH * 0.04,
    // backgroundColor: 'red'
  },
  handaliImage: {
    width: SCREEN_WIDTH * 0.4,
    height: SCREEN_HEIGHT * 0.3,
    transform: [
      { translateY: -SCREEN_WIDTH * 0.1 },
    ],
    alignSelf: 'center',
  },

  backButton: {
    position: 'absolute', // 절대 위치 설정
    left: SCREEN_WIDTH * 0.06, // 왼쪽 끝에 배치
    top: SCREEN_HEIGHT * 0.04,
    zIndex: 1, // 다른 요소 위에 위치하도록 설정
  },
  navButton: {
    padding: 10,
    backgroundColor: "#FFE98A",
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: "white",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#FFE98A",
    width: "100%",
    padding: 10,
    borderRadius: 30,
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // 배경 어둡게
  },
  detailContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "left",
  },


  apartTitle: {
    fontSize: 24,
    // fontWeight: "bold",
    alignSelf: "center",
    color: "black",
    fontFamily: "Jua-Regular"
  },
  title: {
    fontSize: 25,
    // fontWeight: "bold",
    fontFamily: "Jua-Regular"
  },
  modalTitle: {
    fontSize: 20,
    // fontWeight: "bold",
    marginBottom: 10,
    fontFamily: "Jua-Regular"
  },
  modalText: {
    fontSize: 18,
    marginBottom: 5,
    fontFamily: "Jua-Regular"
  },
  closeButtonText: {
    color: "black",
    // fontWeight: "bold",
    alignSelf: "center",
    fontFamily: "Jua-Regular"
  },
  navButtonText: {
    color: "black",
    // fontWeight: "bold",
    fontFamily: "Jua-Regular"
  },

});

export default ApartScreen;
