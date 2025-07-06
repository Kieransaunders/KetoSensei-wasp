// Quick test script to verify Flowise API connection
// Run with: node test-flowise-api.js

const FLOWISE_CONFIG = {
  baseUrl: 'https://flowise.iconnectit.co.uk',
  apiKey: 'BMErGUIYUOJdHNvQSs5j2UFsLdWtt47BOwCrWN-qm8I',
  chatflowId: '8fe26341-e8c2-4745-9d1c-447e96822743'
};

async function testFlowiseAPI() {
  console.log('🧪 Testing Flowise API connection...');
  console.log(`📡 URL: ${FLOWISE_CONFIG.baseUrl}`);
  console.log(`🔑 API Key: ${FLOWISE_CONFIG.apiKey.substring(0, 10)}...`);
  console.log(`🆔 Chatflow ID: ${FLOWISE_CONFIG.chatflowId}`);

  try {
    const testPrompt = `User Dietary Preferences:
- Dietary restrictions: None
- Allergies: None
- Daily carb limit: 20g net carbs
- Keto experience level: beginner

INGREDIENTS TO USE: salmon, avocado, spinach

Generate 3 unique keto recipes using these ingredients. Each recipe must:
- Be keto-friendly (under 10g net carbs per serving)
- Include the provided ingredients as main components
- Be practical and easy to make

Format as JSON array:
[
  {
    "title": "Recipe Name",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "instructions": ["step 1", "step 2"],
    "prepTime": "15 minutes",
    "servings": 2,
    "netCarbs": "5g per serving"
  }
]

Return ONLY the JSON array, no additional text.`;

    const response = await fetch(`${FLOWISE_CONFIG.baseUrl}/api/v1/prediction/${FLOWISE_CONFIG.chatflowId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FLOWISE_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        question: testPrompt,
        sessionId: 'test_session_123',
        streaming: false,
        overrideConfig: {
          temperature: 0.7,
          maxTokens: 2000
        }
      })
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ API Response received!');
    console.log('📝 Response data:', JSON.stringify(data, null, 2));

    // Try to parse recipe data
    const responseText = data.text || data.response || data;
    if (typeof responseText === 'string') {
      try {
        const recipes = JSON.parse(responseText);
        console.log('🍽️ Parsed recipes:', recipes.length, 'recipes found');
        recipes.forEach((recipe, index) => {
          console.log(`  ${index + 1}. ${recipe.title}`);
        });
      } catch (parseError) {
        console.log('⚠️  Response is text, not JSON:', responseText.substring(0, 200));
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testFlowiseAPI();