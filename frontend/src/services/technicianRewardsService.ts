import axios from 'axios';
import { Mission, RewardItem, Technician } from '../types';

const API_BASE_URL = '/api/technician-rewards';

interface RegistrationPayload {
  fullName: string;
  phone: string;
  area: string;
  skillLevel: string;
}

export const technicianRewardsService = {
  registerTechnician: async (payload: RegistrationPayload): Promise<Technician> => {
    const response = await axios.post<Technician>(`${API_BASE_URL}/technicians/register`, payload);
    return response.data;
  },

  getTechnicians: async (): Promise<Technician[]> => {
    const response = await axios.get<Technician[]>(`${API_BASE_URL}/technicians`);
    return response.data;
  },

  getMissions: async (): Promise<Mission[]> => {
    const response = await axios.get<Mission[]>(`${API_BASE_URL}/missions`);
    return response.data;
  },

  completeMission: async (missionId: number, technicianId: number): Promise<void> => {
    await axios.post(`${API_BASE_URL}/missions/${missionId}/complete`, { technicianId });
  },

  getRewardCatalog: async (): Promise<RewardItem[]> => {
    const response = await axios.get<RewardItem[]>(`${API_BASE_URL}/rewards/catalog`);
    return response.data;
  },

  redeemReward: async (technicianId: number, rewardId: number): Promise<void> => {
    await axios.post(`${API_BASE_URL}/rewards/redeem`, { technicianId, rewardId });
  },
};
