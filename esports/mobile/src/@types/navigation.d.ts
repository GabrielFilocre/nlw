export interface GameParams {
  id: string;
  name: string;
  box_art_url: string;
}

export declare global {
  namespace ReactNavigation {
    interface RootParamList {
      home: undefined;
      game: GameParams;
    }
  }
}
