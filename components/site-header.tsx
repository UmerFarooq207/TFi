import { getHeaderTaxonomy } from "@/lib/data/taxonomy"
import { SiteHeaderClient } from "@/components/site-header-client"

/**
 * Server wrapper: fetches the taxonomy (categories, brands, collections) once
 * per render and hands it to the client header. This is the only DB call the
 * header makes — the mega-menu hover panels read entirely from this payload.
 */
export async function SiteHeader() {
  const taxonomy = await getHeaderTaxonomy()
  return <SiteHeaderClient taxonomy={taxonomy} />
}
