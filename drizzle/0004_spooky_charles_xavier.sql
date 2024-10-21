PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_luggages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`passengerId` integer NOT NULL,
	`weight` integer NOT NULL,
	`type` text NOT NULL,
	`description` text(255) NOT NULL,
	FOREIGN KEY (`passengerId`) REFERENCES `passengers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_luggages`("id", "passengerId", "weight", "type", "description") SELECT "id", "passengerId", "weight", "type", "description" FROM `luggages`;--> statement-breakpoint
DROP TABLE `luggages`;--> statement-breakpoint
ALTER TABLE `__new_luggages` RENAME TO `luggages`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_passengers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`humanId` integer NOT NULL,
	`seat` text(10) NOT NULL,
	`class` text NOT NULL,
	`flightId` integer NOT NULL,
	FOREIGN KEY (`humanId`) REFERENCES `humans`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`flightId`) REFERENCES `flights`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_passengers`("id", "humanId", "seat", "class", "flightId") SELECT "id", "humanId", "seat", "class", "flightId" FROM `passengers`;--> statement-breakpoint
DROP TABLE `passengers`;--> statement-breakpoint
ALTER TABLE `__new_passengers` RENAME TO `passengers`;