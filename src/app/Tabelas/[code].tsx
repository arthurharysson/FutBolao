import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';


type TeamStanding = {
  position: number;
  team: { id: number; name: string; crest: string };
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  form: string;
};

const getColor = (result: string) => {
  switch (result) {
    case 'W': return 'bg-green-500';
    case 'D': return 'bg-orange-400';
    case 'L': return 'bg-red-600';
    default: return 'bg-gray-400';
  }
};

const toOrdinal = (n: number) => `${n}º`;

const LeagueTableScreen = () => {
  const router = useRouter();
  const { code } = useLocalSearchParams();
  const leagueCode = (code as string)?.toUpperCase() || '';

  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!leagueCode) return;

    const fetchStandings = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get(`https://api.football-data.org/v4/competitions/${leagueCode}/standings`, {
          headers: { 'X-Auth-Token': '877483580c33490eb7d65f8c0cb96c8d' },
        });

        const standingsData = res.data.standings.find((s: any) => s.type === 'TOTAL');
        setStandings(standingsData?.table || []);
      } catch (e) {
        console.error('Erro ao buscar tabela:', e);
        setError('Erro ao carregar tabela. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, [leagueCode]);

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">

      <View className="flex-1 pt-4 px-4">
         <TouchableOpacity onPress={() => router.back()} className="mb-4 flex-row items-center">
            <ArrowLeft color="white" size={20} />
            <Text className="text-white text-lg font-bold ml-2">Voltar</Text>
        </TouchableOpacity>

        <Text className="text-white text-2xl font-bold mb-6">
          Tabela - {leagueCode}
        </Text>

        {loading && <ActivityIndicator size="large" color="#FF004D" />}
        {error && <Text className="text-red-500 text-center my-4">{error}</Text>}

        {!loading && !error && (
          <ScrollView showsVerticalScrollIndicator={false}>
            {standings.map((team) => (
              <View
                key={team.team.id}
                className="bg-[#1F1F1F] rounded-lg p-4 mb-3 flex-row items-center justify-between"
              >
                <View className="flex-row items-center space-x-3 max-w-[50%]">
                  <Text className="text-white font-bold w-6">{toOrdinal(team.position)}</Text>
                  <Image source={{ uri: team.team.crest }} style={{ width: 24, height: 24 }} resizeMode="contain" />
                  <Text className="text-white text-sm ml-2 flex-shrink">{team.team.name}</Text>
                </View>

                <View className="items-end">
                  <Text className="text-white text-sm text-right mb-1">
                    J: {team.playedGames} / V: {team.won} / D: {team.lost} / E: {team.draw}
                  </Text>
                  <View className="flex-row space-x-1 justify-end">
                    {team.form?.split(',').slice(-5).map((result, index) => (
                      <View
                        key={index}
                        className={`w-4 h-4 rounded-sm ${getColor(result)}`}
                      />
                    ))}
                  </View>
                  <Text className="text-white font-bold text-right mt-1">P: {team.points}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default LeagueTableScreen;
