import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import * as Location from 'expo-location';

import api from '../../services/api';

import styles from './styles';

interface Item {
  id: number,
  title: string,
  image_url: string
}

interface Points {
  id: number,
  image: string,
  image_url: string,
  name: string,
  latitude: number,
  longitude: number,
  city: string,
  uf: string
}

interface Params {
  uf: string,
  city: string
}

const Points: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as Params;

  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [points, setPoints] = useState<Points[]>([]);

  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    api.get('/items').then((response) => {
      setItems(response.data.items);
    });
  }, []);

  useEffect(() => {
    async function loadPosition() {
      const { status } = await Location.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Ooooops...', 'Precisamos de sua permisão para obter sua localização');
        return undefined;
      }

      const location = await Location.getCurrentPositionAsync();

      const { latitude, longitude } = location.coords;

      setInitialPosition([ latitude, longitude ]);
    }

    loadPosition();
  }, []);

  useEffect(() => {
    api.get('/points', {
      params: {
        uf: params.uf,
        city: params.city,
        items: selectedItems
      }
    }).then((response) => {
      setPoints(response.data.points);
    });
  }, [selectedItems]);

  function handleNavigateToBack() {
    navigation.goBack();
  }

  function handleNavigateToDetail(id: number) {
    navigation.navigate('Detail', { pointId: id });
  }

  function handleSelectItem(id: number) {
    const alreadySelected = selectedItems.findIndex((item) => item === id);

    if (alreadySelected >= 0) {
      const filteredItem = selectedItems.filter((item) => item !== id);

      setSelectedItems(filteredItem);
    } else setSelectedItems([ ...selectedItems, id ]);
  }

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateToBack}>
          <Icon name="arrow-left" size={20} color="#34DC79" />
        </TouchableOpacity>

        <Text style={styles.title}>Bem vindo</Text>
        <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

        <View style={styles.mapContainer}>
          { initialPosition[0] !== 0 && (
            <MapView
            style={styles.map}
            initialRegion={{
              latitude: initialPosition[0],
              longitude: initialPosition[1],
              latitudeDelta: 0.014,
              longitudeDelta: 0.014,
            }}
          >            
            {points.map((point) => (
              <Marker
                key={String(point.id)}
                style={styles.mapMarker}
                coordinate={{ latitude: point.latitude, longitude: point.longitude }}
                onPress={() => { handleNavigateToDetail(point.id) }}
              >
                <View style={styles.mapMarkerContainer}>
                  <Image
                    style={styles.mapMarkerImage}
                    source={{ uri: point.image_url }}
                  />
                  <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                </View>
              </Marker>
            ))}
          </MapView>
          )}
        </View>
      </View>

      <View style={styles.itemsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {items.map((item) => (
            <TouchableOpacity
              key={String(item.id)}
              style={[
                styles.item,
                selectedItems.includes(item.id) ? styles.selectedItem : {}
              ]}
              onPress={() => { handleSelectItem(item.id); }}
              activeOpacity={0.5}
            >
              <SvgUri width={42} height={42} uri={item.image_url} />
              <Text style={styles.itemTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

export default Points;