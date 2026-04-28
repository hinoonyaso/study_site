import type { ResourceLink } from "../../types";
import { sourceCatalog, sourceCatalogById } from "./sourceCatalog";

const toResource = (source: (typeof sourceCatalog)[number]): ResourceLink => ({
  title: source.title,
  url: source.url,
  domain: source.domain,
  note: source.note,
});

export const sourceRegistry: Record<string, ResourceLink> = Object.fromEntries(
  sourceCatalog.map((source) => [source.id, toResource(source)]),
);

export const getSources = (ids: string[]) =>
  ids.map((id) => sourceCatalogById[id]).filter(Boolean).map(toResource);
