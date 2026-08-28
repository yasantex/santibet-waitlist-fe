export type PredictionSide = "yes" | "no";

export interface JourneyStep {
  when: string;
  what: string;
  final?: boolean;
}

export interface ReferStep {
  num: string;
  what: string;
  sub: string;
}

export interface FounderBenefit {
  icon: string;
  text: string;
}
