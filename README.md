# Coding Contests API Documentation

This document provides information about the APIs available for the Coding Contests application. These endpoints allow you to retrieve information about programming contests and their solutions.

## Base URL

All endpoints are relative to the base URL of your API server.

## Endpoints

### 1. Get Contests

Retrieves a paginated list of contests with optional filtering.

```
GET /get-contests
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| Page | Number | Page number for pagination (default: 1) |
| Solutions | Boolean | When true, returns only contests with available solutions |
| Active | Boolean | When true, returns only active contests |
| Status | String | Comma-separated list of contest statuses to filter by |
| Platform | String | Comma-separated list of platforms to filter by |
| ContestPeriod | String | Date range in format "YYYY-MM-DD,YYYY-MM-DD" |
| duration | Number | Filter contests by duration (in hours) |
| Latest | Boolean | When true, sorts contests by start time in descending order |

#### Response

```json
{
  "totalCount": 42,
  "contests": [
    {
      "_id": "60a1b2c3d4e5f6a7b8c9d0e1",
      "contestName": "Weekly Contest 123",
      "Platform": "LeetCode",
      "Status": "Active",
      "startTime": "2023-06-10T00:00:00Z",
      "duration": "1:30",
      "youtubeLinks": [...]
    },
    // More contests...
  ],
  "maxPaginatedPages": 7
}
```

### 2. Get Solutions

Retrieves solutions (YouTube links) for a specific contest.

```
GET /get-solutions/:id
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | String | Contest ID |

#### Response

```json
{
  "Solutions": [
    {
      "title": "Problem A Solution",
      "url": "https://www.youtube.com/watch?v=abc123"
    },
    // More solutions...
  ],
  "ContestName": "Weekly Contest 123",
  "Platform": "LeetCode"
}
```

### 3. Get Saved Contests

Retrieves specific contests by their IDs.

```
POST /get-savedcontests
```

#### Request Body

```json
{
  "contestIds": ["60a1b2c3d4e5f6a7b8c9d0e1", "60a1b2c3d4e5f6a7b8c9d0e2"]
}
```

#### Response

```json
{
  "data": [
    {
      "_id": "60a1b2c3d4e5f6a7b8c9d0e1",
      "contestName": "Weekly Contest 123",
      "Platform": "LeetCode",
      // Other contest properties...
    },
    // More contests...
  ]
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

Returned when the request parameters are invalid.

```json
{
  "success": false,
  "message": "Error message explaining the issue"
}
```

### 404 Not Found

Returned when a requested resource does not exist.

```json
{
  "message": "Contest not found"
}
```

### 500 Internal Server Error

Returned when there's a server-side error.

```json
{
  "message": "Internal server error",
  "error": "Detailed error message (only in development)"
}
```

## Database Structure

The API uses MongoDB with the following structure:
- Database: `coding-contests`
- Collection: `Contests`

### Contest Object Structure

```json
{
  "_id": "60a1b2c3d4e5f6a7b8c9d0e1",
  "contestName": "Weekly Contest 123",
  "Platform": "LeetCode",
  "Status": "Active",
  "startTime": "2023-06-10T00:00:00Z",
  "duration": "1:30",
  "youtubeLinks": [
    {
      "title": "Problem A Solution",
      "url": "https://www.youtube.com/watch?v=abc123"
    }
  ]
}
```

## Usage Examples

### Fetch Active Contests on LeetCode

```
GET /get-contests?Active=true&Platform=LeetCode
```

### Fetch Recent Contests with Solutions

```
GET /get-contests?Solutions=true&Latest=true
```

### Fetch Short Contests (Less than 2 Hours)

```
GET /get-contests?duration=2
```

### Fetch Specific Saved Contests

```
POST /get-savedcontests
Content-Type: application/json

{
  "contestIds": ["60a1b2c3d4e5f6a7b8c9d0e1", "60a1b2c3d4e5f6a7b8c9d0e2"]
}
```
