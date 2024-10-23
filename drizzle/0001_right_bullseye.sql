PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_luggages` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`passengerId` text NOT NULL,
	`weight` integer NOT NULL,
	`type` text NOT NULL,
	`description` text(100) NOT NULL,
	FOREIGN KEY (`passengerId`) REFERENCES `passengers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_luggages`("id", "passengerId", "weight", "type", "description") SELECT "id", "passengerId", "weight", "type", "description" FROM `luggages`;--> statement-breakpoint
DROP TABLE `luggages`;--> statement-breakpoint
ALTER TABLE `__new_luggages` RENAME TO `luggages`;--> statement-breakpoint
PRAGMA foreign_keys=ON;