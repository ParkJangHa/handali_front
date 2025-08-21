import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from '@env';
import { characterImageMap } from "../utils/characterImageMap";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

export default function HabitCategoryScreen({ navigation }) {
  const [selectedType, setSelectedType] = useState(null); // ← 제네릭 제거
  const [imageSource, setImageSource] = useState(require("../assets/character/default_character.png"));
  const [loading, setLoading] = useState(false);

  const getImageSource = () => {
    switch (selectedType) {
      case "활동":
        return require('../assets/activityLogo.png');
      case "지능":
        return require('../assets/intelligenceLogo.png');
      case "예술":
        return require('../assets/artLogo.png');
      default:
        return imageSource;
    }
  };

  const fetchImage = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/handalis/view`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 412) {
        Alert.alert("세션 만료", "로그인이 만료되었습니다. 다시 로그인해주세요.", [
          { text: "확인", onPress: async () => {
            await AsyncStorage.removeItem("authToken");
            navigation.navigate("Login");
          }}
        ]);
        return;
      }

      if (response.status === 404) {
        Alert.alert("한달이가 존재하지 않습니다.", "메인화면으로 이동합니다.", [
          { text: "확인", onPress: () => navigation.navigate("MainScreen") }
        ]);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setImageSource(
          characterImageMap[data.handali_img] ?? require("../assets/character/default_character.png")
        );
        console.log("습관 기록 화면, 이미지 호출:", data.handali_img);
      }
    } catch (error) {
      console.error("이미지 호출 실패:", error);
    }
  }, [navigation]);

  useEffect(() => { fetchImage(); }, [fetchImage]);

  const resetTodayRecords = useCallback(async () => {
    if (loading) return;
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      const res = await fetch(`${API_BASE_URL}/habits/record-delete`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });

      if (res.status === 412) {
        Alert.alert("세션 만료", "다시 로그인해 주세요.", [
          { text: "확인", onPress: async () => {
            await AsyncStorage.removeItem("authToken");
            navigation.navigate("Login");
          }}
        ]);
        return;
      }

      if (res.ok) {
        Alert.alert("완료", "오늘 기록이 초기화되었습니다.\n(스탯 값은 유지됩니다.)");
        await fetchImage();
      } else {
        const text = await res.text().catch(() => "");
        Alert.alert("실패", `초기화 중 오류가 발생했어요.\n${res.status} ${text}`);
      }
    } catch (e) {
      Alert.alert("네트워크 오류", e?.message ?? "다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }, [loading, navigation, fetchImage]);

  const onLongPressCharacter = useCallback(() => {
    if (selectedType !== null) return; // 선택 중일 땐 초기화 막기 (원하면 제거)
    Alert.alert(
      "오늘 기록 초기화",
      "오늘 입력한 모든 습관 기록이 삭제됩니다.\n(스탯 값은 그대로 유지)",
      [
        { text: "취소", style: "cancel" },
        { text: "초기화", style: "destructive", onPress: resetTodayRecords },
      ]
    );
  }, [selectedType, resetTodayRecords]);

  return (
    <View style={styles.container}>
      <View style={styles.backButton}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require('../assets/backButton.png')} />
        </TouchableOpacity>
      </View>

      <View style={styles.containerTop}>
        {selectedType === null ? (
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>오늘 뭐했어요?</Text>
            <View style={styles.speechTriangle} />
          </View>
        ) : null}

        <Pressable
          onLongPress={onLongPressCharacter}
          delayLongPress={500}
          disabled={loading}
          style={[
            selectedType === null && { position: "absolute", top: wp("25%"), left: wp("30%"), zIndex: -1 },
          ]}
        >
          <Image
            source={getImageSource()}
            style={[styles.categoryImage, selectedType === null && { width: hp("30%"), height: hp("30%") }]}
            resizeMode="contain"
          />
        </Pressable>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator />
          </View>
        )}
      </View>

      <View style={styles.containerBottom}>
        <View style={styles.todayHabitRecord}>
          <Text style={styles.recordTitle}>오늘 습관 기록</Text>
        </View>

        <View style={styles.habitCategories}>
          <TouchableOpacity style={[styles.button, selectedType === "활동" && styles.selectedButton]} onPress={() => setSelectedType("활동")}>
            <Text style={[styles.buttonText, selectedType === "활동" && styles.selectedText]}>활 동</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, selectedType === "지능" && styles.selectedButton]} onPress={() => setSelectedType("지능")}>
            <Text style={[styles.buttonText, selectedType === "지능" && styles.selectedText]}>지 능</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, selectedType === "예술" && styles.selectedButton]} onPress={() => setSelectedType("예술")}>
            <Text style={[styles.buttonText, selectedType === "예술" && styles.selectedText]}>예 술</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.selectView}>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => selectedType ? navigation.navigate("HabitDetail", { categoryType: selectedType }) : Alert.alert("알림", "하나의 카테고리를 선택해주세요!")}
          >
            <Text style={styles.selectButtonText}>선택하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFE98A" },
  backButton: { marginTop: hp("6%"), marginLeft: wp("6%") },
  containerTop: { flex: 1, alignItems: "center", justifyContent: "center" },
  containerBottom: {
    flex: 1.3, backgroundColor: "#76D6F4",
    borderTopLeftRadius: 50, borderTopRightRadius: 50,
    paddingTop: hp("4%"), paddingLeft: hp("5%"), paddingRight: hp("5%"),
  },
  speechBubble: {
    position: "absolute", top: hp("8%"), left: wp("30%"),
    backgroundColor: "white", borderRadius: 15, padding: wp("2%"),
    width: wp("60%"), alignItems: "center",
  },
  speechTriangle: {
    position: "absolute", bottom: -15, left: "50%", marginLeft: -5,
    width: 0, height: 0,
    borderLeftWidth: 10, borderRightWidth: 10, borderTopWidth: 15,
    borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: "white",
  },
  categoryImage: { width: hp("25%"), height: hp("25%") },
  todayHabitRecord: { flex: 0.4 },
  habitCategories: { flex: 3, alignItems: "center", justifyContent: "center" },
  selectView: { flex: 1.5, alignItems: "center", justifyContent: "center" },
  button: {
    backgroundColor: "white", opacity: 0.8, padding: hp("2%"),
    marginVertical: hp("1%"), borderRadius: 20, width: "100%", alignItems: "center",
  },
  selectedButton: { backgroundColor: "#3076f7" },
  selectButton: {
    backgroundColor: "#FFE98A", padding: hp("2.3%"),
    borderRadius: 30, width: "100%", alignItems: "center",
  },
  recordTitle: { fontSize: wp("5%"), fontFamily: "Jua-Regular" },
  buttonText: { fontSize: wp("4.9%"), fontFamily: "Jua-Regular" },
  selectButtonText: { fontSize: wp("4.9%"), color: "black", fontFamily: "Jua-Regular" },
  speechText: { fontSize: wp("4.5%"), color: "black", fontFamily: "Jua-Regular" },
  selectedText: { fontFamily: "Jua-Regular" },
  loadingOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center", justifyContent: "center",
  },
});
