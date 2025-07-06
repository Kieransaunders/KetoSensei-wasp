import React, { useState, useEffect } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getStreaks, trackStreak, getTodaysTip, getTodaysWater, addWaterGlass } from 'wasp/client/operations';
import { useAuth } from 'wasp/client/auth';

const DashboardPage = () => {
  const { data: user } = useAuth();
  const { data: streaks, isLoading: streaksLoading, error: streaksError, refetch: refetchStreaks } = useQuery(getStreaks);
  const { data: todaysTip, isLoading: tipLoading, error: tipError } = useQuery(getTodaysTip);
  const { data: todaysWater, isLoading: waterLoading, error: waterError, refetch: refetchWater } = useQuery(getTodaysWater);
  const trackStreakFn = useAction(trackStreak);
  const addWaterGlassFn = useAction(addWaterGlass);
  const [senseiMessage, setSenseiMessage] = useState('');
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  if (streaksLoading || tipLoading || waterLoading) return 'Loading...';
  if (streaksError) return 'Error loading streaks: ' + streaksError;
  if (tipError) return 'Error loading tip: ' + tipError;
  if (waterError) return 'Error loading water data: ' + waterError;

  // Check if user has checked in today for dailyTip
  const dailyTipStreak = streaks?.find(s => s.type === 'dailyTip');
  const hasCheckedInToday = dailyTipStreak?.lastCheckIn && 
    new Date(dailyTipStreak.lastCheckIn).toDateString() === new Date().toDateString();

  const handleTrackStreak = async (type) => {
    try {
      const result = await trackStreakFn({ type });
      setSenseiMessage(result.message);
      setIsCheckedIn(result.alreadyCheckedIn);
      if (!result.alreadyCheckedIn) {
        refetchStreaks();
      }
    } catch (error) {
      setSenseiMessage("The sensei is temporarily unavailable. Please try again, grasshopper.");
    }
  };

  const handleAddWater = async () => {
    try {
      const result = await addWaterGlassFn();
      refetchWater(); // Refresh the water data
      
      if (result.glasses === 8) {
        setSenseiMessage("🎉 Outstanding hydration mastery! You have achieved perfect water balance today, noble warrior! 💧");
      } else {
        setSenseiMessage("Excellent hydration, warrior! Your body flows like water, adaptable and strong. 💧");
      }
      setTimeout(() => setSenseiMessage(''), 5000);
    } catch (error) {
      setSenseiMessage("The water spirits are temporarily unavailable. Please try again, grasshopper.");
      setTimeout(() => setSenseiMessage(''), 5000);
    }
  };

  const getBeltInfo = (streakCount) => {
    if (streakCount >= 365) return { 
      belt: "BLACK BELT", 
      color: "bg-gray-900", 
      textColor: "text-gray-100",
      progressColor: "bg-gray-600"
    };
    if (streakCount >= 180) return { 
      belt: "BROWN BELT", 
      color: "bg-amber-800", 
      textColor: "text-amber-200",
      progressColor: "bg-amber-600"
    };
    if (streakCount >= 90) return { 
      belt: "BLUE BELT", 
      color: "bg-blue-600", 
      textColor: "text-blue-200",
      progressColor: "bg-blue-400"
    };
    if (streakCount >= 45) return { 
      belt: "GREEN BELT", 
      color: "bg-green-600", 
      textColor: "text-green-200",
      progressColor: "bg-green-400"
    };
    if (streakCount >= 21) return { 
      belt: "ORANGE BELT", 
      color: "bg-orange-500", 
      textColor: "text-orange-200",
      progressColor: "bg-orange-300"
    };
    if (streakCount >= 7) return { 
      belt: "YELLOW BELT", 
      color: "bg-yellow-400", 
      textColor: "text-yellow-800",
      progressColor: "bg-yellow-300"
    };
    if (streakCount >= 3) return { 
      belt: "WHITE BELT", 
      color: "bg-gray-100", 
      textColor: "text-gray-800",
      progressColor: "bg-gray-300"
    };
    return { 
      belt: "NOVICE", 
      color: "bg-gray-600", 
      textColor: "text-gray-300",
      progressColor: "bg-gray-400"
    };
  };

  const beltInfo = getBeltInfo(dailyTipStreak?.currentStreak || 0);
  const progressToNext = dailyTipStreak?.currentStreak || 0;
  
  return (
    <div className='space-y-6'>
      {/* Welcome Header */}
      <div className='bg-gray-800 p-6 rounded-xl border border-gray-700'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-lime-400 mb-2'>
              Welcome back, {user?.identities.username?.id || 'Sensei'}
            </h1>
            <p className='text-gray-400'>Your journey continues</p>
          </div>
          <div className='w-12 h-12 bg-lime-400 rounded-full flex items-center justify-center'>
            <span className='text-gray-900 font-bold text-lg'>
              {user?.identities.username?.id.charAt(0).toUpperCase() || 'S'}
            </span>
          </div>
        </div>
      </div>

      {/* Belt Progress */}
      <div className='bg-gray-800 p-6 rounded-xl border border-gray-700'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h2 className={`text-xl font-bold ${beltInfo.textColor}`}>{beltInfo.belt}</h2>
            <p className='text-gray-400'>{Math.min(75, (progressToNext % 30) * 2.5)}% to next belt</p>
          </div>
          <div className={`w-12 h-12 ${beltInfo.color} rounded-full flex items-center justify-center`}>
            <span className='text-3xl'>🥋</span>
          </div>
        </div>
        <div className='w-full bg-gray-700 rounded-full h-2'>
          <div 
            className={`${beltInfo.progressColor} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(75, (progressToNext % 30) * 2.5)}%` }}
          ></div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className='grid grid-cols-2 gap-4'>
        <div className='bg-gray-800 p-6 rounded-xl border border-gray-700 text-center'>
          <div className='text-orange-400 text-2xl mb-2'>🔥</div>
          <div className='text-2xl font-bold text-white mb-1'>{dailyTipStreak?.currentStreak || 0} Day Streak</div>
        </div>
        
        <div className='bg-gray-800 p-6 rounded-xl border border-gray-700 text-center'>
          <div className='relative w-12 h-12 mx-auto mb-2'>
            <div className='w-12 h-12 rounded-full border-4 border-gray-600 flex items-center justify-center'>
              <span className='text-lime-400 font-bold text-sm'>65%</span>
            </div>
          </div>
          <div className='text-white font-medium'>Daily Macros</div>
        </div>
        
        <div className='bg-gray-800 p-6 rounded-xl border border-gray-700 text-center'>
          <div className='text-blue-400 text-2xl mb-2'>💧</div>
          <div className='text-white font-medium' data-testid="water-count">{todaysWater?.glasses || 0}/8 glasses</div>
        </div>
        
        <div className='bg-gray-800 p-6 rounded-xl border border-gray-700 text-center'>
          <div className='text-lime-400 text-2xl mb-2'>👟</div>
          <div className='text-white font-medium'>8432 steps</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex space-x-3'>
        <button className='flex-1 bg-gray-800 text-white p-4 rounded-xl border border-gray-700 flex items-center justify-center space-x-2 hover:bg-gray-700 transition-colors'>
          <span className='text-xl'>➕</span>
          <span className='font-medium'>Log Meal</span>
        </button>
        <button 
          onClick={handleAddWater}
          disabled={(todaysWater?.glasses || 0) >= 8}
          className={`flex-1 p-4 rounded-xl border border-gray-700 flex items-center justify-center space-x-2 transition-colors ${
            (todaysWater?.glasses || 0) >= 8 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-gray-800 text-white hover:bg-gray-700'
          }`}
          data-testid="add-water-button"
        >
          <span className='text-xl'>💧</span>
          <span className='font-medium'>
            {(todaysWater?.glasses || 0) >= 8 ? 'Goal Reached!' : 'Add Water'}
          </span>
        </button>
        <button className='flex-1 bg-gray-800 text-white p-4 rounded-xl border border-gray-700 flex items-center justify-center space-x-2 hover:bg-gray-700 transition-colors'>
          <span className='text-xl'>🏋️</span>
          <span className='font-medium'>Start Workout</span>
        </button>
      </div>

      {/* Daily Wisdom */}
      <div className='bg-gray-800 p-6 rounded-xl border border-gray-700'>
        <div className='flex items-start space-x-4'>
          <div className='w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0'>
            <span className='text-xl'>🥋</span>
          </div>
          <div className='flex-1'>
            <h3 className='text-white font-bold mb-2'>
              Daily Wisdom from Sensei
            </h3>
            <p className='text-gray-400 text-sm'>
              {todaysTip?.content || "The path to mastery begins with a single mindful choice."}
            </p>
          </div>
        </div>
        
        {!hasCheckedInToday && (
          <button
            onClick={() => handleTrackStreak('dailyTip')}
            className='w-full mt-4 bg-lime-400 text-gray-900 p-3 rounded-lg font-medium hover:bg-lime-300 transition-colors'
          >
            Master This Wisdom
          </button>
        )}
      </div>

      {/* Sensei Message */}
      {senseiMessage && (
        <div className='bg-gray-800 p-6 rounded-xl border border-gray-700' data-testid="sensei-message">
          <div className='flex items-center mb-2'>
            <span className='text-2xl mr-2'>🧘‍♂️</span>
            <h3 className='text-lg font-semibold text-lime-400'>Sensei Speaks:</h3>
          </div>
          <p className='text-gray-300 italic' data-testid="sensei-message-text">{senseiMessage}</p>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
