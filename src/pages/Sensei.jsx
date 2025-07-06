import React from 'react';
import { FullPageChat } from 'flowise-embed-react';
import { useAuth } from 'wasp/client/auth';

const SenseiPage = () => {
  const { data: user } = useAuth();
  
  return (
    <div className="space-y-6">
      {/* Sensei Header */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="relative p-6 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 text-6xl">🥋</div>
            <div className="absolute top-8 right-8 text-4xl rotate-12">⚡</div>
            <div className="absolute bottom-6 left-12 text-3xl">🍃</div>
            <div className="absolute bottom-4 right-16 text-5xl opacity-50">🧘‍♂️</div>
          </div>
          
          <div className="relative z-10 flex items-center space-x-4">
            <div className="w-16 h-16 bg-lime-400 rounded-full flex items-center justify-center">
              <span className="text-3xl">🥋</span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                Ask KetoSensei
              </h1>
              <p className="text-lime-400 text-lg font-medium mb-1">
                "Welcome, {user?.identities.username?.id || 'grasshopper'}. Speak your mind and I shall guide you."
              </p>
              <p className="text-gray-300 text-sm">
                Master of keto wisdom • Discipline your cravings • Master your metabolism
              </p>
            </div>
          </div>
        </div>
        
        {/* Wisdom Banner */}
        <div className="bg-gray-900 px-6 py-3 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 text-gray-400">
              <span className="flex items-center"><span className="text-lime-400 mr-1">🎯</span> Personalized Advice</span>
              <span className="flex items-center"><span className="text-lime-400 mr-1">🥗</span> Recipe Suggestions</span>
              <span className="flex items-center"><span className="text-lime-400 mr-1">💪</span> Motivation & Tips</span>
            </div>
            <div className="text-lime-400 font-medium">
              Always Available
            </div>
          </div>
        </div>
      </div>

      {/* Quick Question Prompts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-lime-400 transition-colors cursor-pointer">
          <div className="flex items-center mb-2">
            <span className="text-xl mr-2">❓</span>
            <h3 className="text-white font-medium">Quick Questions</h3>
          </div>
          <p className="text-gray-400 text-sm">Ask about macros, meal timing, or keto basics</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-lime-400 transition-colors cursor-pointer">
          <div className="flex items-center mb-2">
            <span className="text-xl mr-2">🍳</span>
            <h3 className="text-white font-medium">Recipe Help</h3>
          </div>
          <p className="text-gray-400 text-sm">Get cooking tips or ingredient substitutions</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-lime-400 transition-colors cursor-pointer">
          <div className="flex items-center mb-2">
            <span className="text-xl mr-2">🎯</span>
            <h3 className="text-white font-medium">Goal Planning</h3>
          </div>
          <p className="text-gray-400 text-sm">Discuss weight loss strategies and milestones</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-lime-400 transition-colors cursor-pointer">
          <div className="flex items-center mb-2">
            <span className="text-xl mr-2">⚡</span>
            <h3 className="text-white font-medium">Motivation</h3>
          </div>
          <p className="text-gray-400 text-sm">Need encouragement or dealing with cravings?</p>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="h-[500px] w-full">
          <FullPageChat
            chatflowid="8fe26341-e8c2-4745-9d1c-447e96822743"
            apiHost="https://flowise.iconnectit.co.uk"
            theme={{
              button: {
                backgroundColor: "#a3e635",
                right: 20,
                bottom: 20,
                size: "medium",
                iconColor: "black",
              },
              chatWindow: {
                backgroundColor: "#1f2937",
                height: 500,
                width: "100%",
                fontSize: 16,
                poweredByTextColor: "#6b7280",
                botMessage: {
                  backgroundColor: "#374151",
                  textColor: "#ffffff",
                  showAvatar: true,
                  avatarSrc: "🥋",
                },
                userMessage: {
                  backgroundColor: "#a3e635",
                  textColor: "#000000",
                },
                textInput: {
                  backgroundColor: "#374151",
                  textColor: "#ffffff",
                  placeholder: "Ask the Sensei your keto question...",
                  sendButtonColor: "#a3e635",
                }
              }
            }}
          />
        </div>
      </div>

      {/* Sensei Wisdom Footer */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 text-sm italic">
              "The path to keto mastery is paved with mindful choices, grasshopper."
            </p>
            <p className="text-lime-400 text-xs mt-1 font-medium">
              - KetoSensei
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SenseiPage;