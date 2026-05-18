import { useCountries } from "@/client/hooks/useCountries";
import { Button } from "@/client/ui/Button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/client/ui/Combobox";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/client/ui/Popover";
import { SearchInput } from "@/client/ui/SearchInput";
import { PrimaryHeading } from "@/client/ui/Typography";
import { SearchSuggestion } from "@/server/schema/search";
import { MapPinIcon } from "lucide-react";

interface Props {
  query: string;
  isLoading: boolean;
  suggestions?: SearchSuggestion[];
  selectedCountries?: string[];
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  onSuggest: (value: string) => void;
  onSelectSuggestion: (value: string) => void;
  onCountriesChange: (value: string[]) => void;
}

export function SearchHeader({
  query,
  isLoading,
  suggestions,
  selectedCountries = [],
  onQueryChange,
  onSearch,
  onSuggest,
  onSelectSuggestion,
  onCountriesChange,
}: Props) {
  return (
    <header className="px-2 py-4 mb-8 bg-zinc-900 shadow-md border-b border-border grid grid-cols-7">
      <div className="hidden md:flex items-center justify-center col-span-1">
        <PrimaryHeading className="text-center text-accent">
          GradIR
        </PrimaryHeading>
      </div>
      <form
        className="relative col-span-6 md:col-span-5 px-2 flex items-center"
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
      <div className="flex items-center">
        <CountryFilter
          values={selectedCountries}
          onValuesChange={onCountriesChange}
        />
      </div>
    </header>
  );
}

interface CountryFilterProps {
  values: string[];
  onValuesChange: (value: string[]) => void;
}

function CountryFilter({ values, onValuesChange }: CountryFilterProps) {
  const { countries } = useCountries();

  if (!countries) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button className="p-2">
            <MapPinIcon />
          </Button>
        }
      />
      <PopoverContent align="start" className="max-w-48">
        <PopoverHeader>
          <PopoverTitle className="font-bold">Filter by countries</PopoverTitle>
          <PopoverDescription>{values.join(", ")}</PopoverDescription>
        </PopoverHeader>
        <Combobox
          multiple
          items={countries}
          value={values}
          onValueChange={onValuesChange}
          defaultOpen
        >
          <ComboboxInput
            render={
              <input className="bg-input rounded-full outline-none border-2 border-transparent px-2 py-1 focus-visible:border-border" />
            }
          />
          <ComboboxContent>
            <ComboboxEmpty>No countries found</ComboboxEmpty>
            <ComboboxList>
              {(country: string) => (
                <ComboboxItem key={country} value={country}>
                  {country}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </PopoverContent>
    </Popover>
  );
}
