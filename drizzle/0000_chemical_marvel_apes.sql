CREATE TABLE `visitors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`visitor_key` text NOT NULL,
	`wish_ashley` text,
	`wish_self` text,
	`created_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_visitors_visitor_key` ON `visitors` (`visitor_key`);