import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import LeagueCard from '../components/CardLeague';
import LeagueTableButton from '../components/LeagueTableButton';
import NavBar from '../components/NavBar';

const leagues = [
  { code: 'BSA', name: 'Brasileirão', flagUri: 'https://cdn-icons-png.flaticon.com/512/197/197386.png' },
  { code: 'BL1', name: 'Bundesliga', flagUri: 'https://cdn-icons-png.flaticon.com/512/197/197571.png' },
  { code: 'FL1', name: 'Ligue 1', flagUri: 'https://cdn-icons-png.flaticon.com/512/197/197560.png' },
  { code: 'SA', name: 'Serie A', flagUri: 'https://cdn-icons-png.flaticon.com/512/197/197626.png' },
];

const LeaguesScreen = () => {
  const [matchesByLeague, setMatchesByLeague] = useState<Record<string, any[]>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const router = useRouter();

const fetchMatches = async (leagueCode: string) => {
  try {
    setLoadingMap(prev => ({ ...prev, [leagueCode]: true }));

    const res = await axios.get(`https://api.football-data.org/v4/competitions/${leagueCode}/matches`, {
      headers: { 'X-Auth-Token': '877483580c33490eb7d65f8c0cb96c8d' },
    });

    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const validStatuses = ['SCHEDULED', 'TIMED', 'AVAILABLE'];

    const matches = res.data.matches.filter(match => {
      const matchDate = new Date(match.utcDate);
      return (
        validStatuses.includes(match.status) &&
        matchDate >= now &&
        matchDate <= twoDaysFromNow
      );
    });

    console.log(`📅 ${leagueCode} - Jogos nas próximas 48h (${validStatuses.join(', ')}):`, matches.map(m => ({
      date: m.utcDate,
      stage: m.stage,
      status: m.status,
      home: m.homeTeam.name,
      away: m.awayTeam.name
    })));

    setMatchesByLeague(prev => ({ ...prev, [leagueCode]: matches }));
  } catch (error) {
    console.error(`Erro ao buscar jogos da liga ${leagueCode}:`, error);
  } finally {
    setLoadingMap(prev => ({ ...prev, [leagueCode]: false }));
  }
};

  useEffect(() => {
    leagues.forEach(league => fetchMatches(league.code));
  }, []);

  return (
    <View className="flex-1 bg-[#282725]">
      <View className="flex-1 pt-16 px-4 justify-start items-center">
        <Text className="text-white text-xl font-bold mb-6">Próximos Jogos!</Text>

        <ScrollView className="w-full" contentContainerStyle={{ paddingBottom: 40 }}>
          {leagues.map(league => (
            <View key={league.code} className="mb-4">
              <LeagueCard
                leagueName={league.name}
                flagUri={league.flagUri}
                matches={matchesByLeague[league.code] || []}
                loading={loadingMap[league.code]}
              />
            </View>
          ))}

          {/* Seção de Tabela dos Jogos */}
          <View className="mt-6 w-full">
            <Text className="text-white text-lg font-bold mb-2">Tabela de Liderança</Text>

            {leagues.map(league => (
              <LeagueTableButton
                key={league.code}
                label={league.name}
                flagUri={league.flagUri}
                onPress={() => router.push(`/Tabelas/${league.code}`)} 
              />
            ))}
          </View>
        </ScrollView>
      </View>

      <NavBar />
    </View>
  );
};

export default LeaguesScreen;
