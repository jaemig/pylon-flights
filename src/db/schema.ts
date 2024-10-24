import { relations } from 'drizzle-orm';
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const humans = sqliteTable('humans', {
    id: text({ length: 36 }).primaryKey(),
    firstname: text({ length: 100 }).notNull(),
    lastname: text({ length: 100 }).notNull(),
    birthdate: text({ length: 10 }).notNull(), // YYYY-MM-DD
});
export type Human = typeof humans.$inferSelect;

export const humansRelations = relations(humans, ({ many }) => ({
    passengers: many(passengers),
}));

export const passengers = sqliteTable('passengers', {
    id: text({ length: 36 }).primaryKey(),
    humanId: text()
        .references(() => humans.id, { onDelete: 'cascade' })
        .notNull(),
    seat: text({ length: 10 }).notNull(),
    class: text('class', { enum: ['economy', 'business', 'first'] }).notNull(),
    flightId: text()
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
    flight: one(flights, {
        fields: [passengers.flightId],
        references: [flights.id],
    }),
}));

export const luggages = sqliteTable('luggages', {
    id: text({ length: 36 }).primaryKey(),
    passengerId: text()
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
    id: text({ length: 36 }).primaryKey(),
    icao: text({ length: 4 }).unique().notNull(),
    name: text({ length: 100 }).notNull(),
    country: text({ length: 100 }).notNull(),
});
export type Airport = typeof airports.$inferSelect;

export const flights = sqliteTable('flights', {
    id: text({ length: 36 }).primaryKey(),
    flightNumber: text({ length: 6 }).notNull(),
    departureAirportId: text()
        .references(() => airports.id)
        .notNull(),
    arrivalAirportId: text()
        .references(() => airports.id)
        .notNull(),
    departureTime: text({ length: 25 }).notNull(), // timestamp
    arrivalTime: text({ length: 25 }).notNull(), // timestamp
    pilotId: text()
        .references(() => humans.id)
        .notNull(),
    copilotId: text()
        .references(() => humans.id)
        .notNull(),
    airlineId: text()
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

export const flightsRelations = relations(flights, ({ one, many }) => ({
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
    passengers: many(passengers),
}));

export const aircrafts = sqliteTable('aircrafts', {
    id: text({ length: 36 }).primaryKey(),
    icao: text({ length: 4 }).unique().notNull(), // ICAO code
    model: text({ length: 100 }).notNull(),
});
export type Aircraft = typeof aircrafts.$inferSelect;

export const aircraftsRelations = relations(aircrafts, ({ many }) => ({
    flights: many(flights),
}));

export const airlines = sqliteTable('airlines', {
    id: text({ length: 36 }).primaryKey(),
    name: text({ length: 100 }).unique().notNull(),
});
export type Airline = typeof airlines.$inferSelect;

export const airlinesRelations = relations(airlines, ({ many }) => ({
    flights: many(flights),
}));
