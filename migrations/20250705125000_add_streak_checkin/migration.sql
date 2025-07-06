-- Add lastCheckIn column to Streak table
ALTER TABLE "Streak" ADD COLUMN "lastCheckIn" DATETIME;

-- Delete duplicate streaks (keep only the one with highest currentStreak)
DELETE FROM "Streak" WHERE id NOT IN (
  SELECT id FROM (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY userId, type ORDER BY currentStreak DESC, id) as rn
    FROM "Streak"
  ) WHERE rn = 1
);

-- Create unique index for userId and type combination
CREATE UNIQUE INDEX "Streak_userId_type_key" ON "Streak"("userId", "type");