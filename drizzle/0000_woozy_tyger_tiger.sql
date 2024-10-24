CREATE TABLE `aircrafts` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`icao` text(4) NOT NULL,
	`model` text(100) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `aircrafts_icao_unique` ON `aircrafts` (`icao`);--> statement-breakpoint
CREATE TABLE `airlines` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`name` text(100) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `airlines_name_unique` ON `airlines` (`name`);--> statement-breakpoint
CREATE TABLE `airports` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`icao` text(4) NOT NULL,
	`name` text(100) NOT NULL,
	`country` text(100) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `airports_icao_unique` ON `airports` (`icao`);--> statement-breakpoint
CREATE TABLE `flights` (
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
CREATE TABLE `humans` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`firstname` text(100) NOT NULL,
	`lastname` text(100) NOT NULL,
	`birthdate` text(10) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `luggages` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`passengerId` text NOT NULL,
	`weight` integer NOT NULL,
	`type` text NOT NULL,
	`description` text(100) NOT NULL,
	FOREIGN KEY (`passengerId`) REFERENCES `passengers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `passengers` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`humanId` text NOT NULL,
	`seat` text(10) NOT NULL,
	`class` text NOT NULL,
	`flightId` text NOT NULL,
	FOREIGN KEY (`humanId`) REFERENCES `humans`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`flightId`) REFERENCES `flights`(`id`) ON UPDATE no action ON DELETE cascade
);
