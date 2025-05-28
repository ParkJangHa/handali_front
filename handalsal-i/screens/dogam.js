import React from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const defaultDexList = [
  { id: "1", name: "default_character", image: require("../assets/character/default_character.png") },
  { id: "2", name: "image_0_0_1.png", image: require("../assets/character/0,0,1.png") },
  { id: "3", name: "image_0_0_2.png", image: require("../assets/character/0,0,2.png") },
  { id: "4", name: "image_0_0_3.png", image: require("../assets/character/0,0,3.png") },
  { id: "5", name: "image_0_0_4.png", image: require("../assets/character/0,0,4.png") },
  { id: "6", name: "shadow", image: require("../assets/character/shadow.png") },
  { id: "7", name: "shadow", image: require("../assets/character/shadow.png") },
  { id: "8", name: "shadow", image: require("../assets/character/shadow.png") },
  { id: "9", name: "shadow", image: require("../assets/character/shadow.png") },
  { id: "10", name: "shadow", image: require("../assets/character/shadow.png") },
  { id: "11", name: "shadow", image: require("../assets/character/shadow.png") },
  { id: "12", name: "shadow", image: require("../assets/character/shadow.png") },
  { id: "13", name: "shadow", image: require("../assets/character/shadow.png") },    
  { id: "14", name: "shadow", image: require("../assets/character/shadow.png") },
  { id: "15", name: "shadow", image: require("../assets/character/shadow.png") },
  { id: "16", name: "shadow", image: require("../assets/character/shadow.png") },
  { id: "17", name: "shadow", image: require("../assets/character/shadow.png") }, 
  { id: "18", name: "shadow", image: require("../assets/character/shadow.png") },
  { id: "19", name: "shadow", image: require("../assets/character/shadow.png") },
  { id: "20", name: "shadow", image: require("../assets/character/shadow.png") },
  { id: "21", name: "shadow", image: require("../assets/character/shadow.png") },
  { id: "22", name: "shadow", image: require("../assets/character/shadow.png") },    
  { id: "23", name: "shadow", image: require("../assets/character/shadow.png") },
  { id: "24", name: "shadow", image: require("../assets/character/shadow.png") },
  { id: "25", name: "shadow", image: require("../assets/character/shadow.png") },
  { id: "26", name: "shadow", image: require("../assets/character/shadow.png") }, 
  { id: "27", name: "shadow", image: require("../assets/character/shadow.png") },       
];

export default function DexScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <View style={styles.itemBox}>
      <Image source={item.image} style={styles.itemImage} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => { navigation.goBack() }}>
          <Image
            source={require('../assets/backButton.png')}>
          </Image>
        </TouchableOpacity>
        <Text style={styles.headerText}>도감</Text>
      </View>

      <View style={styles.twoheader}>
      <Image
            source={require('../assets/lock.png')} style={styles.lockicon}>
      </Image>
      <Text style={styles.lockText}>5 / 216</Text>
      </View>
      <FlatList
        data={defaultDexList}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.itemList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EAF1FA", },
  header: {
    flexDirection: "row",
    gap: wp("27%"),
    alignItems: "center",
    padding: wp("5%"),
    backgroundColor: "#B9D7F1",
  },
  twoheader: {
    flexDirection: "row",
    gap: wp("4%"),
    alignItems: "center",
    padding: wp("5%"),
    backgroundColor: "#EAF1FA",
  },
  lockicon: {
    marginLeft: wp("30%"),
  },
  headerText: {
    fontSize: wp("8%"),
    fontFamily: "Jua-Regular",
    color: "#002D73",
  },
  lockText: {
    fontSize: wp("5%"),
    fontFamily: "Jua-Regular",
    color: "#000000",
    marginTop: hp("1%")
  },
  itemList: {
    paddingHorizontal: wp("3%"),
    paddingBottom: hp("10%"),
  },
  itemBox: {
    width: wp("26%"),
    margin: wp("3%"),
    alignItems: "center",
  },
  itemImage: {
    width: wp("20%"),
    height: wp("20%"),
    resizeMode: "contain",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: wp("3%"),
  },
  itemName: {
    marginTop: wp("2%"),
    fontSize: wp("3.5%"),
    fontFamily: "Jua-Regular",
    textAlign: "center",
  },
});
