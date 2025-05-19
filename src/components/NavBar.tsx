import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Home, Trophy, Calendar, BarChart3, Users } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';

interface TabButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, icon, isActive, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 items-center justify-center py-3"
    >
      <View className="items-center">
        {icon}
        <Text className={`text-xs mt-1 ${isActive ? 'text-[#FF004D]' : 'text-white'}`}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const NavBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      label: 'Hoje',
      icon: <Calendar size={22} color={pathname === '/' ? '#FF004D' : '#fff'} />,
      route: '/',
    },
    {
      label: 'Ligas',
      icon: <Trophy size={22} color={pathname === '/ligas' ? '#FF004D' : '#fff'} />,
      route: '/ligas',
    },

    {
    label: 'Bolão',
    icon: <Users size={22} color={pathname === '/boloes' ? '#FF004D' : '#fff'} />,
    route: '/boloes',
    },

    {
      label: 'Resultados',
      icon: <BarChart3 size={22} color={pathname === '/resultados' ? '#FF004D' : '#fff'} />,
      route: '/resultados',
    },
  ];

  return (
    <SafeAreaView
      edges={['bottom']}  
      className="bg-[#282725]"
    >
      <View className="flex-row border-t border-neutral-800 px-4">
        {tabs.map(tab => (
          <TabButton
            key={tab.route}
            label={tab.label}  
            icon={tab.icon}
            isActive={pathname === tab.route}
            onPress={() => router.push(tab.route)}
          />
        ))}
      </View>
    </SafeAreaView>
  );
};

export default NavBar;
