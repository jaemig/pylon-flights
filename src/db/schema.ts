import { relations } from 'drizzle-orm';
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const humans = sqliteTable('humans', {
    id: int().primaryKey({ autoIncrement: true }),
    uuid: text({ length: 36 }).unique().notNull(),
    firstname: text({ length: 100 }).notNull(),
    lastname: text({ length: 100 }).notNull(),
    birthdate: text({ length: 10 }).notNull(), // YYYY-MM-DD
});
export type Human = typeof humans.$inferSelect;

export const humansRelations = relations(humans, ({ many }) => ({
    passengers: many(passengers),
}));

export const passengers = sqliteTable('passengers', {
    id: int().primaryKey({ autoIncrement: true }),
    uuid: text({ length: 36 }).unique().notNull(),
    humanId: int()
        .references(() => humans.id, { onDelete: 'cascade' })
        .notNull(),
    seat: text({ length: 10 }).notNull(),
    class: text('class', { enum: ['economy', 'business', 'first'] }).notNull(),
    flightId: int()
        .references(() => flights.id)
        .notNull(),
});
export type Passenger = typeof passengers.$inferSelect;

export const passengersRelations = relations(passengers, ({ one, many }) => ({
    human: one(humans, {
        fields: [passengers.humanId],
        references: [humans.id],
    }),
    luggages: many(luggages),
}));

export const luggages = sqliteTable('luggages', {
    id: int().primaryKey({ autoIncrement: true }),
    uuid: text({ length: 36 }).unique().notNull(),
    passengerId: int()
        .references(() => passengers.id, { onDelete: 'cascade' })
        .notNull(),
    weight: int().notNull(),
    type: text('type', { enum: ['hand', 'checked'] }).notNull(),
    description: text({ length: 100 }).notNull(),
});
export type Luggage = typeof luggages.$inferSelect;
export type LuggageType = Luggage['type'];

export const luggagesRelations = relations(luggages, ({ one }) => ({
    passenger: one(passengers, {
        fields: [luggages.passengerId],
        references: [passengers.id],
    }),
}));

export const airports = sqliteTable('airports', {
    id: int().primaryKey({ autoIncrement: true }),
    uuid: text({ length: 36 }).unique().notNull(),
    icao: text({ length: 4 }).unique().notNull(),
    name: text({ length: 100 }).notNull(),
    country: text({ length: 100 }).notNull(),
});
export type Airport = typeof airports.$inferSelect;

export const flights = sqliteTable('flights', {
    id: int().primaryKey({ autoIncrement: true }),
    uuid: text({ length: 36 }).unique().notNull(),
    flightNumber: text({ length: 7 }).unique().notNull(),
    departureAirportId: int()
        .references(() => airports.id)
        .notNull(),
    arrivalAirportId: int()
        .references(() => airports.id)
        .notNull(),
    departureTime: text({ length: 25 }).notNull(), // timestamp
    arrivalTime: text({ length: 25 }).notNull(), // timestamp
    pilotId: int()
        .references(() => humans.id)
        .notNull(),
    copilotId: int()
        .references(() => humans.id)
        .notNull(),
    airlineId: int()
        .references(() => airlines.id)
        .notNull(),
    status: text('status', {
        enum: ['scheduled', 'boarding', 'departed', 'arrived', 'cancelled'],
    }).notNull(),
    aircraftId: text()
        .references(() => aircrafts.id)
        .notNull(),
});
export type Flight = typeof flights.$inferSelect;

export const flightsRelations = relations(flights, ({ one }) => ({
    arrivalAirport: one(airports, {
        fields: [flights.arrivalAirportId],
        references: [airports.id],
    }),
    departureAirport: one(airports, {
        fields: [flights.departureAirportId],
        references: [airports.id],
    }),
    pilot: one(humans, {
        fields: [flights.pilotId],
        references: [humans.id],
    }),
    copilot: one(humans, {
        fields: [flights.copilotId],
        references: [humans.id],
    }),
    airline: one(airlines, {
        fields: [flights.airlineId],
        references: [airlines.id],
    }),
    aircraft: one(aircrafts, {
        fields: [flights.aircraftId],
        references: [aircrafts.id],
    }),
}));

export const aircrafts = sqliteTable('aircrafts', {
    id: int().primaryKey({ autoIncrement: true }),
    uuid: text({ length: 36 }).unique().notNull(),
    icao: text({ length: 4 }).unique().notNull(), // ICAO code
    model: text({ length: 100 }).notNull(),
});
export type Aircraft = typeof aircrafts.$inferSelect;

export const airlines = sqliteTable('airlines', {
    id: int().primaryKey({ autoIncrement: true }),
    uuid: text({ length: 36 }).unique().notNull(),
    name: text({ length: 100 }).unique().notNull(),
});
export type Airline = typeof airlines.$inferSelect;
