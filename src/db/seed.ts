import { getEnv, ServiceError } from '@getcronit/pylon';

import getDb from '.';
import {
    aircrafts,
    airlines,
    airports,
    Flight,
    flights,
    humans,
    luggages,
    passengers,
} from './schema';
import { generateUUID } from '../utils';

// The number of items to insert in a single transaction
const CHUNK_SIZE = 200;

const airportData = new Map<string, { name: string; country: string }>([
    [
        'KATL',
        {
            name: 'Hartsfield-Jackson Atlanta International Airport',
            country: 'United States',
        },
    ],
    [
        'ZBAA',
        {
            name: 'Beijing Capital International Airport',
            country: 'China',
        },
    ],
    [
        'EHAM',
        {
            name: 'Amsterdam Airport Schiphol',
            country: 'Netherlands',
        },
    ],
    [
        'EGLL',
        {
            name: 'London Heathrow Airport',
            country: 'United Kingdom',
        },
    ],
    [
        'KLAX',
        {
            name: 'Los Angeles International Airport',
            country: 'United States',
        },
    ],
    ['RJTT', { name: 'Tokyo Haneda Airport', country: 'Japan' }],
    ['LFPG', { name: 'Charles de Gaulle Airport', country: 'France' }],
    [
        'OMDB',
        {
            name: 'Dubai International Airport',
            country: 'United Arab Emirates',
        },
    ],
    [
        'KSFO',
        {
            name: 'San Francisco International Airport',
            country: 'United States',
        },
    ],
    [
        'CYYZ',
        {
            name: 'Toronto Pearson International Airport',
            country: 'Canada',
        },
    ],
    [
        'KJFK',
        {
            name: 'John F. Kennedy International Airport',
            country: 'United States',
        },
    ],
    [
        'YSSY',
        {
            name: 'Sydney Kingsford Smith International Airport',
            country: 'Australia',
        },
    ],
    [
        'ZSPD',
        {
            name: 'Shanghai Pudong International Airport',
            country: 'China',
        },
    ],
    ['EDDF', { name: 'Frankfurt am Main Airport', country: 'Germany' }],
    ['WSSS', { name: 'Singapore Changi Airport', country: 'Singapore' }],
    [
        'VHHH',
        {
            name: 'Hong Kong International Airport',
            country: 'Hong Kong',
        },
    ],
    [
        'VIDP',
        {
            name: 'Indira Gandhi International Airport',
            country: 'India',
        },
    ],
    [
        'LEMD',
        {
            name: 'Adolfo Suárez Madrid-Barajas Airport',
            country: 'Spain',
        },
    ],
    ['EGCC', { name: 'Manchester Airport', country: 'United Kingdom' }],
    ['LSZH', { name: 'Zurich Airport', country: 'Switzerland' }],
    [
        'CYVR',
        {
            name: 'Vancouver International Airport',
            country: 'Canada',
        },
    ],
    ['NZAA', { name: 'Auckland Airport', country: 'New Zealand' }],
    [
        'FAOR',
        {
            name: 'O. R. Tambo International Airport',
            country: 'South Africa',
        },
    ],
    [
        'RKSI',
        {
            name: 'Incheon International Airport',
            country: 'South Korea',
        },
    ],
    [
        'KORD',
        {
            name: 'Hare International Airport',
            country: 'United States',
        },
    ],
    [
        'MMMX',
        {
            name: 'Mexico City International Airport',
            country: 'Mexico',
        },
    ],
    ['LTBA', { name: 'Istanbul Atatürk Airport', country: 'Turkey' }],
    ['LEBL', { name: 'Barcelona-El Prat Airport', country: 'Spain' }],
    [
        'UUEE',
        {
            name: 'Sheremetyevo International Airport',
            country: 'Russia',
        },
    ],
    [
        'BIKF',
        {
            name: 'Keflavík International Airport',
            country: 'Iceland',
        },
    ],
    [
        'PHNL',
        {
            name: 'Daniel K. Inouye International Airport',
            country: 'United States',
        },
    ],
    ['VTBS', { name: 'Suvarnabhumi Airport', country: 'Thailand' }],
    [
        'OMAA',
        {
            name: 'Abu Dhabi International Airport',
            country: 'United Arab Emirates',
        },
    ],
    [
        'SBGR',
        {
            name: 'São Paulo/Guarulhos International Airport',
            country: 'Brazil',
        },
    ],
    [
        'WIII',
        {
            name: 'Soekarno-Hatta International Airport',
            country: 'Indonesia',
        },
    ],
    [
        'LPPT',
        {
            name: 'Lisbon Humberto Delgado Airport',
            country: 'Portugal',
        },
    ],
    ['LGAV', { name: 'Athens International Airport', country: 'Greece' }],
    [
        'VTSP',
        {
            name: 'Phuket International Airport',
            country: 'Thailand',
        },
    ],
    ['LSGG', { name: 'Geneva Airport', country: 'Switzerland' }],
    ['EBBR', { name: 'Brussels Airport', country: 'Belgium' }],
    ['LFBO', { name: 'Toulouse-Blagnac Airport', country: 'France' }],
    [
        'ZGGG',
        {
            name: 'Guangzhou Baiyun International Airport',
            country: 'China',
        },
    ],
    [
        'RKPC',
        {
            name: 'Jeju International Airport',
            country: 'South Korea',
        },
    ],
    ['LFML', { name: 'Marseille Provence Airport', country: 'France' }],
    ['BIRK', { name: 'Reykjavik Airport', country: 'Iceland' }],
    ['RJAA', { name: 'Narita International Airport', country: 'Japan' }],
    [
        'CYUL',
        {
            name: 'Montréal-Trudeau International Airport',
            country: 'Canada',
        },
    ],
    [
        'KSEA',
        {
            name: 'Seattle-Tacoma International Airport',
            country: 'United States',
        },
    ],
    [
        'VOBL',
        {
            name: 'Kempegowda International Airport',
            country: 'India',
        },
    ],
    [
        'WADD',
        {
            name: 'Ngurah Rai International Airport',
            country: 'Indonesia',
        },
    ],
    ['LSZB', { name: 'Bern Airport', country: 'Switzerland' }],
    ['EFHK', { name: 'Helsinki Airport', country: 'Finland' }],
    [
        'LIRF',
        {
            name: 'Rome-Fiumicino International Airport',
            country: 'Italy',
        },
    ],
    ['EDDM', { name: 'Munich Airport', country: 'Germany' }],
    ['EPWA', { name: 'Warsaw Chopin Airport', country: 'Poland' }],
    [
        'LOWW',
        {
            name: 'Vienna International Airport',
            country: 'Austria',
        },
    ],
    [
        'SBGL',
        {
            name: 'Rio de Janeiro-Galeão International Airport',
            country: 'Brazil',
        },
    ],
    [
        'UUWW',
        {
            name: 'Vnukovo International Airport',
            country: 'Russia',
        },
    ],
    ['MMUN', { name: 'Cancún International Airport', country: 'Mexico' }],
    [
        'FIMP',
        {
            name: 'Sir Seewoosagur Ramgoolam International Airport',
            country: 'Mauritius',
        },
    ],
    ['OTHH', { name: 'Hamad International Airport', country: 'Qatar' }],
    [
        'WMKK',
        {
            name: 'Kuala Lumpur International Airport',
            country: 'Malaysia',
        },
    ],
    [
        'RPLL',
        {
            name: 'Ninoy Aquino International Airport',
            country: 'Philippines',
        },
    ],
    [
        'LPPR',
        {
            name: 'Francisco Sá Carneiro Airport',
            country: 'Portugal',
        },
    ],
    [
        'DNMM',
        {
            name: 'Murtala Muhammed International Airport',
            country: 'Nigeria',
        },
    ],
    [
        'ZUCK',
        {
            name: 'Chongqing Jiangbei International Airport',
            country: 'China',
        },
    ],
    ['HECA', { name: 'Cairo International Airport', country: 'Egypt' }],
    ['YVRR', { name: 'Rockhampton Airport', country: 'Australia' }],
    [
        'MDSD',
        {
            name: 'Las Américas International Airport',
            country: 'Dominican Republic',
        },
    ],
    [
        'MROC',
        {
            name: 'Juan Santamaría International Airport',
            country: 'Costa Rica',
        },
    ],
    [
        'HKJK',
        {
            name: 'Jomo Kenyatta International Airport',
            country: 'Kenya',
        },
    ],
    ['OKBK', { name: 'Kuwait International Airport', country: 'Kuwait' }],
    ['DIAP', { name: 'Port Bouet Airport', country: 'Ivory Coast' }],
    [
        'TJSJ',
        {
            name: 'Luis Muñoz Marín International Airport',
            country: 'Puerto Rico',
        },
    ],
    [
        'SCEL',
        {
            name: 'Comodoro Arturo Merino Benítez International Airport',
            country: 'Chile',
        },
    ],
    ['SABE', { name: 'Jorge Newbery Airfield', country: 'Argentina' }],
    [
        'FACT',
        {
            name: 'Cape Town International Airport',
            country: 'South Africa',
        },
    ],
    [
        'ZSSS',
        {
            name: 'Shanghai Hongqiao International Airport',
            country: 'China',
        },
    ],
    ['EIDW', { name: 'Dublin Airport', country: 'Ireland' }],
    [
        'OERK',
        {
            name: 'King Khalid International Airport',
            country: 'Saudi Arabia',
        },
    ],
    [
        'VABB',
        {
            name: 'Chhatrapati Shivaji Maharaj International Airport',
            country: 'India',
        },
    ],
    [
        'MGGT',
        {
            name: 'La Aurora International Airport',
            country: 'Guatemala',
        },
    ],
    [
        'MDPC',
        {
            name: 'Punta Cana International Airport',
            country: 'Dominican Republic',
        },
    ],
    [
        'SPIM',
        {
            name: 'Jorge Chávez International Airport',
            country: 'Peru',
        },
    ],
    [
        'HAAB',
        {
            name: 'Addis Ababa Bole International Airport',
            country: 'Ethiopia',
        },
    ],
    [
        'GMMN',
        {
            name: 'Mohammed V International Airport',
            country: 'Morocco',
        },
    ],
    [
        'SEQM',
        {
            name: 'Mariscal Sucre International Airport',
            country: 'Ecuador',
        },
    ],
    [
        'SKBO',
        {
            name: 'El Dorado International Airport',
            country: 'Colombia',
        },
    ],
    [
        'RCTP',
        {
            name: 'Taiwan Taoyuan International Airport',
            country: 'Taiwan',
        },
    ],
]);

