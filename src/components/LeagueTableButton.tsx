import React from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

interface Props {
  label: string;
  flagUri: string;
  onPress: () => void;
}

const LeagueTableButton = ({ label, flagUri, onPress }: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-[#1E1D1B] p-4 rounded-2xl flex-row items-center justify-between mb-3"
    >
      <View className="flex-row items-center">
        <Image source={{ uri: flagUri }} className="w-8 h-8 rounded-full mr-4" />
        <Text className="text-white text-base font-semibold">{label}</Text>
      </View>
      <ChevronRight color="#FFF" size={20} />
    </TouchableOpacity>
  );
};

export default LeagueTableButton;
