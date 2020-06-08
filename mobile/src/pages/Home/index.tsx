import React, { useState, useEffect } from 'react';
import { View, Text, Image, ImageBackground, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import Select from 'react-native-picker-select';

import axios from 'axios';

import styles from './styles';

const backgroundImage = require('../../assets/home-background.png');
const logo = require('../../assets/logo.png');

interface Option {
  label: string,
  value: string
}

interface IBGEUFResponse {
  sigla: string,
}

interface IBGECityResponse {
  nome: string,
}

const Home: React.FC = () => {
  const navigation = useNavigation();

  const [ufs, setUFs] = useState<Option[]>([]);
  const [selectedUf, setSelectedUf] = useState<string>('0');

  const [cities, setCities] = useState<Option[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');

  useEffect(() => {
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then((response) => {
      const ufOptions = response.data.map((uf) => ({ value: uf.sigla, label: uf.sigla }));
      setUFs(ufOptions);
    });
  }, []);

  useEffect(() => {
    if (selectedUf === '0') return undefined;

    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
      .then((response) => {
        const cityNames = response.data.map((uf) => ({ value: uf.nome, label: uf.nome }));
        setCities(cityNames);
      });

    return undefined;
  }, [selectedUf]);

  function validateCity() {
    return cities.find((city) => city.value === selectedCity) !== undefined
  }

  function handleNavigateToPoint() {
    if (!validateCity()) {
      Alert.alert('Cidade inválida', 'Certifique-se se a cidade está com acento e com maiúsculas certas.');
      return undefined;
    }
    navigation.navigate('Points', { uf: selectedUf, city: selectedCity });
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={ Platform.OS === 'ios' ? 'padding' : undefined }>
      <ImageBackground
        source={backgroundImage}
        style={styles.container}
        imageStyle={{ width: 274, height: 368 }}
      >
          <View style={styles.main}>
            <Image source={logo}/>
            <View>
              <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
              <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
            </View>
          </View>

          <View style={styles.footer}>              
            <View style={styles.select}>
              <Select
                style={{ placeholder: { color: '#000' } }}
                onValueChange={(value) => setSelectedUf(value)}
                placeholder={{ label: 'Selecione uma UF', value: '0', color: 'rgba(0, 0, 0, 0.5)' }}
                items={ufs}
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Digite a cidade"
              value={selectedCity}
              onChangeText={setSelectedCity}
            />

            <RectButton style={styles.button} onPress={handleNavigateToPoint}>
              <View style={styles.buttonIcon}>
                <Icon  name="arrow-right" color="#FFF" size={24} />
              </View>
              <Text style={styles.buttonText}>Entrar</Text>
            </RectButton>
          </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

export default Home;