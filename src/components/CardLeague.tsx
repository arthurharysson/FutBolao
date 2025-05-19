import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Match = {
  id: number;
  utcDate: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  status: string;
};

type Props = {
  leagueName: string;
  flagUri: string;
  matches: Match[];
  loading?: boolean;
};


const formatStatus = (status: string) => {
  switch (status) {
    case 'SCHEDULED':
    case 'TIMED':
      return 'A começar';
    case 'IN_PLAY':
    case 'LIVE':
    case 'PAUSED':
      return 'Ao vivo';
    case 'FINISHED':
      return 'Encerrado';
    case 'POSTPONED':
      return 'Adiado';
    case 'CANCELED':
      return 'Cancelado';
    default:
      return status;
  }
};


const LeagueCard = ({ leagueName, flagUri, matches, loading }: Props) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="bg-neutral-800 rounded-xl mb-4 overflow-hidden border border-neutral-600">
      <TouchableOpacity
        className="flex-row items-center justify-between px-4 py-3"
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View className="flex-row items-center">
          <Image
            source={{ uri: flagUri }}
            className="w-6 h-6 rounded-sm mr-3"
            resizeMode="cover"
          />
          <Text className="text-white font-semibold text-base">{leagueName}</Text>
        </View>
        {expanded ? (
          <ChevronUp size={20} color="#FF004D" />
        ) : (
          <ChevronDown size={20} color="#FF004D" />
        )}
      </TouchableOpacity>

      {expanded && (
        <View className="px-4 pb-4 bg-neutral-900">
          {loading ? (
            <ActivityIndicator color="#FF004D" />
          ) : matches.length === 0 ? (
            <Text className="text-neutral-400 italic text-center mt-2">Sem jogos nas próximas 24h</Text>
          ) : (
            matches.map(match => (
              <View key={match.id} className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 mt-2">
                <Text className="text-white text-center font-medium mb-1">
                  {match.homeTeam.name} <Text className="text-neutral-400">vs</Text> {match.awayTeam.name}
                </Text>
                <Text className="text-sm text-[#FF004D] text-center">
                  {format(parseISO(match.utcDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </Text>
                <Text className="text-xs text-neutral-500 text-center mt-1 uppercase">
                  {formatStatus(match.status)}
                </Text>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
};

export default LeagueCard;
