import React, { useState, useEffect } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getUserPreferences, updateUserPreferences } from 'wasp/client/operations';

const UserPreferencesPage = () => {
  const { data: preferences, isLoading, error } = useQuery(getUserPreferences);
  const updateUserPreferencesFn = useAction(updateUserPreferences);
  const [saveMessage, setSaveMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [dietType, setDietType] = useState('standard');

  // Form state
  const [formData, setFormData] = useState({
    vegetarian: false,
    vegan: false,
    pescatarian: false,
    dairyFree: false,
    glutenFree: false,
    nutFree: false,
    proteinSources: [],
    allergies: [],
    intolerances: [],
    carbLimit: 20,
    intermittentFasting: false,
    fastingHours: 16,
    ketoExperience: '',
    primaryGoal: ''
  });

  useEffect(() => {
    if (preferences) {
      setFormData({
        vegetarian: preferences.vegetarian || false,
        vegan: preferences.vegan || false,
        pescatarian: preferences.pescatarian || false,
        dairyFree: preferences.dairyFree || false,
        glutenFree: preferences.glutenFree || false,
        nutFree: preferences.nutFree || false,
        proteinSources: preferences.proteinSources ? JSON.parse(preferences.proteinSources) : [],
        allergies: preferences.allergies ? JSON.parse(preferences.allergies) : [],
        intolerances: preferences.intolerances ? JSON.parse(preferences.intolerances) : [],
        carbLimit: preferences.carbLimit || 20,
        intermittentFasting: preferences.intermittentFasting || false,
        fastingHours: preferences.fastingHours || 16,
        ketoExperience: preferences.ketoExperience || '',
        primaryGoal: preferences.primaryGoal || ''
      });
    }
  }, [preferences]);

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-lg">Loading your preferences...</div>
    </div>
  );
  
  if (error) return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <div className="text-red-800">Error loading preferences: {error}</div>
    </div>
  );

  const handleCheckboxChange = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSelectChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelectChange = (field, value) => {
    setFormData(prev => {
      const currentArray = prev[field];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const handleSave = async () => {
    try {
      await updateUserPreferencesFn({
        vegetarian: formData.vegetarian,
        vegan: formData.vegan,
        pescatarian: formData.pescatarian,
        dairyFree: formData.dairyFree,
        glutenFree: formData.glutenFree,
        nutFree: formData.nutFree,
        proteinSources: JSON.stringify(formData.proteinSources),
        allergies: JSON.stringify(formData.allergies),
        intolerances: JSON.stringify(formData.intolerances),
        carbLimit: formData.carbLimit,
        intermittentFasting: formData.intermittentFasting,
        fastingHours: formData.fastingHours,
        ketoExperience: formData.ketoExperience,
        primaryGoal: formData.primaryGoal
      });
      setSaveMessage("Your preferences have been saved, grasshopper! The Sensei will use this wisdom to guide you better. 🥋");
      setTimeout(() => setSaveMessage(''), 5000);
    } catch (error) {
      setSaveMessage("The sensei encountered an error. Please try again.");
      setTimeout(() => setSaveMessage(''), 5000);
    }
  };

  const dietTypes = [
    {
      id: 'standard',
      title: 'Standard Keto',
      description: '20-50g carbs/day',
      selected: dietType === 'standard'
    },
    {
      id: 'lazy',
      title: 'Lazy Keto',
      description: 'Tracking only carbs',
      selected: dietType === 'lazy'
    },
    {
      id: 'vegetarian',
      title: 'Vegetarian Keto',
      description: 'Plant-based keto diet',
      selected: dietType === 'vegetarian'
    },
    {
      id: 'mediterranean',
      title: 'Mediterranean Keto',
      description: 'Keto with Mediterranean foods',
      selected: dietType === 'mediterranean'
    }
  ];

  return (
    <div className="max-w-md mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          Diet Preferences
        </h1>
        <div className="flex items-center text-sm text-gray-400">
          <span>Step {currentStep} of 2</span>
          <div className="ml-4 flex-1 bg-gray-700 rounded-full h-1">
            <div className="bg-white h-1 rounded-full w-1/2"></div>
          </div>
        </div>
      </div>

      {currentStep === 1 && (
        <>
          <h2 className="text-xl font-bold text-white mb-6">Select Your Diet Type</h2>
          
          <div className="space-y-4 mb-8">
            {dietTypes.map((diet) => (
              <label
                key={diet.id}
                className={`block p-4 rounded-lg border cursor-pointer transition-all ${
                  diet.selected
                    ? 'border-lime-400 bg-gray-800'
                    : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                }`}
                onClick={() => setDietType(diet.id)}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    diet.selected ? 'border-lime-400' : 'border-gray-500'
                  }`}>
                    {diet.selected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-lime-400"></div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-white font-medium">{diet.title}</div>
                    <div className="text-gray-400 text-sm">{diet.description}</div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="dietType"
                  value={diet.id}
                  checked={diet.selected}
                  onChange={() => setDietType(diet.id)}
                  className="sr-only"
                />
              </label>
            ))}
          </div>

          <button
            onClick={() => setCurrentStep(2)}
            className="w-full bg-lime-400 text-gray-900 p-4 rounded-lg font-medium hover:bg-lime-300 transition-colors"
          >
            Continue
          </button>
        </>
      )}

      {currentStep === 2 && (
        <>
          <h2 className="text-xl font-bold text-white mb-6">Dietary Restrictions & Allergies</h2>
          
          <div className="space-y-6 mb-8">
            {/* Dietary Restrictions */}
            <div>
              <h3 className="text-lg font-semibold text-lime-400 mb-4">Dietary Restrictions</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'vegetarian', label: 'Vegetarian' },
                  { key: 'vegan', label: 'Vegan' },
                  { key: 'pescatarian', label: 'Pescatarian' },
                  { key: 'dairyFree', label: 'Dairy-Free' },
                  { key: 'glutenFree', label: 'Gluten-Free' },
                  { key: 'nutFree', label: 'Nut-Free' }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center cursor-pointer p-2 bg-gray-800 rounded border border-gray-600 hover:border-gray-500">
                    <input
                      type="checkbox"
                      checked={formData[key]}
                      onChange={() => handleCheckboxChange(key)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      formData[key] ? 'border-lime-400 bg-lime-400' : 'border-gray-500'
                    }`}>
                      {formData[key] && (
                        <svg className="w-2.5 h-2.5 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="ml-2 text-white text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <h3 className="text-lg font-semibold text-lime-400 mb-4">Food Allergies</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Nuts', 'Shellfish', 'Fish', 'Eggs',
                  'Dairy', 'Soy', 'Gluten', 'Sesame'
                ].map((allergy) => (
                  <label key={allergy} className="flex items-center cursor-pointer p-2 bg-gray-800 rounded border border-gray-600 hover:border-gray-500">
                    <input
                      type="checkbox"
                      checked={formData.allergies.includes(allergy)}
                      onChange={() => handleMultiSelectChange('allergies', allergy)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      formData.allergies.includes(allergy) ? 'border-red-400 bg-red-400' : 'border-gray-500'
                    }`}>
                      {formData.allergies.includes(allergy) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="ml-2 text-white text-sm">{allergy}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Food Intolerances */}
            <div>
              <h3 className="text-lg font-semibold text-lime-400 mb-4">Food Intolerances</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Lactose', 'FODMAPs', 'Histamine', 'Nightshades',
                  'Artificial Sweeteners', 'MSG', 'Sulfites', 'Yeast'
                ].map((intolerance) => (
                  <label key={intolerance} className="flex items-center cursor-pointer p-2 bg-gray-800 rounded border border-gray-600 hover:border-gray-500">
                    <input
                      type="checkbox"
                      checked={formData.intolerances.includes(intolerance)}
                      onChange={() => handleMultiSelectChange('intolerances', intolerance)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      formData.intolerances.includes(intolerance) ? 'border-yellow-400 bg-yellow-400' : 'border-gray-500'
                    }`}>
                      {formData.intolerances.includes(intolerance) && (
                        <svg className="w-2.5 h-2.5 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="ml-2 text-white text-sm">{intolerance}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Preferred Protein Sources */}
            <div>
              <h3 className="text-lg font-semibold text-lime-400 mb-4">Preferred Protein Sources</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Beef', 'Chicken', 'Turkey', 'Pork',
                  'Fish', 'Seafood', 'Eggs', 'Tofu/Tempeh'
                ].map((protein) => (
                  <label key={protein} className="flex items-center cursor-pointer p-2 bg-gray-800 rounded border border-gray-600 hover:border-gray-500">
                    <input
                      type="checkbox"
                      checked={formData.proteinSources.includes(protein)}
                      onChange={() => handleMultiSelectChange('proteinSources', protein)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      formData.proteinSources.includes(protein) ? 'border-blue-400 bg-blue-400' : 'border-gray-500'
                    }`}>
                      {formData.proteinSources.includes(protein) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="ml-2 text-white text-sm">{protein}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Carb Limit */}
            <div>
              <label className="block text-white font-medium mb-2">
                Daily Net Carb Limit (grams)
              </label>
              <input
                type="number"
                value={formData.carbLimit}
                onChange={(e) => handleSelectChange('carbLimit', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-lime-400 focus:outline-none"
                min="5"
                max="50"
              />
            </div>

            {/* Intermittent Fasting */}
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.intermittentFasting}
                  onChange={() => handleCheckboxChange('intermittentFasting')}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  formData.intermittentFasting ? 'border-lime-400 bg-lime-400' : 'border-gray-500'
                }`}>
                  {formData.intermittentFasting && (
                    <svg className="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="ml-3 text-white">I practice intermittent fasting</span>
              </label>

              {formData.intermittentFasting && (
                <div className="mt-4">
                  <label className="block text-white font-medium mb-2">
                    Fasting Window (hours)
                  </label>
                  <select
                    value={formData.fastingHours}
                    onChange={(e) => handleSelectChange('fastingHours', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-lime-400 focus:outline-none"
                  >
                    <option value={12}>12 hours</option>
                    <option value={14}>14 hours</option>
                    <option value={16}>16 hours</option>
                    <option value={18}>18 hours</option>
                    <option value={20}>20 hours</option>
                    <option value={24}>24 hours (OMAD)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Keto Experience */}
            <div>
              <label className="block text-white font-medium mb-2">
                Keto Experience Level
              </label>
              <select
                value={formData.ketoExperience}
                onChange={(e) => handleSelectChange('ketoExperience', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-lime-400 focus:outline-none"
              >
                <option value="">Select experience level</option>
                <option value="beginner">Beginner (New to keto)</option>
                <option value="intermediate">Intermediate (3-12 months)</option>
                <option value="advanced">Advanced (1+ years)</option>
              </select>
            </div>

            {/* Primary Goal */}
            <div>
              <label className="block text-white font-medium mb-2">
                Primary Goal
              </label>
              <select
                value={formData.primaryGoal}
                onChange={(e) => handleSelectChange('primaryGoal', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-lime-400 focus:outline-none"
              >
                <option value="">Select your goal</option>
                <option value="weight_loss">Weight Loss</option>
                <option value="maintenance">Weight Maintenance</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="health">General Health</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex-1 bg-gray-700 text-white p-4 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-lime-400 text-gray-900 p-4 rounded-lg font-medium hover:bg-lime-300 transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </>
      )}

      {saveMessage && (
        <div className="mt-6 p-4 bg-lime-400 bg-opacity-20 border border-lime-400 rounded-lg">
          <p className="text-lime-400 text-sm">{saveMessage}</p>
        </div>
      )}
    </div>
  );
};

export default UserPreferencesPage;
