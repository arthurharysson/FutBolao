import { api } from './api';

export const getChampionsLeagueMatches = async () => {
  const response = await api.get('/competitions/CL/matches');
  return response.data.matches;
};
