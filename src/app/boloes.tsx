import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavBar from '../components/NavBar';
import { PlusCircle, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface Bolao {
  id: string;
  name: string;
  participants: number;
  status: 'ativo' | 'finalizado';
}

const BolaoScreen = () => {
  const [baloes, setBaloes] = useState<Bolao[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [newBolaoName, setNewBolaoName] = useState('');

  const loadBaloes = async () => {
    setLoading(true);
    try {
      const json = await AsyncStorage.getItem('@baloes');
      if (json) {
        setBaloes(JSON.parse(json));
      } else {
        setBaloes([]);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar bolões');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBaloes();
  }, []);

  const saveBaloes = async (newList: Bolao[]) => {
    try {
      await AsyncStorage.setItem('@baloes', JSON.stringify(newList));
      setBaloes(newList);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar bolões');
    }
  };

  const createBolao = () => {
    if (!newBolaoName.trim()) {
      Alert.alert('Aviso', 'Informe o nome do bolão');
      return;
    }
    const newBolao: Bolao = {
      id: String(Date.now()),
      name: newBolaoName.trim(),
      participants: 1,
      status: 'ativo',
    };
    const updatedList = [newBolao, ...baloes];
    saveBaloes(updatedList);
    setNewBolaoName('');
    setModalVisible(false);
  };

  const deleteBolao = (id: string) => {
    Alert.alert('Excluir bolão', 'Tem certeza que deseja excluir este bolão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          const updatedList = baloes.filter(b => b.id !== id);
          await saveBaloes(updatedList);
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-[#282725]">
      {/* Cabeçalho */}
      <View className="flex-row items-center px-4 pt-12 pb-6 border-b border-[#3d3d3d]">
        <Text className="text-white text-lg font-bold flex-1 py-3">Bolões</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <PlusCircle size={28} color="#FF004D" />
        </TouchableOpacity>
      </View>

      <ScrollView className="px-4 py-4 flex-1">
        {loading ? (
          <Text className="text-white text-center mt-6">Carregando bolões...</Text>
        ) : baloes.length === 0 ? (
          <Text className="text-white text-center mt-6">Nenhum bolão criado.</Text>
        ) : (
          baloes.map((bolao) => (
            <View
              key={bolao.id}
              className="mb-4 rounded-xl bg-[#1f1f1f] p-4 border border-[#3d3d3d] shadow-md"
            >
              <Text className="text-white font-semibold text-lg mb-1">{bolao.name}</Text>
              <Text className="text-gray-400 mb-2">
                Participantes: {bolao.participants}
              </Text>
              <Text
                className={`font-semibold ${
                  bolao.status === 'ativo' ? 'text-[#FF004D]' : 'text-gray-500'
                }`}
              >
                {bolao.status === 'ativo' ? 'Ativo' : 'Finalizado'}
              </Text>

              {/* Ações */}
              <View className="flex-row mt-3 space-x-2 gap-4">
                <TouchableOpacity
                  onPress={() =>
                    router.push(`/palpites/${bolao.id}?name=${encodeURIComponent(bolao.name)}`)
                  }
                  className="flex-1 bg-[#FF004D] rounded-md py-2"
                >
                  <Text className="text-white text-center font-semibold">Palpites</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => deleteBolao(bolao.id)}
                  className="bg-red-700 px-4 rounded-md justify-center"
                >
                  <Text className="text-white font-bold">X</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal para criar bolão */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black bg-opacity-60 justify-center items-center px-6">
          <View className="bg-[#1f1f1f] w-full rounded-xl p-6 border border-[#3d3d3d]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white font-bold text-xl">Criar Bolão</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={28} color="#FF004D" />
              </TouchableOpacity>
            </View>

            <TextInput
              className="bg-[#282725] text-white rounded-md px-4 py-2 mb-4 border border-[#3d3d3d]"
              placeholder="Nome do bolão"
              placeholderTextColor="#666"
              value={newBolaoName}
              onChangeText={setNewBolaoName}
            />

            <TouchableOpacity
              className="bg-[#FF004D] rounded-md py-3"
              onPress={createBolao}
            >
              <Text className="text-white text-center font-semibold">Criar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <NavBar />
    </View>
  );
};

export default BolaoScreen;
