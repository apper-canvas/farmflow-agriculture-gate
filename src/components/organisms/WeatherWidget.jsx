import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import weatherService from '@/services/api/weatherService';

const WeatherWidget = ({ showForecast = false, className = '' }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadWeatherData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await weatherService.getWeatherData();
        setWeatherData(data);
      } catch (err) {
        setError(err.message || 'Failed to load weather data');
      } finally {
        setLoading(false);
      }
    };

    loadWeatherData();
  }, []);

  if (loading) {
    return <SkeletonLoader type="card" className={className} />;
  }

  if (error) {
    return (
      <Card className={className}>
        <ErrorState
          title="Weather Unavailable"
          message="Unable to load weather data at the moment."
          onRetry={() => window.location.reload()}
        />
      </Card>
    );
  }

  if (!weatherData) return null;

  const { current, forecast, alerts } = weatherData;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Weather */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Current Weather</h3>
          {alerts.length > 0 && (
            <Badge variant="warning" icon="AlertTriangle" size="sm">
              {alerts.length} Alert{alerts.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <ApperIcon name={current.icon} size={32} className="text-white" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{current.temperature}°F</div>
              <div className="text-sm text-gray-600">{current.condition}</div>
            </div>
          </div>
          
          <div className="text-right space-y-1">
            <div className="flex items-center text-sm text-gray-600">
              <ApperIcon name="Droplets" size={14} className="mr-1" />
              <span>{current.humidity}% humidity</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <ApperIcon name="Wind" size={14} className="mr-1" />
              <span>{current.windSpeed} mph</span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-surface-200">
            {alerts.map(alert => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 bg-warning/10 rounded-lg">
                <ApperIcon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
                <div>
                  <div className="font-medium text-warning">{alert.type}</div>
                  <div className="text-sm text-gray-600">{alert.message}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 7-Day Forecast */}
      {showForecast && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">7-Day Forecast</h3>
          <div className="space-y-3">
            {forecast.map((day, index) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 hover:bg-surface-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <ApperIcon name={day.icon} size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{day.day}</div>
                    <div className="text-sm text-gray-600">{day.condition}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <ApperIcon name="Droplets" size={14} />
                    <span>{day.precipitation}%</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{day.high}°</div>
                    <div className="text-sm text-gray-500">{day.low}°</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default WeatherWidget;