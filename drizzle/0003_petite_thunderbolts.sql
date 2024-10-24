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
	FOREIGN KEY (`departureAirportId`) REFERENCES `airports`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`arrivalAirportId`) REFERENCES `airports`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pilotId`) REFERENCES `humans`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`copilotId`) REFERENCES `humans`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`airlineId`) REFERENCES `airlines`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`aircraftId`) REFERENCES `aircrafts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_flights`("id", "flightNumber", "departureAirportId", "arrivalAirportId", "departureTime", "arrivalTime", "pilotId", "copilotId", "airlineId", "status", "aircraftId") SELECT "id", "flightNumber", "departureAirportId", "arrivalAirportId", "departureTime", "arrivalTime", "pilotId", "copilotId", "airlineId", "status", "aircraftId" FROM `flights`;--> statement-breakpoint
DROP TABLE `flights`;--> statement-breakpoint
ALTER TABLE `__new_flights` RENAME TO `flights`;--> statement-breakpoint
PRAGMA foreign_keys=ON;