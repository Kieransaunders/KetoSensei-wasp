import React from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getTodaysWater, addWaterGlass } from 'wasp/client/operations';

const WaterIntakeWidget = ({ onMessage }) => {
  const { data: todaysWater, isLoading, error, refetch } = useQuery(getTodaysWater);
  const addWaterGlassFn = useAction(addWaterGlass);

  const handleAddWater = async () => {
    try {
      const result = await addWaterGlassFn();
      refetch(); // Refresh the water data
      
      if (result.glasses === 8) {
        onMessage?.("🎉 Outstanding hydration mastery! You have achieved perfect water balance today, noble warrior! 💧");
      } else {
        onMessage?.("Excellent hydration, warrior! Your body flows like water, adaptable and strong. 💧");
      }
    } catch (error) {
      onMessage?.("The water spirits are temporarily unavailable. Please try again, grasshopper.");
    }
  };

  if (isLoading) return <div>Loading water data...</div>;
  if (error) return <div>Error loading water data</div>;

  const currentGlasses = todaysWater?.glasses || 0;
  const isGoalReached = currentGlasses >= 8;

  return (
    <div className="space-y-4">
      {/* Water Count Display */}
      <div className='bg-gray-800 p-6 rounded-xl border border-gray-700 text-center'>
        <div className='text-blue-400 text-2xl mb-2'>💧</div>
        <div className='text-white font-medium' data-testid="water-count">
          {currentGlasses}/8 glasses
        </div>
        {isGoalReached && (
          <div className='text-green-400 text-sm mt-1'>Daily goal achieved! 🎉</div>
        )}
      </div>

      {/* Add Water Button */}
      <button 
        onClick={handleAddWater}
        disabled={isGoalReached}
        className={`w-full p-4 rounded-xl border border-gray-700 flex items-center justify-center space-x-2 transition-colors ${
          isGoalReached
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
            : 'bg-gray-800 text-white hover:bg-gray-700'
        }`}
        data-testid="add-water-button"
      >
        <span className='text-xl'>💧</span>
        <span className='font-medium'>
          {isGoalReached ? 'Goal Reached!' : 'Add Water'}
        </span>
      </button>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className="bg-blue-400 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentGlasses / 8) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default WaterIntakeWidget;
