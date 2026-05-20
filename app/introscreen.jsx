import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.9;
const SPACING = (width - CARD_WIDTH) / 2;

const data = [
  {
    id: "1",
    title: "Track your body",
    image: require("../assets/images/body1.png"),
  },
  {
    id: "2",
    title: "Improve strength",
    image: require("../assets/images/body2.png"),
  },
  {
    id: "3",
    title: "Reach your goals",
    image: require("../assets/images/body3.png"),
  },
  {
    id: "4",
    title: "Boost endurance",
    image: require("../assets/images/body4.png"),
  },
  {
    id: "5",
    title: "Stay consistent",
    image: require("../assets/images/body5.png"),
  },
];

export default function Index() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#ff6a00c5", "rgba(255, 213, 0, 0.66)"]} style={styles.header}>
        <Text style={styles.headerTitle}>FUEL YOUR AMBITION.</Text>
        <Text style={styles.headerSub}>Track your gains.</Text>
      </LinearGradient>

      <View style={styles.listContainer}>
        <Animated.FlatList
          data={data}
          horizontal
          pagingEnabled
          snapToAlignment="center"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveIndex(index);
          }}
          renderItem={({ item, index }) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const translateX = scrollX.interpolate({
              inputRange,
              outputRange: [-40, 0, 40],
              extrapolate: "clamp",
            });

            return (
              <View style={styles.carouselItem}>
                <View style={styles.card}>
                  <View style={styles.imageClipContainer}>
                    <Animated.View
                      style={[
                        styles.animatedImageWrapper,
                        { transform: [{ translateX }] },
                      ]}
                    >
                      <Image source={item.image} style={styles.cardImage} />
                    </Animated.View>
                  </View>
                </View>
                <Text style={styles.cardText}>{item.title}</Text>
              </View>
            );
          }}
        />
      </View>

      <View style={styles.dots}>
        {data.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, activeIndex === index && styles.activeDot]}
          />
        ))}+
      </View>

      <Text style={styles.tagline}>Your Choice, Your Growth</Text>

      <Pressable
        style={styles.signupBtn}
        onPress={() => router.push("/signup")}
      >
        <Text style={styles.signupText}>Sign Up For Free</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/login")}>
        <Text style={styles.login}>Log In</Text>
      </Pressable>

      <Text style={styles.logo}>
        Fit<Text style={{ color: "#f97316" }}>Choice</Text>
      </Text>
      <Text style={styles.version}>Version 1.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
  },
  header: {
    width: "100%",
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    color: "#fff",
    opacity: 0.8,
    fontSize: 21,
    fontWeight: "bold",
  },
  headerSub: {
    color: "#fff",
    fontSize: 16,
    opacity: 0.8,
  },
  listContainer: {
    height: 480,
  },
  carouselItem: {
    width: width,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: CARD_WIDTH,
    height: 420,
    backgroundColor: "#1e293b",
    borderRadius: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  imageClipContainer: {
    flex: 1,
    borderRadius: 25,
    overflow: "hidden",
  },
  animatedImageWrapper: {
    width: "115%",
    height: "100%",
    left: "-7.5%",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover", 
  },
  cardText: {
    color: "#fff",
    marginTop: 15,
    fontSize: 18,
    fontWeight: "600",
  },
  dots: {
    flexDirection: "row",
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: "#555",
    margin: 5,
  },
  activeDot: {
    backgroundColor: "#f97316",
    width: 20,
  },
  tagline: {
    color: "#fff",
    marginTop: 10,
    fontSize: 14,
    opacity: 0.7,
  },
  signupBtn: {
    backgroundColor: "#f97316",
    width: "80%",
    padding: 18,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
  },
  signupText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  login: {
    color: "#fff",
    marginTop: 15,
    fontSize: 16,
  },
  logo: {
    marginTop: 25,
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
  },
  version: {
    marginTop: 5,
    marginBottom: 20,
    fontSize: 10,
    color: "#aaa",
  },
});