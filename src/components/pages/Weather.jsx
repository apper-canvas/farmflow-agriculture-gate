import { motion } from 'framer-motion';
import WeatherWidget from '@/components/organisms/WeatherWidget';

const Weather = () => {
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Weather</h1>
        <p className="text-gray-600">Current conditions and 7-day forecast for your farming operations</p>
      </div>

      {/* Weather Widget with Full Forecast */}
      <WeatherWidget showForecast={true} />
    </motion.div>
  );
};

export default Weather;