const aircraftData = new Map<string, string>([
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
    ['CL30', 'Bombardier Challenger 300'],
]);

const humanData = [
    { firstname: 'John', lastname: 'Doe', birthdate: '1985-06-15' },
    { firstname: 'Jane', lastname: 'Smith', birthdate: '1990-09-20' },
    {
        firstname: 'Alice',
        lastname: 'Johnson',
        birthdate: '1982-12-01',
    },
    { firstname: 'Bob', lastname: 'Williams', birthdate: '1979-03-10' },
    {
        firstname: 'Charlie',
        lastname: 'Brown',
        birthdate: '1995-07-07',
    },
    { firstname: 'David', lastname: 'Miller', birthdate: '2000-11-30' },
    { firstname: 'Eve', lastname: 'Davis', birthdate: '1992-04-17' },
    { firstname: 'Frank', lastname: 'Garcia', birthdate: '1987-08-25' },
    {
        firstname: 'Grace',
        lastname: 'Martinez',
        birthdate: '1994-01-22',
    },
    {
        firstname: 'Hank',
        lastname: 'Rodriguez',
        birthdate: '1980-05-19',
    },
    { firstname: 'Ivy', lastname: 'Wilson', birthdate: '1975-10-14' },
    { firstname: 'Jack', lastname: 'Lopez', birthdate: '1983-02-23' },
    {
        firstname: 'Karen',
        lastname: 'Martinez',
        birthdate: '1996-07-11',
    },
    { firstname: 'Leo', lastname: 'Harris', birthdate: '1988-09-05' },
    { firstname: 'Mia', lastname: 'Clark', birthdate: '1991-03-29' },
    { firstname: 'Nina', lastname: 'Lewis', birthdate: '1986-06-30' },
    {
        firstname: 'Oscar',
        lastname: 'Robinson',
        birthdate: '1998-12-19',
    },
    { firstname: 'Paul', lastname: 'Walker', birthdate: '1999-01-13' },
    { firstname: 'Quincy', lastname: 'Young', birthdate: '1978-09-25' },
    { firstname: 'Rachel', lastname: 'King', birthdate: '1997-04-06' },
    { firstname: 'Sam', lastname: 'Scott', birthdate: '1989-08-16' },
    { firstname: 'Tina', lastname: 'Green', birthdate: '1981-02-12' },
    { firstname: 'Uma', lastname: 'Baker', birthdate: '1980-10-27' },
    { firstname: 'Victor', lastname: 'Adams', birthdate: '1990-12-18' },
    {
        firstname: 'Wendy',
        lastname: 'Campbell',
        birthdate: '1984-11-02',
    },
    {
        firstname: 'Xander',
        lastname: 'Mitchell',
        birthdate: '1977-05-23',
    },
    { firstname: 'Yara', lastname: 'Perez', birthdate: '1992-08-31' },
    { firstname: 'Zane', lastname: 'Roberts', birthdate: '1986-06-20' },
    { firstname: 'Aiden', lastname: 'Turner', birthdate: '1993-09-17' },
    {
        firstname: 'Bella',
        lastname: 'Phillips',
        birthdate: '1995-10-03',
    },
    { firstname: 'Carter', lastname: 'Evans', birthdate: '1987-07-09' },
    { firstname: 'Diana', lastname: 'Morris', birthdate: '1982-01-26' },
    { firstname: 'Elena', lastname: 'Nelson', birthdate: '1976-05-01' },
    { firstname: 'Felix', lastname: 'Carter', birthdate: '1994-06-12' },
    {
        firstname: 'Georgia',
        lastname: 'Murphy',
        birthdate: '1991-11-15',
    },
    { firstname: 'Henry', lastname: 'Perry', birthdate: '1985-09-08' },
    { firstname: 'Isla', lastname: 'Long', birthdate: '1979-03-30' },
    { firstname: 'Jacob', lastname: 'Bell', birthdate: '1999-12-27' },
    { firstname: 'Kevin', lastname: 'Foster', birthdate: '1988-02-14' },
    {
        firstname: 'Lila',
        lastname: 'Gonzalez',
        birthdate: '1996-08-19',
    },
    { firstname: 'Mason', lastname: 'Reed', birthdate: '1983-07-22' },
    { firstname: 'Nora', lastname: 'Bailey', birthdate: '1975-12-09' },
    { firstname: 'Owen', lastname: 'Cruz', birthdate: '1997-11-11' },
    { firstname: 'Piper', lastname: 'Rivera', birthdate: '1981-04-05' },
    {
        firstname: 'Quinn',
        lastname: 'Sanders',
        birthdate: '1990-06-26',
    },
    { firstname: 'Riley', lastname: 'Patel', birthdate: '1986-10-01' },
    { firstname: 'Sophie', lastname: 'Wood', birthdate: '1992-07-28' },
    {
        firstname: 'Thomas',
        lastname: 'Brooks',
        birthdate: '1993-03-12',
    },
    {
        firstname: 'Ursula',
        lastname: 'Edwards',
        birthdate: '1984-09-29',
    },
    { firstname: 'Vince', lastname: 'Gray', birthdate: '1995-05-25' },
    { firstname: 'Willow', lastname: 'James', birthdate: '1978-02-09' },
    { firstname: 'Xena', lastname: 'Torres', birthdate: '1989-12-15' },
    {
        firstname: 'Yusuf',
        lastname: 'Bennett',
        birthdate: '1991-10-07',
    },
    { firstname: 'Zoe', lastname: 'Howard', birthdate: '1996-06-02' },
    { firstname: 'Avery', lastname: 'Cox', birthdate: '1980-11-17' },
    { firstname: 'Brady', lastname: 'Ward', birthdate: '1987-01-08' },
    { firstname: 'Chloe', lastname: 'Flores', birthdate: '1983-08-13' },
    {
        firstname: 'Declan',
        lastname: 'Powell',
        birthdate: '1994-04-29',
    },
    {
        firstname: 'Ellie',
        lastname: 'Ramirez',
        birthdate: '1976-10-23',
    },
    {
        firstname: 'Finn',
        lastname: 'Washington',
        birthdate: '1999-07-18',
    },
    { firstname: 'Gavin', lastname: 'Butler', birthdate: '1979-03-07' },
    {
        firstname: 'Hazel',
        lastname: 'Jenkins',
        birthdate: '1998-11-04',
    },
    { firstname: 'Isaac', lastname: 'Perry', birthdate: '1985-04-09' },
    { firstname: 'Jade', lastname: 'Bryant', birthdate: '1993-02-25' },
    { firstname: 'Kai', lastname: 'Griffin', birthdate: '1981-06-13' },
    { firstname: 'Liam', lastname: 'Hayes', birthdate: '1975-09-18' },
    { firstname: 'Maya', lastname: 'Foster', birthdate: '1986-08-06' },
    { firstname: 'Nico', lastname: 'Coleman', birthdate: '1997-12-21' },
    {
        firstname: 'Olivia',
        lastname: 'Jenkins',
        birthdate: '1984-05-17',
    },
    {
        firstname: 'Patrick',
        lastname: 'Bailey',
        birthdate: '1990-03-03',
    },
    {
        firstname: 'Riley',
        lastname: 'Martinez',
        birthdate: '1983-12-04',
    },
    {
        firstname: 'Scarlett',
        lastname: 'Peterson',
        birthdate: '1995-02-10',
    },
    {
        firstname: 'Tristan',
        lastname: 'Price',
        birthdate: '1977-09-27',
    },
    { firstname: 'Uma', lastname: 'Kim', birthdate: '1988-06-21' },
    { firstname: 'Vivian', lastname: 'Lee', birthdate: '1976-01-15' },
    { firstname: 'Wes', lastname: 'Morris', birthdate: '1982-11-09' },
    { firstname: 'Xena', lastname: 'Parker', birthdate: '1990-07-04' },
    {
        firstname: 'Yvonne',
        lastname: 'Mitchell',
        birthdate: '1987-05-06',
    },
    { firstname: 'Zack', lastname: 'Reed', birthdate: '1999-08-30' },
    { firstname: 'Abby', lastname: 'Cruz', birthdate: '1996-04-18' },
];

