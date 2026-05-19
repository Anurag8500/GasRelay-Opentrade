export interface CommodityProduct {
  id: string;
  name: string;
  mass: string;
  netPriceUSDC: number;
  supplierName: string;
  supplierPublicKey: string;
}

export const MARKETPLACE_CATALOG: CommodityProduct[] = [
  {
    id: "colombian-coffee",
    name: "Organic Colombian Coffee Beans",
    mass: "1 Ton",
    netPriceUSDC: 3.00,
    supplierName: "Juan's Coffee Co.",
    supplierPublicKey: "GDDV5TYFVD7JO2GPST667SDVDCFX5TQFRZLEFR5FQUUDSL44AU2X7J5C",
  },
  {
    id: "vietnamese-rice",
    name: "Vietnamese Jasmine Rice",
    mass: "5 Tons",
    netPriceUSDC: 2.00,
    supplierName: "Linh Agriculture",
    supplierPublicKey: "GCQRCUY2TJYXFCEI2DFNXMV2ZUE6GU2MZCOION7MBVF74IPERDU4LWZX",
  },
  {
    id: "refurbished-smartphones",
    name: "Bulk Refurbished Smartphones",
    mass: "100 Units",
    netPriceUSDC: 1.00,
    supplierName: "TechRecycle India",
    supplierPublicKey: "GAC63MK3HUTQXRBYOZZGTFX3WAAWUWBW6KFNKERFROOAVH2IUFVAVYJG",
  },
];
