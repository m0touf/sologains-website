import { useAuthStore } from '../stores/authStore';
import { API_BASE_URL } from './constants';
import { ApiError, logError } from './errorHandler';

class ApiClient {
  private getAuthHeaders() {
    const token = useAuthStore.getState().token;
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getAuthHeaders();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new ApiError(
          error.error || 'Request failed',
          error.code,
          response.status
        );
      }

      return response.json();
    } catch (error) {
      logError(error, `API request to ${endpoint}`);
      throw error;
    }
  }

  // Auth endpoints
  async signup(data: { email: string; username: string; password: string }) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Game endpoints
  async getSave() {
    return this.request('/save');
  }

  async doWorkout(data: {
    type: 'strength' | 'endurance' | 'mobility';
    exerciseId: string;
    reps?: number;
    intensity?: 1|2|3|4|5;
    grade?: 'perfect'|'good'|'okay'|'miss';
  }) {
    return this.request('/workout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetEnergy() {
    return this.request('/reset-energy', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async getExercises() {
    return this.request('/exercises');
  }

  async getProficiencies() {
    return this.request('/exercises/proficiencies');
  }

  async upgradeExercise(data: { exerciseId: string; tier: number }) {
    return this.request('/research/upgrade', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getResearchUpgrades() {
    return this.request('/research/upgrades');
  }

  async getAvailableResearch() {
    return this.request('/research/available');
  }

  // Adventure endpoints
  async getDailyAdventures() {
    return this.request('/adventures');
  }

  async attemptAdventure(data: { adventureId: string }) {
    return this.request('/attempt-adventure', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAdventureHistory() {
    return this.request('/adventure-history');
  }

  async checkAdventureCompletions() {
    return this.request('/check-adventure-completions', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async claimAdventureRewards(data: { adventureAttemptId: string }) {
    return this.request('/claim-adventure-rewards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Store endpoints
  async getStoreItems() {
    return this.request('/store/items');
  }

  async purchaseItem(data: { itemId: string }) {
    return this.request('/store/purchase', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async simulateDate(data: { date: string }) {
    return this.request('/store/test-date', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();
