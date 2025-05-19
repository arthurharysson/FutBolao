import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import NavBar from "../components/NavBar";

const leagues = [
  { code: "BSA", name: "Brasileirão" },
  { code: "BL1", name: "Bundesliga" },
  { code: "FL1", name: "Ligue 1" },
  { code: "SA", name: "Serie A" },
];

export default function ResultadosScreen() {
  const [selectedLeague, setSelectedLeague] = useState(leagues[0].code);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [palpites, setPalpites] = useState<{ [matchId: string]: string } | null>(null); // null = ainda não carregou

  // Carrega palpites do AsyncStorage
  const loadPalpites = async () => {
    try {
      const json = await AsyncStorage.getItem("palpites");
      if (json) {
        setPalpites(JSON.parse(json));
      } else {
        setPalpites({}); // vazio se não tem
      }
    } catch (e) {
      Alert.alert("Erro", "Não foi possível carregar os palpites.");
      setPalpites({});
    }
  };

  // Busca os jogos da liga selecionada — só se palpites não vazio
  const fetchMatches = async () => {
    if (!palpites || Object.keys(palpites).length === 0) {
      // Não busca se não tem palpites
      setMatches([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        `https://api.football-data.org/v4/competitions/${selectedLeague}/matches`,
        {
          headers: { "X-Auth-Token": "877483580c33490eb7d65f8c0cb96c8d" },
        }
      );
      setMatches(res.data.matches);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os jogos.");
      setMatches([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPalpites();
  }, []);

  useEffect(() => {
    // Só chama a busca de jogos se palpites estiver carregado
    if (palpites !== null) {
      fetchMatches();
    }
  }, [palpites, selectedLeague]);

  // Status do jogo
  function getMatchStatus(match: any) {
    const now = Date.now();
    const start = new Date(match.utcDate).getTime();
    const end = start + 2 * 60 * 60 * 1000; // 2h estimadas

    if (now < start) return "Não iniciado";
    if (now >= start && now <= end) return "Em andamento";
    return "Finalizado";
  }

  // Compara palpite com resultado da API
  function checkPalpite(match: any, palpite: string) {
    if (!match.score || !match.score.winner) return false;

    const winner = match.score.winner; // "HOME_TEAM", "AWAY_TEAM", "DRAW"

    if (
      (palpite === "vitoria" && winner === "HOME_TEAM") ||
      (palpite === "derrota" && winner === "AWAY_TEAM") ||
      (palpite === "empate" && winner === "DRAW")
    ) {
      return true;
    }
    return false;
  }

  if (palpites === null) {
    // Ainda carregando palpites, mostra loading
    return (
      <SafeAreaView className="flex-1 bg-[#282725] px-4 pt-14">
        <ActivityIndicator size="large" color="#FF004D" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#282725] px-4 pt-14">
      <Text className="text-white text-xl font-bold mb-6">Seus Resultados</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#FF004D" />
      ) : Object.keys(palpites).length === 0 ? (
        // Agora esse texto está dentro do <Text>, para evitar o erro
        <Text className="text-white">Você ainda não fez nenhum palpite.</Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className="space-y-4 pb-24">
          {matches
            .filter((m) => palpites[m.id])
            .map((match) => {
              const palpite = palpites[match.id];
              const status = getMatchStatus(match);
              const acertou = status === "Finalizado" && checkPalpite(match, palpite);

              if (acertou) {
                return (
                  <View
                    key={match.id}
                    className="bg-green-700 rounded-2xl p-4 shadow-sm"
                  >
                    <Text className="text-white font-semibold text-lg mb-2">
                      {match.homeTeam.name} {match.score.fullTime.home} x {match.score.fullTime.away} {match.awayTeam.name}
                    </Text>
                    <Text className="text-white text-base">Você acertou! 🎉</Text>
                  </View>
                );
              }

              return (
                <View
                  key={match.id}
                  className="bg-[#3b3b3b] rounded-2xl p-4 shadow-sm"
                >
                  <Text className="text-white font-semibold text-base mb-1">
                    {match.homeTeam.name} x {match.awayTeam.name}
                  </Text>
                  <Text className="text-gray-300 mb-2">{new Date(match.utcDate).toLocaleString()}</Text>
                  <Text className="text-white mb-1">Palpite: <Text className="font-semibold">{palpite}</Text></Text>
                  <Text className="text-white">Andamento: <Text className="font-semibold">{status}</Text></Text>
                </View>
              );
            })}
        </ScrollView>
      )}

      {/* Navbar fixa embaixo */}
      <View className="absolute bottom-0 left-0 right-0 bg-[#1E1E1E] border-t border-gray-700">
        <NavBar />
      </View>
    </SafeAreaView>
  );
}
