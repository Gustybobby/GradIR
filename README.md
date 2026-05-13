# GradIR — Research-based Institution Search

**GradIR** is a vertical academic search system that retrieves institutions by matching user research interests to research profiles and publications, then ranks institutions based on research alignment.

## Installation

This project requires **PostgreSQL** and **Elastic Cloud**.

> ⚠️ If you plan to self-host Elasticsearch instead of using Elastic Cloud, you will need to manually modify the Elasticsearch client initialization in the codebase.

### Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/Gustybobby/GradIR.git
   ```

2. **Set environment variables**

   Create a `.env` file in the root directory and configure the following:

   ```env
   ELASTIC_NODE=<your-elastic-endpoint>
   ELASTIC_API_KEY=<your-elastic-api-key>
   EMBEDDING_INFERENCE_ID=<your-embedding-model-id>
   DATABASE_URL=<your-postgres-connection-string>
   API_KEY=<your-internal-api-key>
   ```

   - `ELASTIC_NODE`: Your Elastic Cloud endpoint
   - `ELASTIC_API_KEY`: API key for Elasticsearch access
   - `EMBEDDING_INFERENCE_ID`: Embedding Model Inference ID (If you want to use semantic search)
   - `DATABASE_URL`: PostgreSQL connection string
   - `API_KEY`: Used for securing data management APIs

3. **Start the project in development mode**

   ```bash
   npm run dev
   ```

4. **Build and run in production**

   ```bash
   npm run build
   npm run start
   ```

# API Documentation

## Overview

This API provides endpoints to manage **authors**, **institutions**, and **papers**.

## Authorization

Includes `x-api-key` header for authorization.

---

## `/api/institutions` — PUT

Create or update an institution.

### Request Body

```json
{
  "id": "string",
  "address": "string",
  "location": "string",
  "lat": "number",
  "long": "number",
  "title": "string",
  "country": "string",
  "website": "string",
  "type": "string"
}
```

### Field Descriptions

- **id**: OpenAlex institution ID
- **address**: Full street address
- **location**: City and country
- **lat**: Latitude coordinate
- **long**: Longitude coordinate
- **title**: Institution name
- **country**: Country name
- **website**: Official website URL
- **type**: Institution type (e.g., university, research institute)

## `/api/institutions` — POST

Bulk create institutions

### Request Body

Refer to `PUT` request body as array. Max 100 records.

## `/api/institutions/[institution_id]` — DELETE

Delete institution

---

## `/api/authors` — PUT

Create or update an author.

### Request Body

```json
{
  "id": "string",
  "institution_id": "string",
  "full_name": "string",
  "display_name": "string",
  "h_index": "number",
  "orcid": "string",
  "summary": "string"
}
```

### Field Descriptions

- **id**: OpenAlex author ID
- **institution_id**: Reference to associated institution
- **full_name**: Author’s full legal name
- **display_name**: Preferred/public display name
- **h_index**: Research impact metric
- **orcid**: ORCID identifier URL
- **summary**: Research interests summary

## `/api/authors` — POST

Bulk create authors

### Request Body

Refer to `PUT` request body as array. Max 100 records.

## `/api/authors/[author_id]` — DELETE

Delete author

---

## `/api/papers` — PUT

Create or update a paper.

### Request Body

```json
{
  "id": "string",
  "title": "string",
  "doi": "string",
  "published_at": "Date",
  "citations": "number",
  "abstract": "string",
  "author_ids": "string[]",
  "institution_ids": "string[]"
}
```

### Field Descriptions

- **id**: OpenAlex paper ID
- **title**: Paper title
- **doi**: Digital Object Identifier
- **published_at**: Publication date (ISO format)
- **citations**: Number of citations
- **abstract**: Paper abstract
- **author_ids**: List of associated author IDs
- **institution_ids**: List of associated institution IDs

## `/api/papers` — POST

Bulk create papers

### Request Body

Refer to `PUT` request body as array. Max 100 records.

## `/api/papers/[paper_id]` — DELETE

Delete paper

---

## Notes

- `PUT` is used for both **create** and **update** operations.
- Ensure referential integrity of `author_id` and `institution_id`.

---
