-- CreateTable
CREATE TABLE "DailyTip" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "dayOfYear" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert kung-fu themed keto tips
INSERT INTO "DailyTip" ("title", "content", "category", "dayOfYear") VALUES
('The Way of the Empty Bowl', 'A true warrior knows when to fast, grasshopper. Let hunger be your teacher, not your enemy.', 'mindset', 1),
('The Avocado Meditation', 'As the avocado is rich in healthy fats, so must your mind be rich in patience. Good fats fuel the warrior within.', 'nutrition', 2),
('Morning Water Ritual', 'Begin each day like a flowing river - with pure water. Hydration is the foundation of all martial arts... and ketosis.', 'habit', 3),
('The Bacon Balance', 'Even bacon, when eaten mindfully, can be your ally. Quality over quantity, young grasshopper.', 'nutrition', 4),
('Craving Deflection Technique', 'When sugar calls to you like a siren, breathe deeply and ask: "Is this nourishment or mere desire?" The wise warrior chooses nourishment.', 'mindset', 5),
('The Cauliflower Transformation', 'See how cauliflower can become rice, pizza, even mash? Be like cauliflower - adaptable and versatile in your keto journey.', 'motivation', 6),
('Discipline of the Dawn', 'The early bird catches the worm, but the early keto warrior catches ketosis. Start your day with purpose and fats.', 'habit', 7),
('The Egg Wisdom', 'Eggs are perfect protein parcels, like little treasure chests. Nature has already portioned them for you - listen to nature.', 'nutrition', 8),
('Mindful Meat Mastery', 'Choose your proteins like you choose your battles - with wisdom. Grass-fed is the way of the enlightened warrior.', 'nutrition', 9),
('The Macadamia Nut Philosophy', 'Small but mighty, like a pebble that starts an avalanche. Sometimes the smallest changes create the biggest transformations.', 'motivation', 10),
('Vegetable Variety Victory', 'Green vegetables are your allies in the battle against carbs. Embrace the rainbow... the green rainbow.', 'nutrition', 11),
('The Intermittent Fasting Flow', 'Eating constantly is like fighting constantly - exhausting. Give your body time to rest, repair, and burn fat.', 'habit', 12),
('Coconut Oil Confidence', 'Pour coconut oil like you pour confidence into your day. Smooth, steady, and with complete faith in the process.', 'mindset', 13),
('The Cheese Selection Ceremony', 'Choose full-fat cheese like you choose your friends - with care, quality, and the knowledge they will support you.', 'nutrition', 14),
('Sleep Like a Samurai', 'Even the greatest warriors need rest. Poor sleep disrupts hormones - honor your sleep like you honor your training.', 'habit', 15);