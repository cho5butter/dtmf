/** @jsxImportSource solid-js */
import { createContext, type ParentComponent, useContext } from "solid-js";
import type { DtmfEngine } from "../dtmf/engine";
import type { AutoDialSequencer } from "../dtmf/sequencer";

export interface AppServices {
  engine: DtmfEngine;
  sequencer: AutoDialSequencer;
}

const ServicesContext = createContext<AppServices>();

export const ServicesProvider: ParentComponent<{ value: AppServices }> = (props) => {
  return <ServicesContext.Provider value={props.value}>{props.children}</ServicesContext.Provider>;
};

export function useServices(): AppServices {
  const ctx = useContext(ServicesContext);
  if (!ctx) throw new Error("ServicesContext not found");
  return ctx;
}
