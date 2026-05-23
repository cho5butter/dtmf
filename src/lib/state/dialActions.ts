import type { DtmfKey } from "../dtmf/frequencyMap";
import { appState, setInput } from "./store";

/** 押下時: 番号欄にだけ追加（音は鳴らさない） */
export function recordDialKey(key: DtmfKey): void {
  setInput(appState.raw + key);
}
