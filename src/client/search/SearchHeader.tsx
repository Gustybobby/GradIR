import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/client/ui/Combobox";
import { SearchInput } from "@/client/ui/SearchInput";
import { PrimaryHeading } from "@/client/ui/Typography";
import { SearchSuggestion } from "@/server/schema/search";

interface Props {
  query: string;
  isLoading: boolean;
  suggestions?: SearchSuggestion[];
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  onSuggest: (value: string) => void;
  onSelectSuggestion: (value: string) => void;
}

export function SearchHeader({
  query,
  suggestions,
  isLoading,
  onQueryChange,
  onSearch,
  onSuggest,
  onSelectSuggestion,
}: Props) {
  return (
    <header className="px-2 py-4 mb-8 bg-zinc-900 shadow-md border-b border-border grid grid-cols-7">
      <div className="hidden md:flex items-center justify-center col-span-1">
        <PrimaryHeading className="text-center text-accent">
          GradIR
        </PrimaryHeading>
      </div>
      <form
        className="relative col-span-full md:col-span-5 px-2 flex items-center"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
      >
        <Combobox<string>
          items={suggestions?.map((suggestion) => suggestion.text)}
          value={query}
          onInputValueChange={(value) => {
            onQueryChange(value);
            if (!suggestions?.some((suggestion) => suggestion.text === value)) {
              onSuggest(value);
            }
          }}
          onValueChange={(text) => text && onSelectSuggestion?.(text)}
          onItemHighlighted={(text, e) =>
            text && e.reason === "keyboard" && onQueryChange(text)
          }
          filter={null}
        >
          <ComboboxInput
            name="search-query"
            render={<SearchInput isLoading={isLoading} />}
            onKeyDown={(e) =>
              e.key === "Enter" && e.currentTarget.form?.requestSubmit()
            }
          />
          {!!suggestions?.length && (
            <ComboboxContent className="w-[calc(100%+10px)]" alignOffset={-40}>
              <ComboboxList>
                {(text: string, idx: number) => (
                  <ComboboxItem key={idx} value={text} className="text-lg pl-9">
                    {text}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          )}
        </Combobox>
      </form>
    </header>
  );
}
