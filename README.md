# GradIR — Research-based Institution Search

**GradIR** is a vertical academic search system that retrieves institutions by matching user research interests to research profiles and publications, then ranks institutions based on research alignment.

## Installation

This project requires **PostgreSQL**, **Elastic Cloud**, and **OpenAI**.

> ⚠️ If you plan to self-host Elasticsearch instead of using Elastic Cloud, you will need to manually modify the Elasticsearch client initialization in the codebase.

> ⚠️ OpenAI is strictly used for text embeddings, if you wish to use a different provider or model, you will need to modify the source code.

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
   OPENAI_API_KEY=<your-openai-api-key>
   DATABASE_URL=<your-postgres-connection-string>
   API_KEY=<your-internal-api-key>
   ```

   - `ELASTIC_NODE`: Your Elastic Cloud endpoint
   - `ELASTIC_API_KEY`: API key for Elasticsearch access
   - `OPENAI_API_KEY`: This project uses OpenAI text embedding model.
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

# Search Architecture

The search system is built around three core entities:

* **Institution**
* **Author**
* **Publication**

## Entity Relationships

* A publication can be written by multiple authors.
* An author can contribute to multiple publications.
* Each author belongs to a single institution.

```text
Institution (1) ────< Author (M) >────< Publication (M)
```

## Search Pipeline

A query is executed across all three indices:

* `institution-*`
* `author-*`
* `paper-*`

### 1. Exact Match Retrieval

For institution and author indices, standard lexical retrieval is used to search for exact or near-exact matches.

### 2. Publication Ranking

For publication indices, retrieved documents are re-ranked using a custom scoring function:

```math
score_{paper} =
gauss\_decay_{publication\_date}
\left(
\ln(e + citations) \times raw\_score
\right)
```

### Publication Ranking Strategy

The scoring function is designed to prioritize:

* **Highly cited papers**: research impact
* **Recently published papers**: research relevance and recency
* **Strong textual relevance**: query-document matching quality

## Author Ranking

After retrieving publications, related authors are aggregated and ranked using the following scoring formula:

```math
score_{author} =
w_{raw}L1(score_{raw})
+
w_{sum}L1\left(
Sum_{topk}(score_{paper})
\right)
+
w_{avg}L1\left(
Avg_{topk}(score_{paper})
\right)
```

### Author Ranking Components

| Component               | Description                                        |
| ----------------------- | -------------------------------------------------- |
| `score_raw`             | Direct relevance score from author index retrieval |
| `Sum_topk(score_paper)` | Total impact of the author's top publications      |
| `Avg_topk(score_paper)` | Average quality of the author's top publications   |
| `L1()`                  | Normalization function                             |
| `w_*`                   | Tunable weighting parameters                       |

## Institution Ranking

Institutions are ranked using aggregated author scores:

```math
score_{institution} =
w_{raw}L1(score_{raw})
+
w_{sum}L1\left(
Sum_{topk}(score_{author})
\right)
+
w_{avg}L1\left(
Avg_{topk}(score_{author})
\right)
```

## Parameter Tuning

> All weights and ranking parameters are empirically tuned using benchmark test queries and evaluation corpora to optimize retrieval quality and ranking performance.

# Document Indices

We provide multiple publication document indices with different analyzer and retrieval configurations for testing and comparison purposes.

## Publication Indices

| Index Name      | Configuration                                                                                                                                                                                                                      | Example Tokenization                             |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `paper-def`     | BM25 regular text matching with lowercase normalization, no stop word pruning, and no stemming.                                                                                                                                    | `"Quantum Computer"` → `["quantum", "computer"]` |
| `paper-eng`     | BM25 regular text matching with lowercase normalization, English stop word pruning, and English corpus stemming.                                                                                                                   | `"Quantum Computer"` → `["quant", "comput"]`     |
| `paper-eng-sem` | English analyzer with semantic retrieval using OpenAI `text-embedding-3-small` embeddings. Uses BBQ HNSW quantization with cosine similarity for approximate KNN search. Supports hybrid retrieval combining KNN and BM25 scoring. | Hybrid Search → `KNN + BM25`                     |

## Author & Institution Indices

For author and institution documents, we currently provide a single default index configuration:

- `author-def`
- `institution-def`

# API Documentation

## Overview

This API provides endpoints to manage **authors**, **institutions**, and **papers**.

## Authorization

Includes `x-api-key` header for authorization.

---

## `/api/indices` — POST

Initialize the indices required for the project to run.

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
