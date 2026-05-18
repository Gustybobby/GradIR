export const getCountries = async (): Promise<string[]> => {
  const response = await fetch("/api/institutions/countries", {
    next: { revalidate: 3600 },
  });
  return response.json();
};
