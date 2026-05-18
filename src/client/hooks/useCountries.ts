"use client";

import { getCountries } from "@/client/api/getCountries";
import React from "react";

export function useCountries() {
  const [countries, setCountries] = React.useState<string[]>();

  React.useEffect(() => {
    getCountries().then(setCountries);
  }, []);

  return { countries };
}
