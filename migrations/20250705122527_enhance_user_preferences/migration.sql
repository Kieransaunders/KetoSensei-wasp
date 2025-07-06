/*
  Warnings:

  - You are about to drop the column `proteinSource` on the `UserPreferences` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `UserPreferences` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserPreferences" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "vegetarian" BOOLEAN NOT NULL DEFAULT false,
    "vegan" BOOLEAN NOT NULL DEFAULT false,
    "pescatarian" BOOLEAN NOT NULL DEFAULT false,
    "dairyFree" BOOLEAN NOT NULL DEFAULT false,
    "glutenFree" BOOLEAN NOT NULL DEFAULT false,
    "nutFree" BOOLEAN NOT NULL DEFAULT false,
    "proteinSources" TEXT,
    "allergies" TEXT,
    "intolerances" TEXT,
    "carbLimit" INTEGER DEFAULT 20,
    "intermittentFasting" BOOLEAN NOT NULL DEFAULT false,
    "fastingHours" INTEGER,
    "ketoExperience" TEXT,
    "primaryGoal" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserPreferences" ("allergies", "dairyFree", "id", "userId", "vegetarian") SELECT "allergies", "dairyFree", "id", "userId", "vegetarian" FROM "UserPreferences";
DROP TABLE "UserPreferences";
ALTER TABLE "new_UserPreferences" RENAME TO "UserPreferences";
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
