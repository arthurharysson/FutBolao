import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ChevronDown, ChevronUp, Clock3 } from 'lucide-react-native';
import NavBar from '../components/NavBar';
import { api } from '../services/api';
import LiveDot from '../components/LiveDot';

interface League {
  id: number;
  name: string;
}

interface Match {
  id: number;
  homeTeam: { name: string };
  awayTeam: { name: string };
  score: {
    fullTime: { home: number | null; away: number | null };
    // outros campos omitidos para simplicidade
  };
  utcDate: string;
  status: string;
  period?: string;
}

const selectedLeagueIds = [2013, 2002, 2015, 2019];

const formatPeriod = (period: string | undefined) => {
  switch (period) {
    case 'FIRST_HALF':
    case '1st':
      return '1º tempo';
    case 'SECOND_HALF':
    case '2nd':
      return '2º tempo';
    case 'HALF_TIME':
      return 'Intervalo';
    default:
      return 'Ao vivo';
  }
};

const leagueFlags: Record<string, string> = {
  'Brasileirão': 'https://cdn-icons-png.flaticon.com/512/197/197386.png',
  'Bundesliga': 'https://cdn-icons-png.flaticon.com/512/197/197571.png',
  'Ligue 1': 'https://cdn-icons-png.flaticon.com/512/197/197560.png',
  'Serie A': 'https://cdn-icons-png.flaticon.com/512/197/197626.png',
};

const calculateElapsedTime = (utcDate: string): string => {
  const matchStart = new Date(utcDate).getTime();
  const now = new Date().getTime();
  const elapsedMs = now - matchStart;

  const minutes = Math.floor(elapsedMs / 60000);
  return `${minutes}'`; // só os minutos, ex: 35'
};

// Função corrigida para pegar o placar correto
const getLiveScore = (score: any) => {
  if (!score) return { home: 0, away: 0 };

  if (score.fullTime) {
    return {
      home: score.fullTime.home ?? 0,
      away: score.fullTime.away ?? 0,
    };
  }

  return { home: 0, away: 0 };
};

const LeaguesScreen = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [matchesByLeague, setMatchesByLeague] = useState<Record<number, Match[]>>({});
  const [expandedLeagueIds, setExpandedLeagueIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLiveMatches = async () => {
    setLoading(true);
    try {
      const leaguesRes = await api.get('/competitions');
      const filteredLeagues = leaguesRes.data.competitions.filter((l: League) =>
        selectedLeagueIds.includes(l.id)
      );
      setLeagues(filteredLeagues);

      const leagueMatches: Record<number, Match[]> = {};

      await Promise.all(
        filteredLeagues.map(async (league) => {
          const res = await api.get(`/competitions/${league.id}/matches`, {
            params: { status: 'LIVE' },
          });
          const liveMatches: Match[] = res.data.matches || [];
          if (liveMatches.length > 0) {
            leagueMatches[league.id] = liveMatches;
          }
        })
      );

      setMatchesByLeague(leagueMatches);
    } catch (error) {
      console.error('Erro ao buscar jogos ao vivo:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMatches();
    const interval = setInterval(fetchLiveMatches, 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleExpand = (leagueId: number) => {
    setExpandedLeagueIds((prev) =>
      prev.includes(leagueId)
        ? prev.filter((id) => id !== leagueId)
        : [...prev, leagueId]
    );
  };

  return (
    <View className="flex-1 bg-[#282725]">
      <View className="flex-row items-center px-4 pt-12 pb-6">
        <Text className="text-white text-lg font-bold">FutBolão</Text>
      </View>

      <ScrollView className="px-4 py-4 flex-1">
        <View className="flex-row justify-center items-center mb-6">
          <LiveDot />
          <Text className="text-[#FF004D] text-center font-semibold text-lg ml-2">
            Jogos ao Vivo
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FF004D" />
        ) : Object.keys(matchesByLeague).length === 0 ? (
          <Text className="text-white text-center mt-6">Nenhum jogo ao vivo no momento.</Text>
        ) : (
          leagues.map((league) => {
            const matches = matchesByLeague[league.id];
            if (!matches || matches.length === 0) return null;

            const isExpanded = expandedLeagueIds.includes(league.id);

            return (
              <View
                key={league.id}
                className="mb-5 rounded-xl bg-[#1f1f1f] p-4 shadow-md border border-[#3d3d3d]"
              >
                <TouchableOpacity
                  className="flex-row justify-between items-center mb-2"
                  onPress={() => toggleExpand(league.id)}
                >
                  <View className="flex-row items-center">
                    {leagueFlags[league.name] && (
                      <Image
                        source={{ uri: leagueFlags[league.name] }}
                        className="w-5 h-5 rounded-full mr-2"
                        resizeMode="cover"
                      />
                    )}
                    <Text className="text-[#FF004D] font-semibold text-lg">
                      {league.name}
                    </Text>
                  </View>

                  {isExpanded ? (
                    <ChevronUp size={22} color="#FF004D" />
                  ) : (
                    <ChevronDown size={22} color="#FF004D" />
                  )}
                </TouchableOpacity>

                {isExpanded && (
                  <View className="mt-3">
                    {matches.map((match) => {
                      const tempo = formatPeriod(match.period);
                      const tempoFormatado = calculateElapsedTime(match.utcDate);
                      const { home, away } = getLiveScore(match.score);

                      return (
                        <View
                          key={match.id}
                          className="bg-[#2f2f2f] rounded-xl px-4 py-3 mb-4 shadow-sm border border-[#444]"
                        >
                          <View className="flex-row items-center justify-center mb-2 space-x-1 gap-1">
                            <Clock3 size={14} color="#FF004D" />
                            <Text className="text-[#FF004D] text-sm font-semibold">
                              {tempo} {tempo !== 'Intervalo' ? `- ${tempoFormatado}` : ''}
                            </Text>
                          </View>

                          <View className="flex-row justify-between items-center">
                            <Text className="text-white text-base text-left w-1/3 text-center">
                              {match.homeTeam.name}
                            </Text>
                            <Text className="text-white text-xl font-bold w-1/3 text-center">
                              {home} - {away}
                            </Text>
                            <Text className="text-white text-base text-right w-1/3 text-center">
                              {match.awayTeam.name}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      <NavBar />
    </View>
  );
};

export default LeaguesScreen;
