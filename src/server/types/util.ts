export type With<T extends object, V extends object> = T & V;

export type Rank = { rank: number };

export type Score = { raw_score: number; score: number };

export type Highlight = { highlight: Record<string, string[]> };
