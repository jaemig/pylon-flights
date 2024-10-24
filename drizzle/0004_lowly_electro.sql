PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_flights` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`flightNumber` text(6) NOT NULL,
	`departureAirportId` text NOT NULL,
	`arrivalAirportId` text NOT NULL,
	`departureTime` text(25) NOT NULL,
	`arrivalTime` text(25) NOT NULL,
	`pilotId` text NOT NULL,
	`copilotId` text NOT NULL,
	`airlineId` text NOT NULL,
	`status` text NOT NULL,
	`aircraftId` text NOT NULL,
	FOREIGN KEY (`departureAirportId`) REFERENCES `airports`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`arrivalAirportId`) REFERENCES `airports`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pilotId`) REFERENCES `humans`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`copilotId`) REFERENCES `humans`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`airlineId`) REFERENCES `airlines`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`aircraftId`) REFERENCES `aircrafts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_flights`("id", "flightNumber", "departureAirportId", "arrivalAirportId", "departureTime", "arrivalTime", "pilotId", "copilotId", "airlineId", "status", "aircraftId") SELECT "id", "flightNumber", "departureAirportId", "arrivalAirportId", "departureTime", "arrivalTime", "pilotId", "copilotId", "airlineId", "status", "aircraftId" FROM `flights`;--> statement-breakpoint
DROP TABLE `flights`;--> statement-breakpoint
ALTER TABLE `__new_flights` RENAME TO `flights`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_passengers` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`humanId` text NOT NULL,
	`seat` text(10) NOT NULL,
	`class` text NOT NULL,
	`flightId` text NOT NULL,
	FOREIGN KEY (`humanId`) REFERENCES `humans`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`flightId`) REFERENCES `flights`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_passengers`("id", "humanId", "seat", "class", "flightId") SELECT "id", "humanId", "seat", "class", "flightId" FROM `passengers`;--> statement-breakpoint
DROP TABLE `passengers`;--> statement-breakpoint
ALTER TABLE `__new_passengers` RENAME TO `passengers`;