const airlineData = [
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
    'Air Greenland',
];

/**
 * Create items with unique UUIDs
 * @param items     The items to create
 * @returns         The items with unique UUIDs
 */
const createItems = (items: any[]) => {
    return items.map((item) => ({ ...item, id: generateUUID() }));
};

/**
 * Get a random item from an array
 * @param items The array to get a random item from
 * @returns     A random item from the array
 */
const getRandomItem = <T>(items: T[]): T => {
    return items[Math.floor(Math.random() * items.length)];
};

/**
 * Get a random date between two dates
 * @param start     The start date
 * @param end       The end date
 * @returns         A random date between the two dates
 */
const getRandomDate = (start: Date, end: Date) => {
    return new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime()),
    );
};

/**
 * Generate flights
 * @param count         The number of flights to generate
 * @param airports      The airports to use
 * @param airlines      The airlines to use
 * @param aircrafts     The aircrafts to use
 * @param pilots        The pilots to use
 * @returns
 */
const generateFlights = (
    count: number,
    airports: any[],
    airlines: any[],
    aircrafts: any[],
    pilots: any[],
) => {
    const flights: Flight[] = [];
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');

    for (let i = 0; i < count; i++) {
        const departureAirport = getRandomItem(airports);
        let arrivalAirport;
        do {
            arrivalAirport = getRandomItem(airports);
        } while (arrivalAirport.id === departureAirport.id);

        const airline = getRandomItem(airlines);
        const aircraft = getRandomItem(aircrafts);
        const pilot = getRandomItem(pilots);
        let copilot;
        do {
            copilot = getRandomItem(pilots);
        } while (copilot.id === pilot.id);

        const departureTime = getRandomDate(startDate, endDate);
        const arrivalTime = new Date(
            departureTime.getTime() + Math.random() * 86400000,
        ); // Add up to 24 hours

        flights.push({
            id: generateUUID(),
            flightNumber: `${airline.name.substring(0, 2).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`,
            departureAirportId: departureAirport.id,
            arrivalAirportId: arrivalAirport.id,
            departureTime: departureTime.toISOString(),
            arrivalTime: arrivalTime.toISOString(),
            pilotId: pilot.id,
            copilotId: copilot.id,
            airlineId: airline.id,
            status: getRandomItem([
                'scheduled',
                'boarding',
                'departed',
                'arrived',
                'cancelled',
            ]),
            aircraftId: aircraft.id,
        });
    }

    return flights;
};

