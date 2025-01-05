import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";


export default function MainScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.ex}
                onPress={() => { navigation.navigate("HabitCategory") }}>
                <Text style={styles.text}>습관 기록</Text>

            </TouchableOpacity>
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center'
    },
    text: {
        justifyContent: 'center',
        alignContent: 'center',

    }
})