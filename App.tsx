import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Keyboard,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const THEMES = {
  light: {
    bg: '#F0F7F4',
    card: '#FFFFFF',
    primary: '#0D9488',
    text: '#1E293B',
    subText: '#64748B',
    badge: '#CCFBF1',
    streakBg: '#FEF3C7',
    streakText: '#B45309',
  },
  dark: {
    bg: '#0F172A',
    card: '#1E293B',
    primary: '#2DD4BF',
    text: '#F8FAFC',
    subText: '#94A3B8',
    badge: '#134E4A',
    streakBg: '#451A03',
    streakText: '#FBBF24',
  },
};

export default function App() {
  const currentHour = new Date().getHours();
  const [isDark, setIsDark] = useState(currentHour < 6 || currentHour >= 19);
  const theme = isDark ? THEMES.dark : THEMES.light;

  const [waterIntake, setWaterIntake] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [streak, setStreak] = useState(0);
  const [isCompletedToday, setIsCompletedToday] = useState(false);
  const [history, setHistory] = useState<number[]>([]);

  const [customAmount, setCustomAmount] = useState('');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('2000');

  const plantScale = useRef(new Animated.Value(1)).current;

  const bouncePlant = () => {
    Animated.sequence([
      Animated.spring(plantScale, {
        toValue: 1.15,
        useNativeDriver: true,
      }),
      Animated.spring(plantScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const progressPercent = Math.min(
    100,
    Math.round((waterIntake / dailyGoal) * 100)
  );

  const getPlantState = () => {
    if (progressPercent === 0) {
      return {
        emoji: '🥀',
        title: 'Toprağı Kurumuş',
        message: 'Bitkin susuz kaldı, ona biraz su ver!',
        opacity: 0.85,
        tilt: '-8deg',
      };
    }
    if (progressPercent < 30) {
      return {
        emoji: '🌱',
        title: 'Minik Filiz',
        message: 'Harika başlangıç! Toprağı nemlendi.',
        opacity: 0.95,
        tilt: '-3deg',
      };
    }
    if (progressPercent < 65) {
      return {
        emoji: '🪴',
        title: 'Genç Bitki',
        message: 'Yaprakları canlanıyor, böyle devam et!',
        opacity: 1,
        tilt: '0deg',
      };
    }
    if (progressPercent < 100) {
      return {
        emoji: '🌷',
        title: 'Tomurcuklandı',
        message: 'Neredeyse hedefine ulaştın, çiçek açmak üzere!',
        opacity: 1,
        tilt: '0deg',
      };
    }
    return {
      emoji: '🌺',
      title: 'Çiçek Açtı!',
      message: 'Tebrikler! Günlük su hedefini tamamladın!',
      opacity: 1,
      tilt: '0deg',
    };
  };

  const plant = getPlantState();

  const addWater = (amount: number) => {
    const nextIntake = waterIntake + amount;

    setHistory((prev) => [...prev, waterIntake]);
    setWaterIntake(nextIntake);
    bouncePlant();

    if (nextIntake >= dailyGoal && !isCompletedToday) {
      setStreak((prev) => prev + 1);
      setIsCompletedToday(true);
      Alert.alert(
        '🌺 Hedef Tamamlandı!',
        'Bitkin çiçek açtı ve günlük su serin +1 arttı!'
      );
    }
  };

  const undoLastWater = () => {
    if (history.length === 0) return;
    const previousIntake = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setWaterIntake(previousIntake);

    if (previousIntake < dailyGoal && isCompletedToday) {
      setStreak((prev) => Math.max(0, prev - 1));
      setIsCompletedToday(false);
    }
  };

  const resetWater = () => {
    if (isCompletedToday) {
      setStreak((prev) => Math.max(0, prev - 1));
      setIsCompletedToday(false);
    }
    setHistory([]);
    setWaterIntake(0);
  };

  const handleAddCustom = () => {
    const amount = parseInt(customAmount, 10);
    if (!isNaN(amount) && amount > 0 && amount <= 5000) {
      addWater(amount);
      setCustomAmount('');
      Keyboard.dismiss();
    }
  };

  const handleSaveGoal = () => {
    const newGoal = parseInt(goalInput, 10);
    if (!isNaN(newGoal) && newGoal >= 500 && newGoal <= 10000) {
      setDailyGoal(newGoal);
      if (waterIntake >= newGoal && !isCompletedToday) {
        setStreak((prev) => prev + 1);
        setIsCompletedToday(true);
      } else if (waterIntake < newGoal && isCompletedToday) {
        setStreak((prev) => Math.max(0, prev - 1));
        setIsCompletedToday(false);
      }
    }
    setIsEditingGoal(false);
    Keyboard.dismiss();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Üst Başlık, Seri Rozeti ve Tema Butonu */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.subText }]}>
            {isDark ? 'İyi akşamlar 🌙' : 'Günaydın ☀️'}
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>SuBitkim</Text>
        </View>

        <View style={styles.headerRight}>
          <View
            style={[styles.streakBadge, { backgroundColor: theme.streakBg }]}
          >
            <Text style={[styles.streakText, { color: theme.streakText }]}>
              🔥 {streak} Gün
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.themeButton, { backgroundColor: theme.card }]}
            onPress={() => setIsDark(!isDark)}
            activeOpacity={0.7}
          >
            <Text style={styles.themeIcon}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* İnteraktif Sanal Bitki Kartı */}
      <TouchableOpacity
        style={[styles.plantCard, { backgroundColor: theme.card }]}
        onPress={bouncePlant}
        activeOpacity={0.9}
      >
        <Animated.View
          style={[
            styles.plantCircle,
            {
              backgroundColor: theme.badge,
              opacity: plant.opacity,
              transform: [{ scale: plantScale }, { rotate: plant.tilt }],
            },
          ]}
        >
          <Text style={styles.plantEmoji}>{plant.emoji}</Text>
        </Animated.View>

        <Text style={[styles.plantTitle, { color: theme.text }]}>
          {plant.title}
        </Text>
        <Text style={[styles.plantMessage, { color: theme.subText }]}>
          {plant.message}
        </Text>
      </TouchableOpacity>

      {/* Su İlerleme Çubuğu ve Hedef Düzenleme */}
      <View style={[styles.progressCard, { backgroundColor: theme.card }]}>
        <View style={styles.progressHeader}>
          {isEditingGoal ? (
            <View style={styles.goalEditRow}>
              <TextInput
                style={[
                  styles.goalInput,
                  { color: theme.text, borderColor: theme.primary },
                ]}
                value={goalInput}
                onChangeText={setGoalInput}
                keyboardType="numeric"
                maxLength={5}
              />
              <TouchableOpacity
                style={[styles.goalSaveBtn, { backgroundColor: theme.primary }]}
                onPress={handleSaveGoal}
              >
                <Text style={styles.goalSaveText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.goalRow}
              onPress={() => {
                setGoalInput(String(dailyGoal));
                setIsEditingGoal(true);
              }}
            >
              <Text style={[styles.progressText, { color: theme.text }]}>
                {waterIntake} / {dailyGoal} ml ✏️
              </Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.percentText, { color: theme.primary }]}>
            %{progressPercent}
          </Text>
        </View>

        <View style={[styles.barBg, { backgroundColor: theme.badge }]}>
          <View
            style={[
              styles.barFill,
              {
                backgroundColor: theme.primary,
                width: `${progressPercent}%` as `${number}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Hazır Bardak Seçenekleri */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        💧 Su Ekle
      </Text>

      <View style={styles.cupsGrid}>
        <TouchableOpacity
          style={[styles.cupButton, { backgroundColor: theme.card }]}
          onPress={() => addWater(150)}
          activeOpacity={0.75}
        >
          <Text style={[styles.cupEmoji, { color: theme.primary }]}>✓</Text>
          <Text style={[styles.cupAmount, { color: theme.primary }]}>
            +150 ml
          </Text>
          <Text style={[styles.cupLabel, { color: theme.subText }]}>
            Küçük Bardak
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cupButton, { backgroundColor: theme.card }]}
          onPress={() => addWater(200)}
          activeOpacity={0.75}
        >
          <Text style={[styles.cupEmoji, { color: theme.primary }]}>✓✓</Text>
          <Text style={[styles.cupAmount, { color: theme.primary }]}>
            +200 ml
          </Text>
          <Text style={[styles.cupLabel, { color: theme.subText }]}>
            Su Bardağı
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cupButton, { backgroundColor: theme.card }]}
          onPress={() => addWater(330)}
          activeOpacity={0.75}
        >
          <Text style={[styles.cupEmoji, { color: theme.primary }]}>✓✓✓</Text>
          <Text style={[styles.cupAmount, { color: theme.primary }]}>
            +330 ml
          </Text>
          <Text style={[styles.cupLabel, { color: theme.subText }]}>
            Küçük Şişe
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cupButton, { backgroundColor: theme.card }]}
          onPress={() => addWater(500)}
          activeOpacity={0.75}
        >
          <Text style={[styles.cupEmoji, { color: theme.primary }]}>✓✓✓✓</Text>
          <Text style={[styles.cupAmount, { color: theme.primary }]}>
            +500 ml
          </Text>
          <Text style={[styles.cupLabel, { color: theme.subText }]}>
            Büyük Şişe
          </Text>
        </TouchableOpacity>
      </View>

      {/* Özel Miktar Girişi */}
      <View style={styles.customRow}>
        <TextInput
          style={[
            styles.customInput,
            {
              backgroundColor: theme.card,
              borderColor: theme.badge,
              color: theme.text,
            },
          ]}
          value={customAmount}
          onChangeText={setCustomAmount}
          placeholder="Özel miktar (örn: 250)"
          placeholderTextColor={theme.subText}
          keyboardType="numeric"
          maxLength={4}
        />
        <TouchableOpacity
          style={[styles.customAddBtn, { backgroundColor: theme.primary }]}
          onPress={handleAddCustom}
          activeOpacity={0.8}
        >
          <Text style={styles.customAddText}>+ Ekle</Text>
        </TouchableOpacity>
      </View>

      {/* Geri Al ve Sıfırla Butonları */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: theme.card,
              opacity: history.length === 0 ? 0.5 : 1,
            },
          ]}
          onPress={undoLastWater}
          disabled={history.length === 0}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionText, { color: theme.text }]}>
            ↩️ Geri Al
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.badge }]}
          onPress={resetWater}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionText, { color: theme.subText }]}>
            🔄 Günü Sıfırla
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 56,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '800',
  },
  greeting: {
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 2,
  },
  themeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  themeIcon: {
    fontSize: 20,
  },
  plantCard: {
    marginTop: 24,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  plantCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  plantEmoji: {
    fontSize: 68,
  },
  plantTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  plantMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  progressCard: {
    marginTop: 16,
    borderRadius: 20,
    padding: 18,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 15,
    fontWeight: '700',
  },
  percentText: {
    fontSize: 15,
    fontWeight: '800',
  },
  barBg: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 10,
  },
  cupsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  cupButton: {
    width: '48%',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  cupEmoji: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 6,
  },
  cupAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  cupLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalInput: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 14,
    fontWeight: '700',
    minWidth: 75,
  },
  goalSaveBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  goalSaveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  customRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  customInput: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  customAddBtn: {
    borderRadius: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customAddText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },
});