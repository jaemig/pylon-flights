import { getEnv, ServiceError } from "@getcronit/pylon";
import { randomUUID } from "crypto";

import getDb from ".";
import { aircrafts, airlines, airports, flights, humans, luggages, passengers } from "./schema";


export default async function seed(secret: string) {
    if (getEnv().SEED_SECRET !== secret) {
        throw new ServiceError("Invalid seed secret", {
            statusCode: 401,
            code: "INVALID_SECRET"
        });
    }
    try {
        const db = getDb();

        await db.delete(luggages);
        await db.delete(passengers);
        await db.delete(flights);
        await db.delete(airports);
        await db.delete(aircrafts);
        await db.delete(airlines);
        await db.delete(humans);
        // Delete all sqlite_sequence entries to reset autoincrement counters
        await db.run(`
            DELETE FROM sqlite_sequence
        `)

        /**
         * AIRPORTS
         */
        const airportItems = new Map<string, { name: string, country: string }>([
            ['KATL', { name: 'Hartsfield-Jackson Atlanta International Airport', country: 'United States' }],
            ['ZBAA', { name: 'Beijing Capital International Airport', country: 'China' }],
            ['EHAM', { name: 'Amsterdam Airport Schiphol', country: 'Netherlands' }],
            ['EGLL', { name: 'London Heathrow Airport', country: 'United Kingdom' }],
            ['KLAX', { name: 'Los Angeles International Airport', country: 'United States' }],
            ['RJTT', { name: 'Tokyo Haneda Airport', country: 'Japan' }],
            ['LFPG', { name: 'Charles de Gaulle Airport', country: 'France' }],
            ['OMDB', { name: 'Dubai International Airport', country: 'United Arab Emirates' }],
            ['KSFO', { name: 'San Francisco International Airport', country: 'United States' }],
            ['CYYZ', { name: 'Toronto Pearson International Airport', country: 'Canada' }],
            ['KJFK', { name: 'John F. Kennedy International Airport', country: 'United States' }],
            ['YSSY', { name: 'Sydney Kingsford Smith International Airport', country: 'Australia' }],
            ['ZSPD', { name: 'Shanghai Pudong International Airport', country: 'China' }],
            ['EDDF', { name: 'Frankfurt am Main Airport', country: 'Germany' }],
            ['WSSS', { name: 'Singapore Changi Airport', country: 'Singapore' }],
            ['VHHH', { name: 'Hong Kong International Airport', country: 'Hong Kong' }],
            ['VIDP', { name: 'Indira Gandhi International Airport', country: 'India' }],
            ['LEMD', { name: 'Adolfo Suárez Madrid-Barajas Airport', country: 'Spain' }],
            ['EGCC', { name: 'Manchester Airport', country: 'United Kingdom' }],
            ['LSZH', { name: 'Zurich Airport', country: 'Switzerland' }],
            ['CYVR', { name: 'Vancouver International Airport', country: 'Canada' }],
            ['NZAA', { name: 'Auckland Airport', country: 'New Zealand' }],
            ['FAOR', { name: 'O. R. Tambo International Airport', country: 'South Africa' }],
            ['RKSI', { name: 'Incheon International Airport', country: 'South Korea' }],
            ['KORD', { name: 'Hare International Airport', country: 'United States' }],
            ['MMMX', { name: 'Mexico City International Airport', country: 'Mexico' }],
            ['LTBA', { name: 'Istanbul Atatürk Airport', country: 'Turkey' }],
            ['LEBL', { name: 'Barcelona-El Prat Airport', country: 'Spain' }],
            ['UUEE', { name: 'Sheremetyevo International Airport', country: 'Russia' }],
            ['BIKF', { name: 'Keflavík International Airport', country: 'Iceland' }],
            ['PHNL', { name: 'Daniel K. Inouye International Airport', country: 'United States' }],
            ['VTBS', { name: 'Suvarnabhumi Airport', country: 'Thailand' }],
            ['OMAA', { name: 'Abu Dhabi International Airport', country: 'United Arab Emirates' }],
            ['SBGR', { name: 'São Paulo/Guarulhos International Airport', country: 'Brazil' }],
            ['WIII', { name: 'Soekarno-Hatta International Airport', country: 'Indonesia' }],
            ['LPPT', { name: 'Lisbon Humberto Delgado Airport', country: 'Portugal' }],
            ['LGAV', { name: 'Athens International Airport', country: 'Greece' }],
            ['VTSP', { name: 'Phuket International Airport', country: 'Thailand' }],
            ['LSGG', { name: 'Geneva Airport', country: 'Switzerland' }],
            ['EBBR', { name: 'Brussels Airport', country: 'Belgium' }],
            ['LFBO', { name: 'Toulouse-Blagnac Airport', country: 'France' }],
            ['ZGGG', { name: 'Guangzhou Baiyun International Airport', country: 'China' }],
            ['RKPC', { name: 'Jeju International Airport', country: 'South Korea' }],
            ['LFML', { name: 'Marseille Provence Airport', country: 'France' }],
            ['BIRK', { name: 'Reykjavik Airport', country: 'Iceland' }],
            ['RJAA', { name: 'Narita International Airport', country: 'Japan' }],
            ['CYUL', { name: 'Montréal-Trudeau International Airport', country: 'Canada' }],
            ['KSEA', { name: 'Seattle-Tacoma International Airport', country: 'United States' }],
            ['VOBL', { name: 'Kempegowda International Airport', country: 'India' }],
            ['WADD', { name: 'Ngurah Rai International Airport', country: 'Indonesia' }],
            ['LSZB', { name: 'Bern Airport', country: 'Switzerland' }],
            ['EFHK', { name: 'Helsinki Airport', country: 'Finland' }],
            ['LIRF', { name: 'Rome-Fiumicino International Airport', country: 'Italy' }],
            ['EDDM', { name: 'Munich Airport', country: 'Germany' }],
            ['EPWA', { name: 'Warsaw Chopin Airport', country: 'Poland' }],
            ['LOWW', { name: 'Vienna International Airport', country: 'Austria' }],
            ['SBGL', { name: 'Rio de Janeiro-Galeão International Airport', country: 'Brazil' }],
            ['UUWW', { name: 'Vnukovo International Airport', country: 'Russia' }],
            ['MMUN', { name: 'Cancún International Airport', country: 'Mexico' }],
            ['FIMP', { name: 'Sir Seewoosagur Ramgoolam International Airport', country: 'Mauritius' }],
            ['OTHH', { name: 'Hamad International Airport', country: 'Qatar' }],
            ['WMKK', { name: 'Kuala Lumpur International Airport', country: 'Malaysia' }],
            ['RPLL', { name: 'Ninoy Aquino International Airport', country: 'Philippines' }],
            ['LPPR', { name: 'Francisco Sá Carneiro Airport', country: 'Portugal' }],
            ['DNMM', { name: 'Murtala Muhammed International Airport', country: 'Nigeria' }],
            ['ZUCK', { name: 'Chongqing Jiangbei International Airport', country: 'China' }],
            ['HECA', { name: 'Cairo International Airport', country: 'Egypt' }],
            ['YVRR', { name: 'Rockhampton Airport', country: 'Australia' }],
            ['MDSD', { name: 'Las Américas International Airport', country: 'Dominican Republic' }],
            ['MROC', { name: 'Juan Santamaría International Airport', country: 'Costa Rica' }],
            ['HKJK', { name: 'Jomo Kenyatta International Airport', country: 'Kenya' }],
            ['OKBK', { name: 'Kuwait International Airport', country: 'Kuwait' }],
            ['DIAP', { name: 'Port Bouet Airport', country: 'Ivory Coast' }],
            ['TJSJ', { name: 'Luis Muñoz Marín International Airport', country: 'Puerto Rico' }],
            ['SCEL', { name: 'Comodoro Arturo Merino Benítez International Airport', country: 'Chile' }],
            ['SABE', { name: 'Jorge Newbery Airfield', country: 'Argentina' }],
            ['FACT', { name: 'Cape Town International Airport', country: 'South Africa' }],
            ['ZSSS', { name: 'Shanghai Hongqiao International Airport', country: 'China' }],
            ['EIDW', { name: 'Dublin Airport', country: 'Ireland' }],
            ['OERK', { name: 'King Khalid International Airport', country: 'Saudi Arabia' }],
            ['VABB', { name: 'Chhatrapati Shivaji Maharaj International Airport', country: 'India' }],
            ['MGGT', { name: 'La Aurora International Airport', country: 'Guatemala' }],
            ['MDPC', { name: 'Punta Cana International Airport', country: 'Dominican Republic' }],
            ['SPIM', { name: 'Jorge Chávez International Airport', country: 'Peru' }],
            ['HAAB', { name: 'Addis Ababa Bole International Airport', country: 'Ethiopia' }],
            ['GMMN', { name: 'Mohammed V International Airport', country: 'Morocco' }],
            ['SEQM', { name: 'Mariscal Sucre International Airport', country: 'Ecuador' }],
            ['SKBO', { name: 'El Dorado International Airport', country: 'Colombia' }],
            ['RCTP', { name: 'Taiwan Taoyuan International Airport', country: 'Taiwan' }]
        ]);

        const airportValues = Array.from(airportItems.entries())
            .map(([id, { name, country }]) => `('${randomUUID()}', '${id}', '${name}', '${country}')`)
            .join(", ");

        await db.run(`
            INSERT INTO airports (uuid, icao, name, country) VALUES
            ${airportValues};
        `);

        /**
         * AIRCRAFTS
         */
        const aircraftItems = new Map<string, string>([
            ['A320', 'Airbus A320'],
            ['B737', 'Boeing 737'],
            ['A380', 'Airbus A380'],
            ['B747', 'Boeing 747'],
            ['A321', 'Airbus A321'],
            ['B777', 'Boeing 777'],
            ['A330', 'Airbus A330'],
            ['B787', 'Boeing 787 Dreamliner'],
            ['A350', 'Airbus A350'],
            ['CRJ9', 'Bombardier CRJ900'],
            ['ERJ1', 'Embraer ERJ-145'],
            ['E190', 'Embraer 190'],
            ['A220', 'Airbus A220'],
            ['B767', 'Boeing 767'],
            ['MD88', 'McDonnell Douglas MD-88'],
            ['B757', 'Boeing 757'],
            ['A340', 'Airbus A340'],
            ['DC10', 'McDonnell Douglas DC-10'],
            ['C130', 'Lockheed C-130 Hercules'],
            ['F100', 'Fokker 100'],
            ['BA46', 'British Aerospace 146'],
            ['E170', 'Embraer 170'],
            ['A318', 'Airbus A318'],
            ['B722', 'Boeing 727-200'],
            ['C208', 'Cessna 208 Caravan'],
            ['AN22', 'Antonov An-22'],
            ['AT72', 'ATR 72'],
            ['SU95', 'Sukhoi Superjet 100'],
            ['IL96', 'Ilyushin Il-96'],
            ['A319', 'Airbus A319'],
            ['L101', 'Lockheed L-1011 TriStar'],
            ['B732', 'Boeing 737-200'],
            ['CL60', 'Bombardier Challenger 600'],
            ['PC12', 'Pilatus PC-12'],
            ['B748', 'Boeing 747-8'],
            ['DH8D', 'Bombardier Dash 8 Q400'],
            ['A225', 'Antonov An-225 Mriya'],
            ['A333', 'Airbus A330-300'],
            ['E195', 'Embraer 195'],
            ['B764', 'Boeing 767-400'],
            ['CONC', 'Aerospatiale/BAC Concorde'],
            ['IL76', 'Ilyushin Il-76'],
            ['MD90', 'McDonnell Douglas MD-90'],
            ['DC93', 'McDonnell Douglas DC-9-30'],
            ['B38M', 'Boeing 737 MAX 8'],
            ['A338', 'Airbus A330-800'],
            ['C17', 'Boeing C-17 Globemaster III'],
            ['SU27', 'Sukhoi Su-27'],
            ['TU95', 'Tupolev Tu-95 Bear'],
            ['GLEX', 'Bombardier Global Express'],
            ['A339', 'Airbus A330'],
            ['AN72', 'Antonov An-72'],
            ['B789', 'Boeing 787-10 Dreamliner'],
            ['A346', 'Airbus A340-600'],
            ['DH82', 'de Havilland Tiger Moth'],
            ['B703', 'Boeing 707-300'],
            ['L39', 'Aero L-39 Albatros'],
            ['CRJ7', 'Bombardier CRJ700'],
            ['DC87', 'McDonnell Douglas DC-8-73'],
            ['F50', 'Fokker 50'],
            ['TBM9', 'Daher TBM 900'],
            ['C525', 'Cessna CitationJet CJ1'],
            ['A148', 'Antonov An-148'],
            ['B350', 'Beechcraft King Air 350'],
            ['A345', 'Airbus A340-500'],
            ['IL18', 'Ilyushin Il-18'],
            ['DHC6', 'de Havilland Canada DHC-6 Twin Otter'],
            ['L410', 'Let L-410 Turbolet'],
            ['C17G', 'Boeing C-17 Globemaster III'],
            ['AN12', 'Antonov An-12'],
            ['A359', 'Airbus A350-900'],
            ['AT45', 'ATR 42-500'],
            ['E75S', 'Embraer 175 STD'],
            ['C680', 'Cessna Citation Sovereign'],
            ['IL62', 'Ilyushin Il-62'],
            ['A32N', 'Airbus A320neo'],
            ['B736', 'Boeing 737-600'],
            ['B77W', 'Boeing 777-300ER'],
            ['A35K', 'Airbus A350-1000'],
            ['CRJ2', 'Bombardier CRJ200'],
            ['E75L', 'Embraer 175 LR'],
            ['C40A', 'Boeing C-40 Clipper'],
            ['CL30', 'Bombardier Challenger 300']
        ]);

        const aircraftValues = Array.from(aircraftItems.entries())
            .map(([id, model]) => `('${randomUUID()}', '${id}', '${model}')`)
            .join(", ");

        await db.run(`
            INSERT INTO aircrafts (uuid, icao, model) VALUES
            ${aircraftValues};
        `);

        /**
         * HUMANS
         */
        const humanItems = [
            { firstname: 'John', lastname: 'Doe', birthdate: '1985-06-15' },
            { firstname: 'Jane', lastname: 'Smith', birthdate: '1990-09-20' },
            { firstname: 'Alice', lastname: 'Johnson', birthdate: '1982-12-01' },
            { firstname: 'Bob', lastname: 'Williams', birthdate: '1979-03-10' },
            { firstname: 'Charlie', lastname: 'Brown', birthdate: '1995-07-07' },
            { firstname: 'David', lastname: 'Miller', birthdate: '2000-11-30' },
            { firstname: 'Eve', lastname: 'Davis', birthdate: '1992-04-17' },
            { firstname: 'Frank', lastname: 'Garcia', birthdate: '1987-08-25' },
            { firstname: 'Grace', lastname: 'Martinez', birthdate: '1994-01-22' },
            { firstname: 'Hank', lastname: 'Rodriguez', birthdate: '1980-05-19' },
            { firstname: 'Ivy', lastname: 'Wilson', birthdate: '1975-10-14' },
            { firstname: 'Jack', lastname: 'Lopez', birthdate: '1983-02-23' },
            { firstname: 'Karen', lastname: 'Martinez', birthdate: '1996-07-11' },
            { firstname: 'Leo', lastname: 'Harris', birthdate: '1988-09-05' },
            { firstname: 'Mia', lastname: 'Clark', birthdate: '1991-03-29' },
            { firstname: 'Nina', lastname: 'Lewis', birthdate: '1986-06-30' },
            { firstname: 'Oscar', lastname: 'Robinson', birthdate: '1998-12-19' },
            { firstname: 'Paul', lastname: 'Walker', birthdate: '1999-01-13' },
            { firstname: 'Quincy', lastname: 'Young', birthdate: '1978-09-25' },
            { firstname: 'Rachel', lastname: 'King', birthdate: '1997-04-06' },
            { firstname: 'Sam', lastname: 'Scott', birthdate: '1989-08-16' },
            { firstname: 'Tina', lastname: 'Green', birthdate: '1981-02-12' },
            { firstname: 'Uma', lastname: 'Baker', birthdate: '1980-10-27' },
            { firstname: 'Victor', lastname: 'Adams', birthdate: '1990-12-18' },
            { firstname: 'Wendy', lastname: 'Campbell', birthdate: '1984-11-02' },
            { firstname: 'Xander', lastname: 'Mitchell', birthdate: '1977-05-23' },
            { firstname: 'Yara', lastname: 'Perez', birthdate: '1992-08-31' },
            { firstname: 'Zane', lastname: 'Roberts', birthdate: '1986-06-20' },
            { firstname: 'Aiden', lastname: 'Turner', birthdate: '1993-09-17' },
            { firstname: 'Bella', lastname: 'Phillips', birthdate: '1995-10-03' },
            { firstname: 'Carter', lastname: 'Evans', birthdate: '1987-07-09' },
            { firstname: 'Diana', lastname: 'Morris', birthdate: '1982-01-26' },
            { firstname: 'Elena', lastname: 'Nelson', birthdate: '1976-05-01' },
            { firstname: 'Felix', lastname: 'Carter', birthdate: '1994-06-12' },
            { firstname: 'Georgia', lastname: 'Murphy', birthdate: '1991-11-15' },
            { firstname: 'Henry', lastname: 'Perry', birthdate: '1985-09-08' },
            { firstname: 'Isla', lastname: 'Long', birthdate: '1979-03-30' },
            { firstname: 'Jacob', lastname: 'Bell', birthdate: '1999-12-27' },
            { firstname: 'Kevin', lastname: 'Foster', birthdate: '1988-02-14' },
            { firstname: 'Lila', lastname: 'Gonzalez', birthdate: '1996-08-19' },
            { firstname: 'Mason', lastname: 'Reed', birthdate: '1983-07-22' },
            { firstname: 'Nora', lastname: 'Bailey', birthdate: '1975-12-09' },
            { firstname: 'Owen', lastname: 'Cruz', birthdate: '1997-11-11' },
            { firstname: 'Piper', lastname: 'Rivera', birthdate: '1981-04-05' },
            { firstname: 'Quinn', lastname: 'Sanders', birthdate: '1990-06-26' },
            { firstname: 'Riley', lastname: 'Patel', birthdate: '1986-10-01' },
            { firstname: 'Sophie', lastname: 'Wood', birthdate: '1992-07-28' },
            { firstname: 'Thomas', lastname: 'Brooks', birthdate: '1993-03-12' },
            { firstname: 'Ursula', lastname: 'Edwards', birthdate: '1984-09-29' },
            { firstname: 'Vince', lastname: 'Gray', birthdate: '1995-05-25' },
            { firstname: 'Willow', lastname: 'James', birthdate: '1978-02-09' },
            { firstname: 'Xena', lastname: 'Torres', birthdate: '1989-12-15' },
            { firstname: 'Yusuf', lastname: 'Bennett', birthdate: '1991-10-07' },
            { firstname: 'Zoe', lastname: 'Howard', birthdate: '1996-06-02' },
            { firstname: 'Avery', lastname: 'Cox', birthdate: '1980-11-17' },
            { firstname: 'Brady', lastname: 'Ward', birthdate: '1987-01-08' },
            { firstname: 'Chloe', lastname: 'Flores', birthdate: '1983-08-13' },
            { firstname: 'Declan', lastname: 'Powell', birthdate: '1994-04-29' },
            { firstname: 'Ellie', lastname: 'Ramirez', birthdate: '1976-10-23' },
            { firstname: 'Finn', lastname: 'Washington', birthdate: '1999-07-18' },
            { firstname: 'Gavin', lastname: 'Butler', birthdate: '1979-03-07' },
            { firstname: 'Hazel', lastname: 'Jenkins', birthdate: '1998-11-04' },
            { firstname: 'Isaac', lastname: 'Perry', birthdate: '1985-04-09' },
            { firstname: 'Jade', lastname: 'Bryant', birthdate: '1993-02-25' },
            { firstname: 'Kai', lastname: 'Griffin', birthdate: '1981-06-13' },
            { firstname: 'Liam', lastname: 'Hayes', birthdate: '1975-09-18' },
            { firstname: 'Maya', lastname: 'Foster', birthdate: '1986-08-06' },
            { firstname: 'Nico', lastname: 'Coleman', birthdate: '1997-12-21' },
            { firstname: 'Olivia', lastname: 'Jenkins', birthdate: '1984-05-17' },
            { firstname: 'Patrick', lastname: 'Bailey', birthdate: '1990-03-03' },
            { firstname: 'Riley', lastname: 'Martinez', birthdate: '1983-12-04' },
            { firstname: 'Scarlett', lastname: 'Peterson', birthdate: '1995-02-10' },
            { firstname: 'Tristan', lastname: 'Price', birthdate: '1977-09-27' },
            { firstname: 'Uma', lastname: 'Kim', birthdate: '1988-06-21' },
            { firstname: 'Vivian', lastname: 'Lee', birthdate: '1976-01-15' },
            { firstname: 'Wes', lastname: 'Morris', birthdate: '1982-11-09' },
            { firstname: 'Xena', lastname: 'Parker', birthdate: '1990-07-04' },
            { firstname: 'Yvonne', lastname: 'Mitchell', birthdate: '1987-05-06' },
            { firstname: 'Zack', lastname: 'Reed', birthdate: '1999-08-30' },
            { firstname: 'Abby', lastname: 'Cruz', birthdate: '1996-04-18' }
        ];

        const humanValues = humanItems
            .map(({ firstname, lastname, birthdate }) => `('${randomUUID()}', '${firstname}', '${lastname}', '${birthdate}')`)
            .join(", ");

        await db.run(`
            INSERT INTO humans (uuid, firstname, lastname, birthdate) VALUES
            ${humanValues};
        `);

        /**
         * AIRLINES
         */
        const airlineItems = [
            'American Airlines',
            'Delta Air Lines',
            'United Airlines',
            'Southwest Airlines',
            'Lufthansa',
            'Air France',
            'British Airways',
            'Emirates',
            'Qatar Airways',
            'Singapore Airlines',
            'Cathay Pacific',
            'Japan Airlines',
            'KLM Royal Dutch Airlines',
            'Turkish Airlines',
            'Qantas',
            'Aeroflot',
            'Air Canada',
            'Etihad Airways',
            'Alitalia',
            'Iberia',
            'Air New Zealand',
            'China Southern Airlines',
            'China Eastern Airlines',
            'Hainan Airlines',
            'Eva Air',
            'Malaysia Airlines',
            'Thai Airways',
            'Finnair',
            'Swiss International Air Lines',
            'Austrian Airlines',
            'Scandinavian Airlines',
            'Virgin Atlantic',
            'Korean Air',
            'Asiana Airlines',
            'LATAM Airlines',
            'Avianca',
            'Copa Airlines',
            'Aeromexico',
            'Volaris',
            'WestJet',
            'Ryanair',
            'easyJet',
            'JetBlue Airways',
            'Spirit Airlines',
            'Alaska Airlines',
            'Hawaiian Airlines',
            'AirAsia',
            'IndiGo',
            'Jet Airways',
            'SpiceJet',
            'Vistara',
            'GoAir',
            'Saudi Arabian Airlines',
            'EgyptAir',
            'Kenya Airways',
            'South African Airways',
            'Ethiopian Airlines',
            'Royal Air Maroc',
            'TAP Air Portugal',
            'Air Serbia',
            'Croatia Airlines',
            'LOT Polish Airlines',
            'Brussels Airlines',
            'Icelandair',
            'Norwegian Air Shuttle',
            'SAS Scandinavian Airlines',
            'Aegean Airlines',
            'Aer Lingus',
            'TUI Airways',
            'Wizz Air',
            'Pegasus Airlines',
            'Flydubai',
            'AirBaltic',
            'Vietnam Airlines',
            'Philippine Airlines',
            'Garuda Indonesia',
            'SriLankan Airlines',
            'Bangkok Airways',
            'Bamboo Airways',
            'Scoot',
            'Royal Jordanian',
            'Gulf Air',
            'Oman Air',
            'Fiji Airways',
            'Air Mauritius',
            'RwandAir',
            'Azul Brazilian Airlines',
            'GOL Linhas Aéreas',
            'TAME',
            'Aerolíneas Argentinas',
            'Sky Airline',
            'Air Panama',
            'JetSMART',
            'Flair Airlines',
            'Sunwing Airlines',
            'Palmerston North Airlines',
            'Solomon Airlines',
            'Belavia',
            'Air Malta',
            'Air Greenland'
        ];

        const airlineValues = airlineItems
            .map(name => `('${randomUUID()}', '${name}')`)
            .join(", ");

        await db.run(`
            INSERT INTO airlines (uuid, name) VALUES
            ${airlineValues};
        `);

        /**
         * FLIGHTS
         */
        const flightItems = [
            {
                flightNumber: 'AA1234',
                departureAirportId: 1, // KATL
                arrivalAirportId: 2, // KLAX
                departureTime: '2023-10-01T08:00:00Z',
                arrivalTime: '2023-10-01T11:00:00Z',
                pilot: 1,
                copilot: 2,
                airline: 1,
                status: 'scheduled',
                aircraftId: 1 // A320
            },
            {
                flightNumber: 'DL5678',
                departureAirportId: 3, // EHAM
                arrivalAirportId: 4, // EGLL
                departureTime: '2023-10-02T09:00:00Z',
                arrivalTime: '2023-10-02T10:00:00Z',
                pilot: 3,
                copilot: 4,
                airline: 2,
                status: 'boarding',
                aircraftId: 2 // B737
            },
            {
                flightNumber: 'UA9101',
                departureAirportId: 5, // ZBAA
                arrivalAirportId: 6, // RJTT
                departureTime: '2023-10-03T10:00:00Z',
                arrivalTime: '2023-10-03T14:00:00Z',
                pilot: 5,
                copilot: 6,
                airline: 3,
                status: 'departed',
                aircraftId: 3 // A380
            },
            {
                flightNumber: 'SW2345',
                departureAirportId: 7, // LFPG
                arrivalAirportId: 8, // OMDB
                departureTime: '2023-10-04T11:00:00Z',
                arrivalTime: '2023-10-04T15:00:00Z',
                pilot: 7,
                copilot: 8,
                airline: 4,
                status: 'arrived',
                aircraftId: 4 // B747
            },
            {
                flightNumber: 'LH6789',
                departureAirportId: 9, // KSFO
                arrivalAirportId: 10, // CYYZ
                departureTime: '2023-10-05T12:00:00Z',
                arrivalTime: '2023-10-05T16:00:00Z',
                pilot: 9,
                copilot: 10,
                airline: 5,
                status: 'cancelled',
                aircraftId: 5 // A321
            },
            {
                flightNumber: 'AF3456',
                departureAirportId: 11, // KJFK
                arrivalAirportId: 12, // YSSY
                departureTime: '2023-10-06T13:00:00Z',
                arrivalTime: '2023-10-07T03:00:00Z',
                pilot: 11,
                copilot: 12,
                airline: 6,
                status: 'scheduled',
                aircraftId: 6 // B777
            },
            {
                flightNumber: 'BA7890',
                departureAirportId: 13, // ZSPD
                arrivalAirportId: 14, // EDDF
                departureTime: '2023-10-07T14:00:00Z',
                arrivalTime: '2023-10-07T18:00:00Z',
                pilot: 13,
                copilot: 14,
                airline: 7,
                status: 'boarding',
                aircraftId: 7 // A330
            },
            {
                flightNumber: 'EK1234',
                departureAirportId: 15, // WSSS
                arrivalAirportId: 16, // VHHH
                departureTime: '2023-10-08T15:00:00Z',
                arrivalTime: '2023-10-08T17:00:00Z',
                pilot: 15,
                copilot: 16,
                airline: 8,
                status: 'departed',
                aircraftId: 8 // B787
            },
            {
                flightNumber: 'QR5678',
                departureAirportId: 17, // VIDP
                arrivalAirportId: 18, // LEMD
                departureTime: '2023-10-09T16:00:00Z',
                arrivalTime: '2023-10-09T20:00:00Z',
                pilot: 17,
                copilot: 18,
                airline: 9,
                status: 'arrived',
                aircraftId: 9 // A350
            },
            {
                flightNumber: 'SQ9101',
                departureAirportId: 19, // EGCC
                arrivalAirportId: 20, // LSZH
                departureTime: '2023-10-10T17:00:00Z',
                arrivalTime: '2023-10-10T19:00:00Z',
                pilot: 19,
                copilot: 20,
                airline: 10,
                status: 'cancelled',
                aircraftId: 3 // A380
            },
            {
                flightNumber: 'CX2345',
                departureAirportId: 21, // CYVR
                arrivalAirportId: 22, // NZAA
                departureTime: '2023-10-11T18:00:00Z',
                arrivalTime: '2023-10-12T06:00:00Z',
                pilot: 21,
                copilot: 22,
                airline: 11,
                status: 'scheduled',
                aircraftId: 4 // B747
            },
            {
                flightNumber: 'JL6789',
                departureAirportId: 23, // FAOR
                arrivalAirportId: 24, // RKSI
                departureTime: '2023-10-12T19:00:00Z',
                arrivalTime: '2023-10-13T07:00:00Z',
                pilot: 23,
                copilot: 24,
                airline: 12,
                status: 'boarding',
                aircraftId: 9 // A350
            },
            {
                flightNumber: 'KL3456',
                departureAirportId: 25, // KORD
                arrivalAirportId: 26, // MMMX
                departureTime: '2023-10-13T20:00:00Z',
                arrivalTime: '2023-10-13T23:00:00Z',
                pilot: 25,
                copilot: 26,
                airline: 13,
                status: 'departed',
                aircraftId: 6 // B777
            },
            {
                flightNumber: 'LH7890',
                departureAirportId: 27, // LTBA
                arrivalAirportId: 28, // LEBL
                departureTime: '2023-10-14T21:00:00Z',
                arrivalTime: '2023-10-14T23:00:00Z',
                pilot: 27,
                copilot: 28,
                airline: 14,
                status: 'arrived',
                aircraftId: 1 // A320
            },
            {
                flightNumber: 'AF1234',
                departureAirportId: 29, // UUEE
                arrivalAirportId: 30, // BIKF
                departureTime: '2023-10-15T22:00:00Z',
                arrivalTime: '2023-10-16T01:00:00Z',
                pilot: 29,
                copilot: 30,
                airline: 15,
                status: 'cancelled',
                aircraftId: 2 // B737
            }
        ];

        const flightValues = flightItems
            .map(({ flightNumber, departureAirportId, arrivalAirportId, departureTime, arrivalTime, pilot, copilot, airline, status, aircraftId }) =>
                `('${randomUUID()}', '${flightNumber}', '${departureAirportId}', '${arrivalAirportId}', '${departureTime}', '${arrivalTime}', ${pilot}, ${copilot}, ${airline}, '${status}', '${aircraftId}')`
            )
            .join(", ");

        await db.run(`
            INSERT INTO flights (uuid, flightNumber, departureAirportId, arrivalAirportId, departureTime, arrivalTime, pilot, copilot, airline, status, aircraftId) VALUES
            ${flightValues};
        `);

        /**
         * PASSENGERS
         */
        const passengerItems = [
            { humanId: 1, seat: '12A', class: 'economy', flightId: 1 },
            { humanId: 2, seat: '12B', class: 'economy', flightId: 1 },
            { humanId: 3, seat: '1A', class: 'first', flightId: 2 },
            { humanId: 4, seat: '1B', class: 'first', flightId: 2 },
            { humanId: 5, seat: '5A', class: 'business', flightId: 3 },
            { humanId: 6, seat: '5B', class: 'business', flightId: 3 },
            { humanId: 7, seat: '20A', class: 'economy', flightId: 4 },
            { humanId: 8, seat: '20B', class: 'economy', flightId: 4 },
            { humanId: 9, seat: '2A', class: 'first', flightId: 5 },
            { humanId: 10, seat: '2B', class: 'first', flightId: 5 },
            { humanId: 11, seat: '15A', class: 'economy', flightId: 6 },
            { humanId: 12, seat: '15B', class: 'economy', flightId: 6 },
            { humanId: 13, seat: '3A', class: 'business', flightId: 7 },
            { humanId: 14, seat: '3B', class: 'business', flightId: 7 },
            { humanId: 15, seat: '18A', class: 'economy', flightId: 8 },
            { humanId: 16, seat: '18B', class: 'economy', flightId: 8 },
            { humanId: 17, seat: '4A', class: 'first', flightId: 9 },
            { humanId: 18, seat: '4B', class: 'first', flightId: 9 },
            { humanId: 19, seat: '6A', class: 'business', flightId: 10 },
            { humanId: 20, seat: '6B', class: 'business', flightId: 10 },
            { humanId: 21, seat: '22A', class: 'economy', flightId: 11 },
            { humanId: 22, seat: '22B', class: 'economy', flightId: 11 },
            { humanId: 23, seat: '7A', class: 'first', flightId: 12 },
            { humanId: 24, seat: '7B', class: 'first', flightId: 12 },
            { humanId: 25, seat: '9A', class: 'business', flightId: 13 },
            { humanId: 26, seat: '9B', class: 'business', flightId: 13 },
            { humanId: 27, seat: '24A', class: 'economy', flightId: 14 },
            { humanId: 28, seat: '24B', class: 'economy', flightId: 14 },
            { humanId: 29, seat: '8A', class: 'first', flightId: 15 },
            { humanId: 30, seat: '8B', class: 'first', flightId: 15 },
            { humanId: 31, seat: '10A', class: 'business', flightId: 1 },
            { humanId: 32, seat: '10B', class: 'business', flightId: 1 },
            { humanId: 33, seat: '11A', class: 'economy', flightId: 2 },
            { humanId: 34, seat: '11B', class: 'economy', flightId: 2 },
            { humanId: 35, seat: '6A', class: 'business', flightId: 3 },
            { humanId: 36, seat: '6B', class: 'business', flightId: 3 },
            { humanId: 37, seat: '21A', class: 'economy', flightId: 4 },
            { humanId: 38, seat: '21B', class: 'economy', flightId: 4 },
            { humanId: 39, seat: '3A', class: 'first', flightId: 5 },
            { humanId: 40, seat: '3B', class: 'first', flightId: 5 },
            { humanId: 41, seat: '16A', class: 'economy', flightId: 6 },
            { humanId: 42, seat: '16B', class: 'economy', flightId: 6 },
            { humanId: 43, seat: '4A', class: 'business', flightId: 7 },
            { humanId: 44, seat: '4B', class: 'business', flightId: 7 },
            { humanId: 45, seat: '19A', class: 'economy', flightId: 8 },
            { humanId: 46, seat: '19B', class: 'economy', flightId: 8 },
            { humanId: 47, seat: '5A', class: 'first', flightId: 9 },
            { humanId: 48, seat: '5B', class: 'first', flightId: 9 },
            { humanId: 49, seat: '7A', class: 'business', flightId: 10 },
            { humanId: 50, seat: '7B', class: 'business', flightId: 10 },
            { humanId: 51, seat: '23A', class: 'economy', flightId: 11 },
            { humanId: 52, seat: '23B', class: 'economy', flightId: 11 },
            { humanId: 53, seat: '8A', class: 'first', flightId: 12 },
            { humanId: 54, seat: '8B', class: 'first', flightId: 12 },
            { humanId: 55, seat: '10A', class: 'business', flightId: 13 },
            { humanId: 56, seat: '10B', class: 'business', flightId: 13 },
            { humanId: 57, seat: '25A', class: 'economy', flightId: 14 },
            { humanId: 58, seat: '25B', class: 'economy', flightId: 14 },
            { humanId: 59, seat: '9A', class: 'first', flightId: 15 },
            { humanId: 60, seat: '9B', class: 'first', flightId: 15 },
            { humanId: 61, seat: '11A', class: 'economy', flightId: 1 },
            { humanId: 62, seat: '11B', class: 'economy', flightId: 1 },
            { humanId: 63, seat: '2A', class: 'first', flightId: 2 },
            { humanId: 64, seat: '2B', class: 'first', flightId: 2 },
            { humanId: 65, seat: '6A', class: 'business', flightId: 3 },
            { humanId: 66, seat: '6B', class: 'business', flightId: 3 },
            { humanId: 67, seat: '21A', class: 'economy', flightId: 4 },
            { humanId: 68, seat: '21B', class: 'economy', flightId: 4 },
            { humanId: 69, seat: '3A', class: 'first', flightId: 5 },
            { humanId: 70, seat: '3B', class: 'first', flightId: 5 },
            { humanId: 71, seat: '16A', class: 'economy', flightId: 6 },
            { humanId: 72, seat: '16B', class: 'economy', flightId: 6 },
            { humanId: 73, seat: '4A', class: 'business', flightId: 7 },
            { humanId: 74, seat: '4B', class: 'business', flightId: 7 },
            { humanId: 75, seat: '19A', class: 'economy', flightId: 8 },
            { humanId: 76, seat: '19B', class: 'economy', flightId: 8 },
            { humanId: 77, seat: '5A', class: 'first', flightId: 9 },
            { humanId: 78, seat: '5B', class: 'first', flightId: 9 },
            { humanId: 79, seat: '7A', class: 'business', flightId: 10 },
            { humanId: 80, seat: '7B', class: 'business', flightId: 10 },
            // { humanId: 81, seat: '23A', class: 'economy', flightId: 11 },
            // { humanId: 82, seat: '23B', class: 'economy', flightId: 11 },
            // { humanId: 83, seat: '8A', class: 'first', flightId: 12 },
            // { humanId: 84, seat: '8B', class: 'first', flightId: 12 },
            // { humanId: 85, seat: '10A', class: 'business', flightId: 13 },
            // { humanId: 86, seat: '10B', class: 'business', flightId: 13 },
            // { humanId: 87, seat: '25A', class: 'economy', flightId: 14 },
            // { humanId: 88, seat: '25B', class: 'economy', flightId: 14 },
            // { humanId: 89, seat: '9A', class: 'first', flightId: 15 },
            // { humanId: 90, seat: '9B', class: 'first', flightId: 15 },
            // { humanId: 91, seat: '12A', class: 'economy', flightId: 1 },
            // { humanId: 92, seat: '12B', class: 'economy', flightId: 1 },
            // { humanId: 93, seat: '1A', class: 'first', flightId: 2 },
            // { humanId: 94, seat: '1B', class: 'first', flightId: 2 },
            // { humanId: 95, seat: '5A', class: 'business', flightId: 3 },
            // { humanId: 96, seat: '5B', class: 'business', flightId: 3 },
            // { humanId: 97, seat: '20A', class: 'economy', flightId: 4 },
            // { humanId: 98, seat: '20B', class: 'economy', flightId: 4 },
            // { humanId: 99, seat: '2A', class: 'first', flightId: 5 },
            // { humanId: 100, seat: '2B', class: 'first', flightId: 5 }
        ];

        const passengerValues = passengerItems
            .map(({ humanId, seat, class: seatClass, flightId }) => `('${randomUUID()}', ${humanId}, '${seat}', '${seatClass}', ${flightId})`)
            .join(", ");

        await db.run(`
            INSERT INTO passengers (uuid, humanId, seat, class, flightId) VALUES
            ${passengerValues};
        `);

        /**
         * LUGGAGES
         */
        const luggageItems = [
            { passengerId: 1, weight: 15, type: 'hand', description: 'Black carry-on suitcase' },
            { passengerId: 2, weight: 25, type: 'checked', description: 'Large blue suitcase' },
            { passengerId: 3, weight: 12, type: 'hand', description: 'Grey backpack with electronics' },
            { passengerId: 1, weight: 28, type: 'checked', description: 'Red checked luggage' },
            { passengerId: 4, weight: 20, type: 'checked', description: 'Green hard-shell suitcase' },
            { passengerId: 5, weight: 8, type: 'hand', description: 'Small duffel bag' },
            { passengerId: 6, weight: 18, type: 'hand', description: 'Brown leather briefcase' },
            { passengerId: 7, weight: 22, type: 'checked', description: 'Black large suitcase' },
            { passengerId: 8, weight: 10, type: 'hand', description: 'White canvas tote bag' },
            { passengerId: 9, weight: 30, type: 'checked', description: 'Oversized orange suitcase' },
            { passengerId: 10, weight: 5, type: 'hand', description: 'Blue gym bag' },
            { passengerId: 11, weight: 12, type: 'hand', description: 'Pink backpack with flowers' },
            { passengerId: 12, weight: 35, type: 'checked', description: 'Gray oversized luggage' },
            { passengerId: 13, weight: 17, type: 'hand', description: 'Black leather duffel' },
            { passengerId: 14, weight: 20, type: 'checked', description: 'White suitcase with stickers' },
            { passengerId: 15, weight: 9, type: 'hand', description: 'Small green backpack' },
            { passengerId: 16, weight: 15, type: 'hand', description: 'Black carry-on with laptop' },
            { passengerId: 17, weight: 40, type: 'checked', description: 'Blue oversized luggage' },
            { passengerId: 18, weight: 7, type: 'hand', description: 'Purple duffel bag' },
            { passengerId: 19, weight: 22, type: 'checked', description: 'Large pink suitcase' },
            { passengerId: 20, weight: 11, type: 'hand', description: 'Orange carry-on' },
            { passengerId: 21, weight: 28, type: 'checked', description: 'Green large suitcase' },
            { passengerId: 22, weight: 13, type: 'hand', description: 'Black rolling suitcase' },
            { passengerId: 23, weight: 35, type: 'checked', description: 'Yellow oversized luggage' },
            { passengerId: 24, weight: 19, type: 'checked', description: 'Dark red suitcase' },
            { passengerId: 25, weight: 7, type: 'hand', description: 'Black duffel with shoes' },
            { passengerId: 26, weight: 10, type: 'hand', description: 'Blue carry-on suitcase' },
            { passengerId: 27, weight: 38, type: 'checked', description: 'Extra-large silver suitcase' },
            { passengerId: 28, weight: 5, type: 'hand', description: 'Yellow backpack with books' },
            { passengerId: 29, weight: 22, type: 'checked', description: 'Medium brown suitcase' },
            { passengerId: 30, weight: 14, type: 'hand', description: 'White leather briefcase' },
            { passengerId: 31, weight: 29, type: 'checked', description: 'Blue hard-shell luggage' },
            { passengerId: 32, weight: 16, type: 'hand', description: 'Green rolling suitcase' },
            { passengerId: 33, weight: 20, type: 'checked', description: 'Large yellow suitcase' },
            { passengerId: 34, weight: 10, type: 'hand', description: 'Black leather carry-on' },
            { passengerId: 35, weight: 32, type: 'checked', description: 'Brown hard-shell luggage' },
            { passengerId: 36, weight: 18, type: 'hand', description: 'Silver carry-on suitcase' },
            { passengerId: 37, weight: 40, type: 'checked', description: 'Large purple suitcase' },
            { passengerId: 38, weight: 8, type: 'hand', description: 'Red backpack with straps' },
            { passengerId: 39, weight: 21, type: 'checked', description: 'Black large suitcase' },
            { passengerId: 40, weight: 12, type: 'hand', description: 'Pink duffel with flowers' },
            { passengerId: 41, weight: 33, type: 'checked', description: 'Gray oversized luggage' },
            { passengerId: 42, weight: 15, type: 'hand', description: 'Blue carry-on suitcase' },
            { passengerId: 43, weight: 25, type: 'checked', description: 'Green checked luggage' },
            { passengerId: 44, weight: 19, type: 'hand', description: 'Black rolling suitcase' },
            { passengerId: 45, weight: 37, type: 'checked', description: 'Large silver suitcase' },
            { passengerId: 46, weight: 6, type: 'hand', description: 'Orange backpack' },
            { passengerId: 47, weight: 27, type: 'checked', description: 'White oversized suitcase' },
            { passengerId: 48, weight: 14, type: 'hand', description: 'Black briefcase' },
            { passengerId: 49, weight: 39, type: 'checked', description: 'Extra-large black suitcase' },
            { passengerId: 50, weight: 5, type: 'hand', description: 'Yellow gym bag' },
            { passengerId: 51, weight: 23, type: 'checked', description: 'Brown large suitcase' },
            { passengerId: 52, weight: 9, type: 'hand', description: 'Black duffel with camera' },
            { passengerId: 53, weight: 32, type: 'checked', description: 'Blue hard-shell suitcase' },
            { passengerId: 54, weight: 16, type: 'hand', description: 'Red rolling suitcase' },
            { passengerId: 55, weight: 20, type: 'checked', description: 'Green oversized luggage' },
            { passengerId: 56, weight: 11, type: 'hand', description: 'White leather backpack' },
            { passengerId: 57, weight: 34, type: 'checked', description: 'Black large suitcase' },
            { passengerId: 58, weight: 8, type: 'hand', description: 'Blue duffel with clothes' },
            { passengerId: 59, weight: 38, type: 'checked', description: 'Yellow oversized suitcase' },
            { passengerId: 60, weight: 12, type: 'hand', description: 'Black carry-on with books' },
            { passengerId: 61, weight: 24, type: 'checked', description: 'Purple hard-shell suitcase' },
            { passengerId: 62, weight: 14, type: 'hand', description: 'Pink leather backpack' },
            { passengerId: 63, weight: 21, type: 'checked', description: 'Large gray suitcase' },
            { passengerId: 64, weight: 19, type: 'hand', description: 'Black carry-on with charger' },
            { passengerId: 65, weight: 36, type: 'checked', description: 'Extra-large green suitcase' },
            { passengerId: 66, weight: 6, type: 'hand', description: 'Orange tote bag' },
            { passengerId: 67, weight: 25, type: 'checked', description: 'Blue oversized suitcase' },
            { passengerId: 68, weight: 10, type: 'hand', description: 'Small green backpack' },
            { passengerId: 69, weight: 15, type: 'hand', description: 'Black carry-on suitcase' },
            { passengerId: 70, weight: 40, type: 'checked', description: 'Large white suitcase' },
            { passengerId: 71, weight: 8, type: 'hand', description: 'Gray backpack with essentials' },
            { passengerId: 72, weight: 30, type: 'checked', description: 'Large red suitcase' },
            { passengerId: 73, weight: 20, type: 'hand', description: 'Black carry-on with laptop' },
            { passengerId: 74, weight: 26, type: 'checked', description: 'Blue oversized luggage' },
            { passengerId: 75, weight: 12, type: 'hand', description: 'Yellow backpack with straps' },
            { passengerId: 76, weight: 15, type: 'hand', description: 'Orange carry-on suitcase' },
            { passengerId: 77, weight: 18, type: 'hand', description: 'Black rolling suitcase' },
            { passengerId: 78, weight: 35, type: 'checked', description: 'Large purple suitcase' },
            { passengerId: 79, weight: 6, type: 'hand', description: 'White leather carry-on' },
        ];

        const luggageValues = luggageItems.map(luggage => `('${randomUUID()}', ${luggage.passengerId}, ${luggage.weight}, '${luggage.type}', '${luggage.description}')`).join(", ");

        await db.run(`
            INSERT INTO luggages (uuid, passengerId, weight, type, description) VALUES
            ${luggageValues};
        `);

        return true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        console.error(e);
        throw new ServiceError(e.message, {
            statusCode: 500,
            code: 'DATABASE_ERROR',
            details: {
                message: e.message,
                stack: e.stack
            }
        });
    }
}