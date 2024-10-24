# Pylon Flights

## Overview

Pylon Flights is a pylon-based backend application designed to manage flight operations, including handling pilots, copilots, passengers, aircraft, and related logistics. Built with modern technologies, it ensures efficient data management and seamless deployment.

## Features

-   **Flight Management:** Create, update, and delete flight records.
-   **Crew Allocation:** Assign pilots and copilots to flights with conflict checks.
-   **Passenger Handling:** Manage passenger details and their associated luggages.
-   **Aircraft Inventory:** Maintain a database of aircraft models and statuses.
-   **Automated Deployments:** Streamlined deployment using Wrangler and Pylon.

## Technologies Used

-   **Pylon:** Framework for building serverless applications.
-   **Drizzle ORM:** Type-safe ORM for interacting with the database.
-   **Cloudflare Workers:** Serverless execution environment.
-   **TypeScript:** Superset of JavaScript for type safety.
-   **Wrangler:** CLI tool for managing Cloudflare Workers.
-   **ESLint & Prettier:** Code linting and formatting tools.

## Free-to-Use API

The application is deployed as a Cloudflare Worker and it's graphql endpoint is available for public use. You can access the API at the following URL:

```plaintext
https://pylon-flights.jan-emig.workers.dev/graphql
```

## Installation

1. **Clone the Repository:**

    ```sh
    git clone https://github.com/getcronit/pylon.git
    cd pylon-flights
    ```

2. **Install Dependencies:**

    ```sh
    bun install
    ```

3. **Configure Environment Variables:**
    - Create a `.env` file based on the provided `.env.public`.
    - Set up necessary environment variables for database connections and other services.

## Scripts

-   **Deploy Application:**

    ```sh
    bun run deploy
    ```

    Builds the project and deploys it using Wrangler.

-   **Start Development Server:**

    ```sh
    bun run dev
    ```

    Runs the development server with hot-reloading.

-   **Generate Types:**

    ```sh
    bun run cf-typegen
    ```

    Generates TypeScript types for Cloudflare Workers.

-   **Database Migrations:**
    -   **Generate Migration:**
        ```sh
        bun run generate
        ```
    -   **Apply Migrations:**
        ```sh
        bun run migrate
        ```

## Project Structure

-   **`src/`**
    -   Contains the source code for the application.
    -   **`db/`**
        -   Database schemas and ORM configurations.
    -   **`lib/`**
        -   Functionality for reading and writing data of the respective models.
-   **`migrations/`**
    -   Database migration scripts.

## Pylon

This project is built using the Pylon framework. Pylon is an open-source framework for efficently creating easy and complex GraphQL interfaces. Check out the [Pylon website](https://pylon.cronit.io) or the [GitHub repository](https://github.com/getcronit/pylon) for more information.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

Special thanks goes to [@schettn](https://github.com/schettn) for the guidance and support in building this application.
