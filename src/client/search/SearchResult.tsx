import { Separator } from "@/client/ui/Separator";
import { Skeleton } from "@/client/ui/Skeleton";
import {
  Paragraph,
  ParagraphCaption,
  PrimaryHeading,
  SecondaryHeading,
  TertiaryHeading,
} from "@/client/ui/Typography";
import { CompressedInstitutionRankedSearchResult } from "@/server/schema/institution";
import { UserCircle2Icon } from "lucide-react";
import Link from "next/link";
import React from "react";

interface Props {
  rank: number;
  institution: CompressedInstitutionRankedSearchResult["institutions"][number];
  papers: CompressedInstitutionRankedSearchResult["papers"];
}

export function SearchResult({ rank, institution, papers }: Props) {
  const institutionPapers = React.useMemo(() => {
    const paperIdSet = new Set(
      institution.authors.flatMap((author) => author.paper_ids),
    );
    return papers.filter((paper) => paperIdSet.has(paper.id));
  }, [institution, papers]);

  return (
    <article className="bg-card rounded-lg shadow-md">
      <header className="p-4 bg-card-header rounded-t-lg">
        <PrimaryHeading className="hover:underline underline-offset-2">
          <Link href={institution.website} target="_blank">
            {rank}. {institution.title}
          </Link>
        </PrimaryHeading>
        <SecondaryHeading>
          {institution.location} | {institution.country}
        </SecondaryHeading>
      </header>
      <Separator />
      <div className="grid gap-1 p-4">
        {institution.authors.length ? (
          <TertiaryHeading>
            {`Top ${institution.authors.length}`} Matched Researchers
          </TertiaryHeading>
        ) : null}
        <div className="flex flex-wrap space-x-2 space-y-1">
          {institution.authors.map((author) => (
            <Link
              key={author.id}
              href={author.orcid}
              target="_blank"
              className="inline-flex hover:underline"
            >
              <UserCircle2Icon className="mr-1" />
              {author.display_name}
            </Link>
          ))}
        </div>
      </div>
      <Separator />
      <div className="grid gap-1 p-4">
        {institutionPapers.length ? (
          <TertiaryHeading>
            {`Top ${institutionPapers.length}`} Matched Publications
          </TertiaryHeading>
        ) : null}
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
                {new Date(paper.published_at).toLocaleDateString()},{" "}
                {paper.citations} citations
              </Paragraph>
              <ParagraphCaption className="mt-1 line-clamp-2 italic">
                {paper.abstract}
              </ParagraphCaption>
            </li>
          ))}
        </ol>
      </div>
    </article>
  );
}

export function SearchResultSkeleton() {
  return <Skeleton className="h-64" />;
}
