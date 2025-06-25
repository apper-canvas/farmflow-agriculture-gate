const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock weather data
const mockWeatherData = {
  current: {
    temperature: 72,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 8,
    icon: 'CloudSun'
  },
  forecast: [
    {
      date: '2024-12-18',
      day: 'Today',
      high: 75,
      low: 55,
      condition: 'Partly Cloudy',
      precipitation: 10,
      icon: 'CloudSun'
    },
    {
      date: '2024-12-19',
      day: 'Tomorrow',
      high: 78,
      low: 58,
      condition: 'Sunny',
      precipitation: 0,
      icon: 'Sun'
    },
    {
      date: '2024-12-20',
      day: 'Friday',
      high: 71,
      low: 52,
      condition: 'Light Rain',
      precipitation: 70,
      icon: 'CloudRain'
    },
    {
      date: '2024-12-21',
      day: 'Saturday',
      high: 69,
      low: 48,
      condition: 'Cloudy',
      precipitation: 30,
      icon: 'Cloud'
    },
    {
      date: '2024-12-22',
      day: 'Sunday',
      high: 73,
      low: 51,
      condition: 'Partly Cloudy',
      precipitation: 15,
      icon: 'CloudSun'
    },
    {
      date: '2024-12-23',
      day: 'Monday',
      high: 76,
      low: 54,
      condition: 'Sunny',
      precipitation: 5,
      icon: 'Sun'
    },
    {
      date: '2024-12-24',
      day: 'Tuesday',
      high: 74,
      low: 56,
      condition: 'Partly Cloudy',
      precipitation: 20,
      icon: 'CloudSun'
    }
  ],
  alerts: [
    {
      id: 1,
      type: 'Frost Warning',
      severity: 'medium',
      message: 'Temperatures may drop below 40°F on Saturday night. Consider protecting sensitive crops.',
      issuedAt: '2024-12-17T18:00:00Z'
    }
  ]
};

const weatherService = {
  async getCurrent() {
    await delay(250);
    return { ...mockWeatherData.current };
  },

  async getForecast() {
    await delay(300);
    return [...mockWeatherData.forecast];
  },

  async getAlerts() {
    await delay(200);
    return [...mockWeatherData.alerts];
  },

  async getWeatherData() {
    await delay(350);
    return {
      current: { ...mockWeatherData.current },
      forecast: [...mockWeatherData.forecast],
      alerts: [...mockWeatherData.alerts]
    };
  }
};

export default weatherService;