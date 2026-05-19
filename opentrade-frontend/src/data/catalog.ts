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
    netPriceUSDC: 5000.00,
    supplierName: "Juan's Coffee Co.",
    supplierPublicKey: "GCJUAN7V2EXAMPLEKEYFORSTELLARTESTNET",
  },
  {
    id: "vietnamese-rice",
    name: "Vietnamese Jasmine Rice",
    mass: "5 Tons",
    netPriceUSDC: 2000.00,
    supplierName: "Linh Agriculture",
    supplierPublicKey: "GCLINH5M3PEXAMPLEKEYFORSTELLARTESTNET",
  },
  {
    id: "refurbished-smartphones",
    name: "Bulk Refurbished Smartphones",
    mass: "100 Units",
    netPriceUSDC: 1500.00,
    supplierName: "TechRecycle India",
    supplierPublicKey: "GCTECH8K7QWEXAMPLEKEYFORSTELLARTESTNET",
  },
];
