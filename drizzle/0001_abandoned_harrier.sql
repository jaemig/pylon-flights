PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_flights` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`departure` integer NOT NULL,
	`arrival` integer NOT NULL,
	`departureTime` text(10) NOT NULL,
	`arrivalTime` text(10) NOT NULL,
	`pilot` integer NOT NULL,
	`copilot` integer NOT NULL,
	`airline` text(255) NOT NULL,
	`status` text NOT NULL,
	`aircraft` text NOT NULL,
	FOREIGN KEY (`departure`) REFERENCES `airports`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`arrival`) REFERENCES `airports`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pilot`) REFERENCES `humans`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`copilot`) REFERENCES `humans`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`aircraft`) REFERENCES `aircrafts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_flights`("id", "departure", "arrival", "departureTime", "arrivalTime", "pilot", "copilot", "airline", "status", "aircraft") SELECT "id", "departure", "arrival", "departureTime", "arrivalTime", "pilot", "copilot", "airline", "status", "aircraft" FROM `flights`;--> statement-breakpoint
DROP TABLE `flights`;--> statement-breakpoint
ALTER TABLE `__new_flights` RENAME TO `flights`;--> statement-breakpoint
PRAGMA foreign_keys=ON;