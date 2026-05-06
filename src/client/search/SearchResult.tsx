import { Skeleton } from "@/client/ui/Skeleton";
import {
  Paragraph,
  ParagraphCaption,
  PrimaryHeading,
  SecondaryHeading,
  TertiaryHeading,
} from "@/client/ui/Typography";
import { CompressedInstitutionRankedSearchResult } from "@/server/schema/institution";
import Link from "next/link";
import React from "react";

interface Props {
  institution: CompressedInstitutionRankedSearchResult["institutions"][number];
  papers: CompressedInstitutionRankedSearchResult["papers"];
}

export function SearchResult({ institution, papers }: Props) {
  const institutionPapers = React.useMemo(() => {
    const paperIdSet = new Set(
      institution.authors.flatMap((author) => author.paper_ids),
    );
    return papers.filter((paper) => paperIdSet.has(paper.id));
  }, [institution, papers]);

  return (
    <article className="grid gap-2">
      <div className="grid gap-1">
        <header>
          <PrimaryHeading className="hover:underline underline-offset-2">
            <Link href={institution.website} target="_blank">
              {institution.title}
            </Link>
          </PrimaryHeading>
          <SecondaryHeading>{institution.country}</SecondaryHeading>
        </header>
        <Paragraph className="line-clamp-2">{institution.location}</Paragraph>
      </div>
      <div className="grid gap-1">
        <TertiaryHeading>Matched Researchers</TertiaryHeading>
        <ol className="list-decimal list-inside space-y-1">
          {institution.authors.map((author) => (
            <li key={author.id}>
              <Link
                href={author.orcid}
                target="_blank"
                className="hover:underline"
              >
                {author.display_name}
              </Link>
              {author.summary ? (
                <ParagraphCaption className="mt-1 line-clamp-2 italic">
                  {author.summary}
                </ParagraphCaption>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
      {institutionPapers.length ? (
        <div className="grid gap-1">
          <TertiaryHeading>Matched Publications</TertiaryHeading>
          <ol className="list-decimal list-inside space-y-1">
            {institutionPapers.map((paper) => (
              <li key={paper.id}>
                <Link
                  href={paper.doi}
                  target="_blank"
                  className="hover:underline"
                >
                  {paper.title}
                </Link>
                <Paragraph>
                  published {new Date(paper.published_at).toLocaleDateString()},{" "}
                  {paper.citations} citations
                </Paragraph>
                <ParagraphCaption className="mt-1 line-clamp-2 italic">
                  {paper.abstract}
                </ParagraphCaption>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </article>
  );
}

export function SearchResultSkeleton() {
  return (
    <div className="grid gap-2">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-24" />
    </div>
  );
}
