import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const resolveLocalAsset = (pathString) => {
  try {
    switch(pathString) {
      case 'warrior': return require('../assets/icons/warrior_badge.png');
      case 'cyber': return require('../assets/icons/cyber_grid.png');
      case 'xp': return require('../assets/icons/xp_elixir.png');
      case 'fire': return require('../assets/icons/fire_border.png');
      case 'lootbox': return require('../assets/icons/mystery_lootbox.png');
      case 'golden_aura': return require('../assets/icons/golden_aura.png');
      default: return null;
    }
  } catch (e) {
    return null;
  }
};

const FALLBACK_ICON = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60';

export default function ShopScreen() {
  const router = useRouter();

  const [fitCoins, setFitCoins] = useState(500);
  const [purchasedItems, setPurchasedItems] = useState(['default']);
  const [modalVisible, setModalVisible] = useState(false);
  const [unlockedItem, setUnlockedItem] = useState({ title: '', iconKey: '' });
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 12 });

  const breathingAnim = useRef(new Animated.Value(0)).current; 
  const fireBorderAnim = useRef(new Animated.Value(0)).current;
  const gradientLaserAnim = useRef(new Animated.Value(0)).current;
  const modalScaleAnim = useRef(new Animated.Value(0)).current;
  const sunburstRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.hours === 0 && prev.minutes === 0 && prev.seconds === 0) {
          clearInterval(timerInterval);
          return prev;
        }
        let s = prev.seconds - 1;
        let m = prev.minutes;
        let h = prev.hours;
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        return { hours: h, minutes: m, seconds: s };
      });
    }, 1000);

    Animated.loop(
      Animated.sequence([
        Animated.timing(breathingAnim, { toValue: 1, duration: 2200, useNativeDriver: false, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(breathingAnim, { toValue: 0, duration: 2200, useNativeDriver: false, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(fireBorderAnim, { toValue: 1, duration: 1500, useNativeDriver: false, easing: Easing.linear }),
        Animated.timing(fireBorderAnim, { toValue: 0, duration: 1500, useNativeDriver: false, easing: Easing.linear }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(gradientLaserAnim, { toValue: 1, duration: 2500, useNativeDriver: true, easing: Easing.linear })
    ).start();

    return () => clearInterval(timerInterval);
  }, []);

  const triggerRewardPopUp = (title, iconKey) => {
    setUnlockedItem({ title, iconKey });
    setModalVisible(true);
    modalScaleAnim.setValue(0);
    sunburstRotateAnim.setValue(0);

    Animated.parallel([
      Animated.timing(modalScaleAnim, { toValue: 1, duration: 450, easing: Easing.back(1.5), useNativeDriver: true }),
      Animated.loop(
        Animated.timing(sunburstRotateAnim, { toValue: 1, duration: 7000, easing: Easing.linear, useNativeDriver: true })
      )
    ]).start();
  };

  const padZero = (num) => String(num).padStart(2, '0');

  const cardScale = breathingAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] });
  const ambientHighlightOpacity = breathingAnim.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.45] });
  const dynamicFireBorderColor = fireBorderAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['#ff3300', '#ff9900', '#ff0055'] });
  const laserTranslateX = gradientLaserAnim.interpolate({ inputRange: [0, 1], outputRange: [-250, 450] });
  const sunburstSpin = sunburstRotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const shopItems = [
    { id: 'warrior', title: 'Warrior Title', cost: 150, key: 'warrior', desc: 'Unlocks the "Warrior" visual nameplate...' },
    { id: 'cyber_bg', title: 'Cyber-Grid Canv...', cost: 300, key: 'cyber', desc: 'Legitimately overrides your default...' },
    { id: 'xp_boost', title: '2X XP Elixir', cost: 100, key: 'xp', desc: 'Alters your dashboard calculations...' },
    { id: 'fire_border', title: 'Fire Border', cost: 200, key: 'fire', desc: 'Injects a high-impact crimson border...', isSpecialFireEffect: true },
  ];

  const handlePurchase = (id, cost, title, iconKey) => {
    if (purchasedItems.includes(id)) return;
    if (fitCoins >= cost) {
      setFitCoins(fitCoins - cost);
      setPurchasedItems([...purchasedItems, id]);
      triggerRewardPopUp(title, iconKey);
    }
  };

  return (
    <View style={styles.container}>
      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.sunburstContainer, { transform: [{ rotate: sunburstSpin }] }]}>
            <View style={styles.sunburstRay} />
            <View style={[styles.sunburstRay, { transform: [{ rotate: '45deg' }] }]} />
            <View style={[styles.sunburstRay, { transform: [{ rotate: '90deg' }] }]} />
            <View style={[styles.sunburstRay, { transform: [{ rotate: '135deg' }] }]} />
          </Animated.View>

          <Animated.View style={[styles.rewardCardFrame, { transform: [{ scale: modalScaleAnim }] }]}>
            <View style={styles.glowHalo} />
            <Text style={styles.unlockedRarityTag}>✨ ITEM UNLOCKED ✨</Text>
            <View style={styles.rewardIconOuterRing}>
              <Image source={resolveLocalAsset(unlockedItem.iconKey) || { uri: FALLBACK_ICON }} style={styles.modalRewardIcon} resizeMode="contain" />
            </View>
            <Text style={styles.unlockedItemTitle}>{unlockedItem.title}</Text>
            <Text style={styles.unlockedItemSubtext}>Added to inventory database. Ready to deploy.</Text>
            <TouchableOpacity style={styles.equipActionBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.equipBtnText}>EQUIP MODIFIER</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reward <Text style={{ color: '#e25c28' }}>Shop</Text></Text>
        <View style={styles.coinBadge}>
          <Text style={styles.coinEmoji}>🪙</Text>
          <Text style={styles.coinText}>{fitCoins} FitCoins</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.subtitle}>Unlock tactical functional modifiers, system thematic layout packs, and cosmetic identities using your calorie credits.</Text>

        <Animated.View style={[styles.flashSaleCard, { transform: [{ scale: cardScale }] }]}>
          <Animated.View style={[styles.cardBacklightHighlight, { opacity: ambientHighlightOpacity, backgroundColor: '#e25c28' }]} />
          <View style={styles.flashHeaderRow}>
            <View style={styles.flashLiveBadge}><Text style={styles.flashLiveText}>⚡ Flash Sale</Text></View>
            <Text style={styles.countdownText}>ENDS IN: <Text style={styles.timeHighlight}>{padZero(timeLeft.hours)} : {padZero(timeLeft.minutes)} : {padZero(timeLeft.seconds)}</Text></Text>
          </View>

          <View style={styles.flashBody}>
            <View style={styles.flashIconBox}>
              <Image source={resolveLocalAsset('lootbox') || { uri: FALLBACK_ICON }} style={styles.localIconImageLarge} resizeMode="contain" />
            </View>
            <View style={styles.flashDetails}>
              <Text style={styles.flashTitle}>Mystery Loot Box</Text>
              <Text style={styles.flashDesc}>Guaranteed Epic or Legendary cosmetic drop.</Text>
              <View style={styles.priceRow}>
                <Text style={styles.crossedPrice}>🪙 250</Text>
                <Text style={styles.activePrice}>🪙 99</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.claimButton, purchasedItems.includes('loot_box') && styles.ownedBtn]} 
            onPress={() => handlePurchase('loot_box', 99, 'Mystery Loot Box', 'lootbox')}
          >
            <Text style={styles.claimBtnText}>{purchasedItems.includes('loot_box') ? "CLAIMED" : "Claim Now"}</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.itemsGrid}>
          {shopItems.map((item) => {
            const isOwned = purchasedItems.includes(item.id);
            const imageSource = resolveLocalAsset(item.key);
            return (
              <Animated.View key={item.id} style={[styles.itemCardContainer, { transform: [{ scale: cardScale }] }]}>
                <Animated.View style={[styles.cardBacklightHighlight, { opacity: ambientHighlightOpacity, backgroundColor: item.isSpecialFireEffect ? '#ff3300' : '#e25c28' }]} />
                <Animated.View style={[styles.itemCard, item.isSpecialFireEffect ? { borderColor: dynamicFireBorderColor, borderWidth: 1.8 } : styles.standardBorder]}>
                  <View style={[styles.iconWrapper, item.isSpecialFireEffect && { backgroundColor: '#2d120a' }]}>
                    <Image source={imageSource || { uri: FALLBACK_ICON }} style={styles.localIconImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.itemDesc} numberOfLines={2}>{item.desc}</Text>
                  <TouchableOpacity style={[styles.purchaseBtn, isOwned && styles.ownedBtn]} onPress={() => handlePurchase(item.id, item.cost, item.title, item.key)}>
                    <View style={styles.btnInnerContent}>
                      {!isOwned && <Text style={styles.buttonCoinEmoji}>🪙 </Text>}
                      <Text style={styles.btnText}>{isOwned ? "OWNED" : `${item.cost}`}</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              </Animated.View>
            );
          })}
        </View>

        <Animated.View style={[styles.legendaryCard, { transform: [{ scale: cardScale }] }]}>
          <Animated.View style={[styles.cardBacklightHighlight, { opacity: ambientHighlightOpacity, backgroundColor: '#cca43b' }]} />
          <View style={styles.legendaryInnerFrame}>
            <Animated.View style={[styles.laserGlowBeam, { transform: [{ translateX: laserTranslateX }, { rotate: '25deg' }] }] } />
            <View style={styles.legendaryBadge}><Text style={styles.legendaryBadgeText}>✨ LEGENDARY ITEM</Text></View>
            <View style={styles.legendaryContent}>
              <View style={styles.legendaryLeft}>
                <Text style={styles.legendaryTitle}>Golden Aura VFX</Text>
                <Text style={styles.legendaryDesc}>Radiate an animated golden particles field on the global leaderboard.</Text>
              </View>
              <TouchableOpacity style={[styles.legendaryPurchaseBtn, purchasedItems.includes('golden_aura') && { borderColor: '#4a3d1d', backgroundColor: '#211a0d' }]} onPress={() => handlePurchase('golden_aura', 999, 'Golden Aura VFX', 'golden_aura')}>
                {purchasedItems.includes('golden_aura') ? (
                  <Text style={[styles.legendaryBtnText, { color: '#8c7f7a' }]}>OWNED</Text>
                ) : (
                  <>
                    <Text style={styles.legendaryCoinEmoji}>🪙</Text>
                    <Text style={styles.legendaryBtnText}>999</Text>
                    <Text style={styles.legendarySubText}>FitCoins</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0a08', paddingTop: 60 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(7, 5, 4, 0.92)', alignItems: 'center', justifyContent: 'center' },
  sunburstContainer: { position: 'absolute', width: 500, height: 500, alignItems: 'center', justifyContent: 'center', opacity: 0.2 },
  sunburstRay: { position: 'absolute', width: 90, height: 600, backgroundColor: '#ff9900' },
  rewardCardFrame: { backgroundColor: '#1b120f', width: '82%', borderRadius: 24, borderWidth: 2, borderColor: '#e25c28', padding: 24, alignItems: 'center' },
  glowHalo: { position: 'absolute', top: -2, bottom: -2, left: -2, right: -2, borderRadius: 24, borderWidth: 1, borderColor: '#fff', opacity: 0.15 },
  unlockedRarityTag: { color: '#ff9900', fontWeight: '900', fontSize: 13, letterSpacing: 2, marginBottom: 20 },
  rewardIconOuterRing: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#2b1912', borderWidth: 2, borderColor: '#e25c28', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalRewardIcon: { width: 90, height: 90 }, // Increased from 55 to occupy almost the entire ring
  unlockedItemTitle: { color: '#ffffff', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 8, letterSpacing: 0.5 },
  unlockedItemSubtext: { color: '#a39793', fontSize: 12, textAlign: 'center', lineHeight: 18, marginBottom: 28, paddingHorizontal: 10 },
  equipActionBtn: { backgroundColor: '#e25c28', width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  equipBtnText: { color: '#ffffff', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  backBtn: { padding: 4 },
  backArrow: { color: '#a39793', fontSize: 20, fontWeight: '600' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#ffffff', letterSpacing: 0.3 },
  coinBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#19110e', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#2e1e18' },
  coinEmoji: { fontSize: 14, marginRight: 5 },
  buttonCoinEmoji: { fontSize: 12 },
  coinText: { color: '#e25c28', fontWeight: '700', fontSize: 13 },
  scrollContainer: { paddingHorizontal: 16, paddingBottom: 40 },
  subtitle: { color: '#6e625e', fontSize: 13, lineHeight: 18, marginBottom: 24, fontWeight: '500' },
  flashSaleCard: { position: 'relative', marginBottom: 20, borderRadius: 16 },
  flashHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, zIndex: 3, paddingHorizontal: 16, paddingTop: 16 },
  flashLiveBadge: { backgroundColor: '#e25c2818', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  flashLiveText: { color: '#e25c28', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  countdownText: { color: '#6e625e', fontSize: 11, fontWeight: '700' },
  timeHighlight: { color: '#ffffff' },
  flashBody: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, zIndex: 3, paddingHorizontal: 16 },
  flashIconBox: { backgroundColor: '#261712', width: 64, height: 64, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14, borderWidth: 1, borderColor: '#3a2118' },
  flashDetails: { flex: 1 },
  flashTitle: { color: '#ffffff', fontSize: 16, fontWeight: '800', marginBottom: 2 },
  flashDesc: { color: '#8c7f7a', fontSize: 12, marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  crossedPrice: { color: '#544945', fontSize: 12, textDecorationLine: 'line-through', marginRight: 8, fontWeight: '600' },
  activePrice: { color: '#e25c28', fontSize: 18, fontWeight: '900' },
  claimButton: { backgroundColor: '#e25c28', marginHorizontal: 16, marginBottom: 16, paddingVertical: 12, borderRadius: 8, alignItems: 'center', zIndex: 3 },
  claimBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 14 },
  itemsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  itemCardContainer: { width: '48%', marginBottom: 16, position: 'relative' },
  cardBacklightHighlight: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16, zIndex: 1 },
  itemCard: { backgroundColor: '#140f0d', borderRadius: 16, padding: 16, alignItems: 'center', zIndex: 2 },
  standardBorder: { borderWidth: 1.5, borderColor: '#231915' },
  iconWrapper: { backgroundColor: '#1d1411', width: 68, height: 68, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 14 }, // Slightly expanded box space
  localIconImage: { width: 52, height: 52, borderRadius: 6 }, // Increased from 32 to fill almost the entire box
  localIconImageLarge: { width: 54, height: 54, borderRadius: 6 }, // Increased from 38 to fill flash sale box 
  itemTitle: { color: '#ffffff', fontWeight: '800', fontSize: 14, marginBottom: 6, textAlign: 'center' },
  itemDesc: { color: '#6e625e', fontSize: 11, textAlign: 'center', lineHeight: 15, marginBottom: 16, height: 30 },
  purchaseBtn: { width: '100%', paddingVertical: 8, borderRadius: 20, alignItems: 'center', borderWidth: 1.5, borderColor: '#e25c28' },
  ownedBtn: { backgroundColor: '#231915', borderColor: '#231915' },
  btnInnerContent: { flexDirection: 'row', alignItems: 'center' },
  btnText: { color: '#ffffff', fontWeight: '800', fontSize: 13 },
  legendaryCard: { position: 'relative', marginTop: 10, borderRadius: 16 },
  legendaryInnerFrame: { backgroundColor: '#19120f', borderWidth: 1.5, borderColor: '#cca43b55', borderRadius: 16, padding: 16, zIndex: 2, position: 'relative', overflow: 'hidden' },
  laserGlowBeam: { position: 'absolute', top: -100, bottom: -100, width: 45, backgroundColor: 'rgba(204, 164, 59, 0.28)', zIndex: 1 },
  legendaryBadge: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, zIndex: 2 },
  legendaryBadgeText: { color: '#cca43b', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  legendaryContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 },
  legendaryLeft: { flex: 1, paddingRight: 10 },
  legendaryTitle: { color: '#ffffff', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  legendaryDesc: { color: '#8c7f7a', fontSize: 12, lineHeight: 16 },
  legendaryPurchaseBtn: { backgroundColor: '#cca43b15', borderWidth: 1.5, borderColor: '#cca43b', borderRadius: 12, width: 76, height: 64, justifyContent: 'center', alignItems: 'center' },
  legendaryCoinEmoji: { fontSize: 14, marginBottom: 2 },
  legendaryBtnText: { color: '#ffffff', fontWeight: '900', fontSize: 14, lineHeight: 14 },
  legendarySubText: { color: '#cca43b', fontSize: 8, fontWeight: '700' },
});