/**
 * Generate luggage(s) for passengers
 * @param passengers    The passengers to generate luggage for
 * @returns             The generated luggage
 */
const generateLuggage = (passengers: any[]) => {
    const colors = [
        'black',
        'blue',
        'red',
        'green',
        'gray',
        'purple',
        'brown',
        'white',
        'yellow',
        'orange',
    ];
    const materials = ['leather', 'nylon', 'polyester', 'canvas', 'hard-shell'];
    const handLuggageTypes = [
        'backpack',
        'duffel bag',
        'briefcase',
        'tote bag',
        'messenger bag',
        'laptop bag',
    ];
    const checkedLuggageTypes = [
        'suitcase',
        'trunk',
        'garment bag',
        'rolling duffel',
    ];
    const features = [
        'with wheels',
        'with multiple compartments',
        'with expandable zipper',
        'with TSA lock',
        'with built-in USB charger',
    ];
    const brands = [
        'Samsonite',
        'Travelpro',
        'Delsey',
        'American Tourister',
        'Tumi',
        'Rimowa',
        'Away',
        'Eagle Creek',
    ];

    return passengers.flatMap((passenger) => {
        const luggageCount = Math.floor(Math.random() * 3) + 1; // 1-3 pieces of luggage per passenger
        return Array.from({ length: luggageCount }, () => {
            const type = Math.random() > 0.7 ? 'hand' : 'checked';
            const color = getRandomItem(colors);
            const material = getRandomItem(materials);
            const feature = getRandomItem(features);
            const brand = getRandomItem(brands);

            let description, weight;

            if (type === 'hand') {
                const handType = getRandomItem(handLuggageTypes);
                description = `${color} ${material} ${handType} ${feature} (${brand})`;
                weight = Math.floor(Math.random() * 10) + 2; // 2-12 kg
            } else {
                const checkedType = getRandomItem(checkedLuggageTypes);
                const size = getRandomItem(['small', 'medium', 'large']);
                description = `${size} ${color} ${material} ${checkedType} ${feature} (${brand})`;
                weight = Math.floor(Math.random() * 17) + 15; // 15-32 kg
            }

            return {
                id: generateUUID(),
                passengerId: passenger.id,
                weight,
                type,
                description,
            };
        });
    });
};

