import React, { useState, useEffect, useRef} from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, Dimensions, FlatList, Image } from "react-native";
import { useFocusEffect } from '@react-navigation/native'; 

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ApartScreen = () => {
  const [modalVisible, setModalVisible] = useState(false); // 모달 상태
  const [selectedData, setSelectedData] = useState(null); // 선택된 층의 데이터
  const [data, setData] = useState([]); // 아파트 데이터
  const flatListRef = useRef(null); // FlatList 참조

  // **항상 12층 유지하는 기본 데이터 생성**
  const generateDefaultFloors = () => {
    return Array.from({ length: 12 }, (_, index) => {
      const floorNumber = 12 - index; // 아래에서부터 층 번호 설정
      return {
        apart_id: 1,
        floor: floorNumber,
        nickname: floorNumber === 1 ? "handa" : null, // 1층만 활성화
        start_date: floorNumber === 1 ? "2024-11-02" : null,
        job_name: floorNumber === 1 ? "개발자" : null,
        salary: floorNumber === 1 ? 600 : null,
        type_name: floorNumber === 1 ? "체력" : null,
        value: floorNumber === 1 ? "30.5" : null,
        locked: floorNumber !== 1, // 1층만 활성화, 나머지는 잠김
      };
    });
  };

  // **초기 데이터 설정**
  useEffect(() => {
    const floors = generateDefaultFloors();
    setData(floors);
  }, []);

  // **FlatList가 렌더링되면 즉시 1층이 보이도록 함**
  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  // **아파트 화면이 열릴 때 즉시 1층으로 이동**
  useFocusEffect(
    React.useCallback(() => {
      scrollToBottom();
    }, [data])
  );

  // 층 클릭 처리
  const handlePress = (item) => {
    if (item.locked) {
      Alert.alert("잠금 상태", "이 층은 잠겨 있습니다!");
    } else {
      setSelectedData(item);
      setModalVisible(true); // 모달 열기
    }
  };

  return (
    <View style={styles.container}>

    {/* 잠금 및 한달이 층 */}
      <FlatList
       ref={flatListRef}
       onContentSizeChange={() => {
        scrollToBottom(); 
      }}
        data={data}
        keyExtractor={(item) => item.floor.toString()}
        ListHeaderComponent={ //아파트 꼭대기
            <View style={styles.topBuilding}>
              <Image
                source={require("../assets/apartRoofTop.png")}
                style={styles.rooftopImage}
              />
            </View>
          }
        renderItem={({ item }) => (
          <TouchableOpacity //잠금인지 아닌지 판별
            style={item.locked ? styles.lockedContainer : styles.itemContainer}
            onPress={() => handlePress(item)}
          >
            {item.locked ? ( //잠금일 경우,
              <View>
                <Image
                  style={styles.lockIcon}
                  source={require("../assets/apartLock.png")}
                />
                <View style={styles.lockLine}></View>
              </View>

            ) : ( //잠금이 아닐 경우,
                <View>
                    <Text style={styles.title}>{item.floor}층   {item.nickname}</Text>
                    <Image
                  style={styles.handaliImage}
                  source={require("../assets/doctorHandali.png")}
                />
                </View>        
            )}
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
              <Text style={styles.modalText}>주급: {selectedData.salary ? `${selectedData.salary} 코인` : "없음"}</Text>
              <Text style={styles.modalText}>최고 스탯명: {selectedData.type_name || "없음"}</Text>
              <Text style={styles.modalText}>최고 스탯값: {selectedData.value || "없음"}</Text>

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
    marginTop: SCREEN_HEIGHT * 0.06,
    backgroundColor:'#F9D9B5'
  },
  topBuilding:{
    backgroundColor:'#878282',
    opacity:0.6
  },
  rooftopImage:{
    width: "100%",
  },

  itemContainer: {
    height:SCREEN_HEIGHT*0.3,
    backgroundColor: '#F9D9B5',
    padding:SCREEN_HEIGHT*0.02
  },
  lockedContainer: {
    // marginTop:0
  },
  lockIcon:{
    width:"100%",
    height:SCREEN_HEIGHT*0.3,
  },
  lockLine:{
    backgroundColor:"#684626",
    height: SCREEN_HEIGHT*0.01,
  },
  handaliImage:{
    width:SCREEN_WIDTH*0.4,
    height:SCREEN_HEIGHT*0.2,
    alignSelf: 'center',
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


  title: {
    fontSize: 25,
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
  },


  closeButton: {
    marginTop: 20,
    backgroundColor: "black",
    width: "100%",
    padding: 10,
    borderRadius: 30,
  },
});

export default ApartScreen;
