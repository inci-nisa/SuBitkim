import React, {useState, useRef} from 'react';
import{
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';

const THEMES ={
  light:{
    bg:'#F0F7F4',
    card:'#FFFFFF',
    primary: '#0D9488',
    text: '#1E293B',
    subText:'#64748B',
    badge: '#CCFBF1',
  },
  dark:{
    bg:'#F0F7F4',
    card:'#FFFFFF',
    primary:'#2DD4BF',
    text:'#F8FAFC',
    subText:'#94A3B8',
    badge:'#134E4A',
  },
};

export default function App(){
  const currentHour =new Date().getHours();
  const isNightTime = currentHour >= 19 || currentHour < 6;

  const [isDark,setIsDark] = useState<boolean>(isNightTime);
  const theme = isDark ? THEMES.dark : THEMES.light;

  const [waterIntake, setWaterIntake] = useState<number>(0);
  const [dailyGoal, setDailyGoal] = useState<number>(2000);

  const plantScale = useRef(new Animated.Value(1)).current;

  const bouncePlant =() => {
    Animated.sequence([
      Animated.spring(plantScale,{
        toValue:1.18,
        useNativeDriver:true,
      }),
      Animated.spring(plantScale,{
        toValue:1,
        friction:3,
        useNativeDriver:true,
      }),
    ]).start();
  };

  //günlük hedef yüzdesi
  const progressPercent = Math.min(
    Math.round((waterIntake / dailyGoal)*100),
    100
  );
  //su miktarına göre kuruma canlanma
  const getPlantState =() => {
    if (waterIntake===0){
      return{
        emoji:'🥀',
        tilt: '-18deg',
        opacity:0.75,
        title: 'Toprağı Kurumuş',
        message:'Bitkin susuzluktan boynunu büktü. Canlandırmak için su iç!',

      };

    } else if ( progressPercent < 35){
      return {
        emoji:'🌱',
        tilt :' 0deg',
        opacity: 1,
        title:'Canlanan Filiz',
        message:' İlk suyunu aldı!',
      };
    } else if (progressPercent < 70){
      return{
        emoji:'🪴',
        tilt:' 0deg',
        opacity:1,
        title:'Sağlıklı Bitki',
        message:'Kökleri güçleniyor, harika gidiyorsun!',
      };

    }else if (progressPercent<100){
      return{
        emoji:'🌷',
        tilt: '0deg',
        opacity:1,
        title:'Tomurcuklandı',
        message:'Hedefe çok az kaldı,çiçek açmak üzere!',

      };
    } else {
      return{
        emoji:'🌺',
        tilt:'0deg',
        opacity:1,
        title:'Çiçek Açtı!',
        message:'Günlük hedefine ulaştın,bitkin ışıldıyor!',
      };
    }
  };
  const plant= getPlantState();

  return(
    <View style={[styles.container, {backgroundColor: theme.bg}]}>
      <StatusBar barStyle ={isDark ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <View>
          <Text style= {[styles.greeting, {color: theme.subText}]}>
             {isDark ? 'İyi akşamlar 🌙' : 'Günaydın ☀️'}
             </Text>
             <Text style={[styles.title, {color: theme.text}]}>SuBitkim</Text>
             </View>

             <TouchableOpacity
             style={[styles.themeButton, {backgroundColor: theme.card}]}
             onPress= {()=> setIsDark(!isDark)}
             activeOpacity={0.7}>
              <Text style={styles.themeIcon}>{isDark ? '☀️' : '🌙'}</Text>
              </TouchableOpacity>
             </View> 
             </View>
  );
}

const styles = StyleSheet.create ({
  container: {
    flex: 1,
    paddingHorizontal:24,
    paddingTop: 60,
  },
  header:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
  },
  greeting:{
    fontSize:14,
    fontWeight:'600',
    marginBottom: 2,

  },
  title:{
    fontSize:28,
    fontWeight: '800',
  },
  themeButton:{
    width: 46,
    height:46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor:'#000',
    shadowOffset:{width:0, height:2},
    shadowOpacity: 0.1,
    shadowRadius:4,
  },
  themeIcon:{
    fontSize: 20,
  },
});