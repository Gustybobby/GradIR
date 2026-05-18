import { evaluate } from "@/client/api/evaluate";
import { Button } from "@/client/ui/Button";
import { Separator } from "@/client/ui/Separator";
import { Skeleton } from "@/client/ui/Skeleton";
import {
  Paragraph,
  ParagraphCaption,
  PrimaryHeading,
  SecondaryHeading,
  TertiaryHeading,
} from "@/client/ui/Typography";
import {
  CompressedInstitution,
  CompressedInstitutionRankedSearchResult,
} from "@/server/schema/institution";
import { PaperWithScore } from "@/server/schema/paper";
import { UserCircle2Icon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";

interface Props {
  rank: number;
  institution: CompressedInstitution;
  papers: CompressedInstitutionRankedSearchResult["papers"];
  isEvaluationEnabled?: boolean;
  isDisplayScore?: boolean;
}

export function SearchResult({
  rank,
  institution,
  papers,
  isEvaluationEnabled,
  isDisplayScore,
}: Props) {
  const institutionPapers = React.useMemo(() => {
    const paperIdSet = new Set(
      institution.authors.flatMap((author) => author.paper_ids),
    );
    return papers.filter((paper) => paperIdSet.has(paper.id));
  }, [institution, papers]);

  const isPaperAuthorFilled = institutionPapers.some((paper) => paper.filled);

  return (
    <article className="bg-card rounded-lg shadow-md">
      <header className="p-4 bg-card-header rounded-t-lg flex flex-col md:flex-row justify-between space-y-2 md:space-y-0">
        <div>
          <PrimaryHeading className="hover:underline underline-offset-2">
            <Link href={institution.website} target="_blank">
              {rank}. {institution.title}{" "}
              {isDisplayScore &&
                `(${Math.round(institution.score * 100) / 100})`}
            </Link>
          </PrimaryHeading>
          <SecondaryHeading>
            {institution.location} | {institution.country}
          </SecondaryHeading>
        </div>
        {isEvaluationEnabled ? (
          <EvaluationSection institution={institution} />
        ) : null}
      </header>
      <Separator />
      <div className="grid gap-1 p-4">
        {institution.authors.length ? (
          <TertiaryHeading>
            {isPaperAuthorFilled
              ? "Popular Researchers"
              : `Top ${institution.authors.length} Matched Researchers`}
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
              {author.display_name}{" "}
              {isDisplayScore && `(${Math.round(author.score * 100) / 100})`}
            </Link>
          ))}
        </div>
      </div>
      <Separator />
      <div className="grid gap-1 p-4">
        {institutionPapers.length ? (
          <TertiaryHeading>
            {isPaperAuthorFilled
              ? "Top Cited Publications"
              : `Top ${institutionPapers.length} Matched Publications`}
          </TertiaryHeading>
        ) : null}
        <ol className="list-decimal list-inside space-y-2">
          {institutionPapers.map((paper) => (
            <PaperListItem
              key={paper.id}
              paper={paper}
              isDisplayScore={isDisplayScore}
            />
          ))}
        </ol>
      </div>
    </article>
  );
}

function EvaluationSection({
  institution,
}: {
  institution: CompressedInstitution;
}) {
  const searchParams = useSearchParams();

  const [isEvaluated, setIsEvaluated] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  if (isEvaluated) {
    return null;
  }

  const scores = [0, 1, 2, 3];

  return (
    <div className="space-y-1">
      <ParagraphCaption>How relevant is this result?</ParagraphCaption>
      <div className="flex space-x-2">
        {scores.map((score) => (
          <Button
            key={score}
            className="size-8"
            onClick={async () => {
              const query = searchParams.get("query");
              if (!query) {
                return;
              }
              setIsLoading(true);
              await evaluate({ query, score, institution_id: institution.id });
              setIsLoading(false);
              setIsEvaluated(true);
            }}
            disabled={isLoading}
          >
            {score}
          </Button>
        ))}
      </div>
      <ParagraphCaption className="italic">
        Evaluated {institution.evalCount} times
      </ParagraphCaption>
    </div>
  );
}

interface PaperListItemProps {
  paper: PaperWithScore;
  isDisplayScore?: boolean;
}

function PaperListItem({ paper, isDisplayScore }: PaperListItemProps) {
  const abstractHighlights = paper.highlight["abstract"] ?? [];
  return (
    <li>
      <Link href={paper.doi} target="_blank" className="hover:underline">
        {paper.title}{" "}
        {isDisplayScore && `(${Math.round(paper.score * 100) / 100})`}
      </Link>
      <Paragraph className="mb-1">
        {new Date(paper.published_at).toLocaleDateString()}, {paper.citations}{" "}
        citations
      </Paragraph>
      <Separator />
      {abstractHighlights.length ? (
        <ParagraphCaption className="mt-1 italic">
          {abstractHighlights.slice(0, 2).join(" ... ").concat("...")}
        </ParagraphCaption>
      ) : (
        <ParagraphCaption className="mt-1 italic line-clamp-2">
          {paper.abstract || "Missing abstract"}
        </ParagraphCaption>
      )}
    </li>
  );
}

export function SearchResultSkeleton() {
  return <Skeleton className="h-64" />;
}
