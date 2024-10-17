import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";


export const humans = sqliteTable("humans", {
    id: int().primaryKey({ autoIncrement: true }),
    firstname: text({ length: 255 }).notNull(),
    lastname: text({ length: 255 }).notNull(),
    birthdate: text({ length: 10 }).notNull(), // YYYY-MM-DD
})

export const passengers = sqliteTable("passengers", {
    id: int().primaryKey({ autoIncrement: true }),
    humanId: int().references(() => humans.id).notNull(),
    seat: text({ length: 10 }).notNull(),
    class: text('class', { enum: ['economy', 'business', "first"] }).notNull(),
    flightId: int().references(() => flights.id).notNull(),
});

export const luggages = sqliteTable("luggages", {
    id: int().primaryKey({ autoIncrement: true }),
    passengerId: int().references(() => passengers.id).notNull(),
    weight: int().notNull(),
    type: text('type', { enum: ['hand', 'checked'] }).notNull(),
    description: text({ length: 255 }).notNull(),
});

export const airports = sqliteTable("airports", {
    id: text({ length: 4 }).primaryKey(), // ICAO code
    name: text({ length: 255 }).notNull(),
    country: text({ length: 255 }).notNull(),
});


export const flights = sqliteTable("flights", {
    id: int().primaryKey({ autoIncrement: true }),
    flightNumber: text({ length: 7 }).notNull(),
    departure: text().references(() => airports.id).notNull(),
    arrival: text().references(() => airports.id).notNull(),
    departureTime: text({ length: 25 }).notNull(), // timestamp
    arrivalTime: text({ length: 25 }).notNull(), // timestamp
    pilot: int().references(() => humans.id).notNull(),
    copilot: int().references(() => humans.id).notNull(),
    airline: int().references(() => airlines.id).notNull(),
    status: text('status', { enum: ['scheduled', 'boarding', 'departed', 'arrived', 'cancelled'] }).notNull(),
    aircraft: text().references(() => aircrafts.id).notNull(),
})

export const aircrafts = sqliteTable("aircrafts", {
    id: text({ length: 4 }).primaryKey(), // ICAO code
    model: text({ length: 255 }).notNull(),
});

export const airlines = sqliteTable("airlines", {
    id: int().primaryKey(),
    name: text({ length: 255 }).notNull(),
});