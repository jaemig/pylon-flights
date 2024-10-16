CREATE TABLE `aircrafts` (
	`id` text(4) PRIMARY KEY NOT NULL,
	`model` text(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `airports` (
	`id` text(4) PRIMARY KEY NOT NULL,
	`name` text(255) NOT NULL,
	`country` text(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `flights` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`departure` text(255) NOT NULL,
	`arrival` text(255) NOT NULL,
	`departureTime` text(10) NOT NULL,
	`arrivalTime` text(10) NOT NULL,
	`pilot` integer NOT NULL,
	`copilot` integer NOT NULL,
	`airline` text(255) NOT NULL,
	`status` text NOT NULL,
	`aircraft` text NOT NULL,
	FOREIGN KEY (`pilot`) REFERENCES `humans`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`copilot`) REFERENCES `humans`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`aircraft`) REFERENCES `aircrafts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `humans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`firstname` text(255) NOT NULL,
	`lastname` text(255) NOT NULL,
	`birthdate` text(10) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `luggages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`passengerId` integer NOT NULL,
	`weight` integer NOT NULL,
	`type` text NOT NULL,
	`description` text(255) NOT NULL,
	FOREIGN KEY (`passengerId`) REFERENCES `passengers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `passengers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`humanId` integer NOT NULL,
	`seat` text(10) NOT NULL,
	`class` text NOT NULL,
	`flightId` integer NOT NULL,
	FOREIGN KEY (`humanId`) REFERENCES `humans`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`flightId`) REFERENCES `flights`(`id`) ON UPDATE no action ON DELETE no action
);
