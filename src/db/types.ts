export interface Bean {
  id?: number;
  name: string;
  type: 'blend' | 'single_origin';
  countryOfOrigin: string;
  processingMethod: string;
  roastery: string;
  roastDate: string;
  tastingNotes: string;
  roastProfile?: string;
  growingElevation?: string;
  remarks?: string;
}

export interface Brew {
  id?: number;
  beanIds: number[];
  date: string;
  method: string;
  brewer: string;
  grinder: string;
  beanWeight: number;
  grindSize: string;
  waterTemp: number;
  waterVolume: number;
  recipe?: string;
  tastingNotes?: string;
  rating?: number;
  remarks?: string;
}
