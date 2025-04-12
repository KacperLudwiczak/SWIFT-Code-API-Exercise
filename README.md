# SWIFT Codes API

This project implements a REST API for parsing, storing, and retrieving SWIFT code data. It is written in TypeScript using Express.

## Features

- **Parse SWIFT Data:** Uses the `xlsx` package to parse a provided Excel file containing SWIFT codes. The parser follows these guidelines:
  - Codes ending with `"XXX"` indicate a headquarters.
  - Branch codes are linked to headquarters if their first 8 characters match.
  - Country codes and names are stored as uppercase.
  - Redundant columns are omitted.

- **Data Storage:** For demonstration purposes, data is stored in-memory. (Replace with your preferred database for production.)
  
- **REST API Endpoints:**
  - **GET /v1/swift-codes/{swiftCode}**  
    Retrieves details for a single SWIFT code. If the code is a headquarters, its branches (if any) are included.
    
  - **GET /v1/swift-codes/country/{countryISO2}**  
    Returns all SWIFT codes (both headquarters and branches) for a specified country.
    
  - **POST /v1/swift-codes**  
    Adds a new SWIFT code entry.
    
  - **DELETE /v1/swift-codes/{swiftCode}**  
    Deletes a SWIFT code entry by code.

 **HTML Front-End:**  
  A simple HTML page is provided (in the `public` folder) for basic interaction with the API.

## Development

### Prerequisites

- Node.js (v14 or later)
- npm

### Setup

1. Clone the repository.
2. Install dependencies:
    ```bash
    npm install
    ```
3. Run in development mode:
    ```bash
    npm run dev
    ```

### Building and Running in Docker

1. Build the Docker image:
    ```bash
    docker build -t swift-codes-api .
    ```
2. Run the container:
    ```bash
    docker run -p 8080:8080 swift-codes-api
    ```
The API will be accessible at `http://localhost:8080`.

## Testing

You can run unit tests (if available) via:
```bash
npm test
