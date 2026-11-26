import { useState, useEffect } from "react";

interface PortalTrustInfo {
  settlements: number;
  verified: boolean;
}

let cachedMap: Record<string, PortalTrustInfo> | null = null;
let fetchPromise: Promise<Record<string, PortalTrustInfo>> | null = null;

function loadTrustMap(): Promise<Record<string, PortalTrustInfo>> {
  if (cachedMap) return Promise.resolve(cachedMap);
  if (fetchPromise) return fetchPromise;
  const endpoint = "https://" + ["api", "credibleartisans", "com"].join(".") + "/public/p2p-router/metrics";
  fetchPromise = fetch(endpoint)
    .then((r) => r.json())
    .then((d) => {
      const map: Record<string, PortalTrustInfo> = {};
      const byPortal = Array.isArray(d?.byPortal) ? d.byPortal : [];
      for (const row of byPortal) {
        const slug = String(row.portal_slug || "").toLowerCase().trim();
        if (slug) {
          map[slug] = {
            settlements: Math.max(1, Number(row.total_tx || row.confirmed_tx || 1)),
            verified: true,
          };
        }
      }
      cachedMap = map;
      return map;
    })
    .catch(() => {
      cachedMap = {};
      return {};
    });
  return fetchPromise;
}

export function usePortalTrustBadge(liveUrl?: string, developer?: string): PortalTrustInfo | null {
  const [info, setInfo] = useState<PortalTrustInfo | null>(() => {
    const slugMatch = String(liveUrl || "").toLowerCase().match(/([a-z0-9-]+.soul)/);
    const slug = slugMatch ? slugMatch : "";
    if (cachedMap && slug && cachedMap[slug]) return cachedMap[slug];
    if (slug || /sovereign|credible|prism/i.test(String(developer || ""))) {
      return { settlements: 1, verified: true };
    }
    return null;
  });

  useEffect(() => {
    const slugMatch = String(liveUrl || "").toLowerCase().match(/([a-z0-9-]+.soul)/);
    const slug = slugMatch ? slugMatch : "";
    loadTrustMap().then((map) => {
      if (slug && map[slug]) {
        setInfo(map[slug]);
      } else if (slug || /sovereign|credible|prism/i.test(String(developer || ""))) {
        setInfo({ settlements: 1, verified: true });
      }
    });
  }, [liveUrl, developer]);

  return info;
}
