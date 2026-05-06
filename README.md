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
  "id": "string (optional)",
  "address": "string",
  "location": "string",
  "lat": "number",
  "long": "number",
  "openalex_id": "string",
  "title": "string",
  "country": "string",
  "website": "string",
  "type": "string"
}
```

### Field Descriptions

- **id** _(optional)_: Internal database ID (used for updates)
- **address**: Full street address
- **location**: City and country
- **lat**: Latitude coordinate
- **long**: Longitude coordinate
- **openalex_id**: OpenAlex institution ID
- **title**: Institution name
- **country**: Country name
- **website**: Official website URL
- **type**: Institution type (e.g., university, research institute)

---

## `/api/authors` — PUT

Create or update an author.

### Request Body

```json
{
  "id": "string (optional)",
  "openalex_id": "string",
  "institution_id": "string",
  "full_name": "string",
  "display_name": "string",
  "h_index": "number",
  "orcid": "string",
  "summary": "string"
}
```

### Field Descriptions

- **id** _(optional)_: Internal database ID (used for updates)
- **openalex_id**: Unique identifier from OpenAlex
- **institution_id**: Reference to associated institution
- **full_name**: Author’s full legal name
- **display_name**: Preferred/public display name
- **h_index**: Research impact metric
- **orcid**: ORCID identifier URL
- **summary**: Research interests summary

---

## `/api/papers` — PUT

Create or update a paper.

### Request Body

```json
{
  "id": "string (optional)",
  "openalex_id": "string",
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

- **id** _(optional)_: Internal database ID (used for updates)
- **openalex_id**: OpenAlex paper ID
- **title**: Paper title
- **doi**: Digital Object Identifier
- **published_at**: Publication date (ISO format)
- **citations**: Number of citations
- **abstract**: Paper abstract
- **author_ids**: List of associated author IDs
- **institution_ids**: List of associated institution IDs

---

## Notes

- `PUT` is used for both **create** and **update** operations.
- If `id` is provided, the system will update the existing record.
- If `id` is omitted, a new record will be created.
- Ensure referential integrity of `author_id` and `institution_id`.

---
