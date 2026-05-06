import { Skeleton } from "@/client/ui/Skeleton";
import {
  Paragraph,
  ParagraphCaption,
  PrimaryHeading,
  SecondaryHeading,
  TertiaryHeading,
} from "@/client/ui/Typography";
import { InstitutionRankedSearchResult } from "@/server/schema/institution";
import Link from "next/link";

interface Props {
  institution: InstitutionRankedSearchResult;
}

export function SearchResult({ institution }: Props) {
  return (
    <article className="grid gap-2">
      <div className="grid gap-1">
        <header>
          <PrimaryHeading className="hover:underline underline-offset-2">
            <Link href={`/institutions/${institution.id}`}>
              {institution.title}
            </Link>
          </PrimaryHeading>
          <SecondaryHeading>{institution.country}</SecondaryHeading>
        </header>
        <Paragraph className="line-clamp-2">{institution.location}</Paragraph>
      </div>
      <div className="grid gap-1">
        <TertiaryHeading>Matched Researchers</TertiaryHeading>
        <ol className="list-decimal list-inside">
          {institution.authors.map((author) => (
            <li key={author.id}>
              {`${author.full_name}`}
              <Paragraph className="line-clamp-2">{author.summary}</Paragraph>
              <ol className="mt-1 ml-4 list-disc list-inside space-y-2">
                {author.papers.slice(0, 2).map((paper) => (
                  <li key={paper.id} className="tracking-tight">
                    {paper.title}
                    <ParagraphCaption className="mt-1 text-ellipsis line-clamp-2 italic tracking-normal">
                      {paper.abstract}
                    </ParagraphCaption>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </div>
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
