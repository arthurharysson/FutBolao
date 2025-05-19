import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";

const leagues = [
  { code: "BSA", name: "Brasileirão" },
  { code: "BL1", name: "Bundesliga" },
  { code: "FL1", name: "Ligue 1" },
  { code: "SA", name: "Serie A" },
];

export default function PalpitesScreen() {
  const [selectedLeague, setSelectedLeague] = useState(leagues[0].code);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [palpites, setPalpites] = useState<{ [matchId: string]: string }>({});

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://api.football-data.org/v4/competitions/${selectedLeague}/matches`,
        {
          headers: { "X-Auth-Token": "877483580c33490eb7d65f8c0cb96c8d" },
        }
      );

      const now = Date.now();
      const matchesNext48h = res.data.matches.filter((match: any) => {
        const matchTime = new Date(match.utcDate).getTime();
        return matchTime >= now && matchTime <= now + 48 * 60 * 60 * 1000;
      });

      setMatches(matchesNext48h);
    } catch (error) {
      console.error("Erro ao buscar jogos:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMatches();
  }, [selectedLeague]);

  const handleSelectPalpite = async (matchId: string, choice: string) => {
    const updated = { ...palpites, [matchId]: choice };
    setPalpites(updated);

    try {
      await AsyncStorage.setItem("palpites", JSON.stringify(updated));
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar o palpite.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#282725] px-4 pt-12">
      <Text className="text-white text-xl font-bold mb-4">Escolha a Liga</Text>

      <View className="bg-[#3b3b3b] rounded-xl mb-6 px-4">
        <Picker
          selectedValue={selectedLeague}
          onValueChange={(itemValue) => setSelectedLeague(itemValue)}
          dropdownIconColor="white"
          style={{ color: "white" }}
        >
          {leagues.map((league) => (
            <Picker.Item
              key={league.code}
              label={league.name}
              value={league.code}
            />
          ))}
        </Picker>
      </View>

      <Text className="text-white text-lg font-bold mb-4">
        Jogos nas próximas 48h
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#FF004D" />
      ) : matches.length === 0 ? (
        <Text className="text-white">Nenhum jogo encontrado.</Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className="space-y-4 pb-10">
          {matches.map((match) => (
            <View
              key={match.id}
              className="bg-[#3b3b3b] p-4 rounded-2xl shadow-sm"
            >
              <Text className="text-white font-semibold text-base mb-1">
                {match.homeTeam.name} x {match.awayTeam.name}
              </Text>

              <Text className="text-gray-300 text-sm mb-3">
                {new Date(match.utcDate).toLocaleString()}
              </Text>

              <View className="bg-[#4f4f4f] rounded-lg px-2">
                <Picker
                  selectedValue={palpites[match.id] || ""}
                  onValueChange={(value) =>
                    handleSelectPalpite(match.id, value)
                  }
                  dropdownIconColor="white"
                  style={{ color: "white" }}
                >
                  <Picker.Item label="Escolha seu palpite" value="" />
                  <Picker.Item
                    label={`Vitória - ${match.homeTeam.name}`}
                    value="vitoria"
                  />
                  <Picker.Item label="Empate" value="empate" />
                  <Picker.Item
                    label={`Vitória - ${match.awayTeam.name}`}
                    value="derrota"
                  />
                </Picker>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
