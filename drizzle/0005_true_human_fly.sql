PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_flights` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text(36) NOT NULL,
	`flightNumber` text(7) NOT NULL,
	`departureAirportId` text NOT NULL,
	`arrivalAirportId` text NOT NULL,
	`departureTime` text(25) NOT NULL,
	`arrivalTime` text(25) NOT NULL,
	`pilot` integer NOT NULL,
	`copilot` integer NOT NULL,
	`airline` integer NOT NULL,
	`status` text NOT NULL,
	`aircraftId` text NOT NULL,
	FOREIGN KEY (`departureAirportId`) REFERENCES `airports`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`arrivalAirportId`) REFERENCES `airports`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pilot`) REFERENCES `humans`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`copilot`) REFERENCES `humans`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`airline`) REFERENCES `airlines`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`aircraftId`) REFERENCES `aircrafts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_flights`("id", "uuid", "flightNumber", "departureAirportId", "arrivalAirportId", "departureTime", "arrivalTime", "pilot", "copilot", "airline", "status", "aircraftId") SELECT "id", "uuid", "flightNumber", "departureAirportId", "arrivalAirportId", "departureTime", "arrivalTime", "pilot", "copilot", "airline", "status", "aircraftId" FROM `flights`;--> statement-breakpoint
DROP TABLE `flights`;--> statement-breakpoint
ALTER TABLE `__new_flights` RENAME TO `flights`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `flights_uuid_unique` ON `flights` (`uuid`);--> statement-breakpoint
CREATE TABLE `__new_aircrafts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text(36) NOT NULL,
	`icao` text(4) NOT NULL,
	`model` text(255) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_aircrafts`("id", "uuid", "icao", "model") SELECT "id", "uuid", "icao", "model" FROM `aircrafts`;--> statement-breakpoint
DROP TABLE `aircrafts`;--> statement-breakpoint
ALTER TABLE `__new_aircrafts` RENAME TO `aircrafts`;--> statement-breakpoint
CREATE UNIQUE INDEX `aircrafts_uuid_unique` ON `aircrafts` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `aircrafts_icao_unique` ON `aircrafts` (`icao`);--> statement-breakpoint
CREATE TABLE `__new_airlines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text(36) NOT NULL,
	`name` text(255) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_airlines`("id", "uuid", "name") SELECT "id", "uuid", "name" FROM `airlines`;--> statement-breakpoint
DROP TABLE `airlines`;--> statement-breakpoint
ALTER TABLE `__new_airlines` RENAME TO `airlines`;--> statement-breakpoint
CREATE UNIQUE INDEX `airlines_uuid_unique` ON `airlines` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `airlines_name_unique` ON `airlines` (`name`);--> statement-breakpoint
CREATE TABLE `__new_airports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text(36) NOT NULL,
	`icao` text(4) NOT NULL,
	`name` text(255) NOT NULL,
	`country` text(255) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_airports`("id", "uuid", "icao", "name", "country") SELECT "id", "uuid", "icao", "name", "country" FROM `airports`;--> statement-breakpoint
DROP TABLE `airports`;--> statement-breakpoint
ALTER TABLE `__new_airports` RENAME TO `airports`;--> statement-breakpoint
CREATE UNIQUE INDEX `airports_uuid_unique` ON `airports` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `airports_icao_unique` ON `airports` (`icao`);--> statement-breakpoint
ALTER TABLE `humans` ADD `uuid` text(36) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `humans_uuid_unique` ON `humans` (`uuid`);--> statement-breakpoint
ALTER TABLE `luggages` ADD `uuid` text(36) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `luggages_uuid_unique` ON `luggages` (`uuid`);--> statement-breakpoint
ALTER TABLE `passengers` ADD `uuid` text(36) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `passengers_uuid_unique` ON `passengers` (`uuid`);