/**
 * Seed the database with initial data
 * @param secret    The secret to authorize the seed operation
 * @returns         A promise that resolves when the seed operation is complete
 */
export default async function seed(secret: string) {
    if (secret !== getEnv().SEED_SECRET) {
        throw new ServiceError('Unauthorized', {
            statusCode: 401,
            code: 'unauthorized',
        });
    }
    try {
        const startTime = Date.now();
        const db = getDb();

        await db.delete(luggages);
        await db.delete(passengers);
        await db.delete(flights);
        await db.delete(airports);
        await db.delete(aircrafts);
        await db.delete(airlines);
        await db.delete(humans);

        // Create items with UUIDs
        const airportItems = createItems(
            Array.from(airportData.entries()).map(
                ([icao, { name, country }]) => ({ icao, name, country }),
            ),
        );
        const aircraftItems = createItems(
            Array.from(aircraftData.entries()).map(([icao, model]) => ({
                icao,
                model,
            })),
        );
        const humanItems = createItems(humanData);
        const airlineItems = createItems(airlineData.map((name) => ({ name })));

        // Insert airports
        const airportValues = airportItems
            .map(
                ({ id, icao, name, country }) =>
                    `('${id}', '${icao}', '${name}', '${country}')`,
            )
            .join(', ');
        await db.run(`
            INSERT INTO airports (id, icao, name, country) VALUES ${airportValues};
        `);

        // Insert aircrafts
        const aircraftValues = aircraftItems
            .map(({ id, icao, model }) => `('${id}', '${icao}', '${model}')`)
            .join(', ');
        await db.run(`
            INSERT INTO aircrafts (id, icao, model) VALUES ${aircraftValues};
        `);

        // Insert humans
        const humanValues = humanItems
            .map(
                ({ id, firstname, lastname, birthdate }) =>
                    `('${id}', '${firstname}', '${lastname}', '${birthdate}')`,
            )
            .join(', ');
        await db.run(`
            INSERT INTO humans (id, firstname, lastname, birthdate) VALUES ${humanValues};
        `);

        // Insert airlines
        const airlineValues = airlineItems
            .map(({ id, name }) => `('${id}', '${name}')`)
            .join(', ');
        await db.run(`
            INSERT INTO airlines (id, name) VALUES ${airlineValues};
        `);

        // Generate and insert flights
        const pilots = humanItems.slice(0, 20); // Assume the first 20 humans are pilots
        const flightItems = generateFlights(
            200,
            airportItems,
            airlineItems,
            aircraftItems,
            pilots,
        );

        // Insert flights in chunks to avoid SQL statement length issues
        for (let i = 0; i < flightItems.length; i += CHUNK_SIZE) {
            const chunk = flightItems.slice(i, i + CHUNK_SIZE);
            const flightValues = chunk
                .map(
                    ({
                        id,
                        flightNumber,
                        departureAirportId,
                        arrivalAirportId,
                        departureTime,
                        arrivalTime,
                        pilotId,
                        copilotId,
                        airlineId,
                        status,
                        aircraftId,
                    }) =>
                        `('${id}', '${flightNumber}', '${departureAirportId}', '${arrivalAirportId}', '${departureTime}', '${arrivalTime}', '${pilotId}', '${copilotId}', '${airlineId}', '${status}', '${aircraftId}')`,
                )
                .join(', ');
            await db.run(`
            INSERT INTO flights (id, flightNumber, departureAirportId, arrivalAirportId, departureTime, arrivalTime, pilotId, copilotId, airlineId, status, aircraftId) VALUES ${flightValues};
            `);
        }

        // Generate and insert passengers
        const passengerItems = flightItems.flatMap((flight) => {
            const passengerCount = Math.floor(Math.random() * 30) + 10; // 10-40 passengers per flight
            return Array.from({ length: passengerCount }, () => ({
                id: generateUUID(),
                humanId: getRandomItem(humanItems).id,
                seat: `${Math.floor(Math.random() * 30) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`,
                class: getRandomItem(['economy', 'business', 'first']),
                flightId: flight.id,
            }));
        });

        // Insert passengers in chunks to avoid SQL statement length issues
        for (let i = 0; i < passengerItems.length; i += CHUNK_SIZE) {
            const chunk = passengerItems.slice(i, i + CHUNK_SIZE);
            const passengerValues = chunk
                .map(
                    ({ id, humanId, seat, class: seatClass, flightId }) =>
                        `('${id}', '${humanId}', '${seat}', '${seatClass}', '${flightId}')`,
                )
                .join(', ');
            await db.run(`
            INSERT INTO passengers (id, humanId, seat, class, flightId) VALUES ${passengerValues};
            `);
        }

        // Generate and insert luggage
        const luggageItems = generateLuggage(passengerItems);

        // Insert luggage in chunks to avoid SQL statement length issues
        for (let i = 0; i < luggageItems.length; i += CHUNK_SIZE) {
            const chunk = luggageItems.slice(i, i + CHUNK_SIZE);
            const luggageValues = chunk
                .map(
                    ({ id, passengerId, weight, type, description }) =>
                        `('${id}', '${passengerId}', ${weight}, '${type}', '${description}')`,
                )
                .join(', ');
            await db.run(`
            INSERT INTO luggages (id, passengerId, weight, type, description) VALUES ${luggageValues};
            `);
        }
        const endTime = Date.now();
        console.log(`Database seeded in ${(endTime - startTime) / 1000}s`);
        return true;
    } catch (e: any) {
        console.error(e);
        throw new ServiceError(e.message, {
            statusCode: 500,
            code: 'DATABASE_ERROR',
            details: {
                message: e.message,
                stack: e.stack,
            },
        });
    }
}
