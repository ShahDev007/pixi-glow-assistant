// Single source of truth for all real Pixi data (spec Section 6).
// Nothing here is invented. Prices are indicative MSRP and must always be
// quoted as "around $X, check the product page for current pricing".

export type ProductCategory =
  | "tonic"
  | "cleanser"
  | "serum"
  | "moisturizer"
  | "mist"
  | "eye"
  | "spf"
  | "makeup"
  | "set";

export interface Product {
  id: string; // slug, e.g. 'glow-tonic'
  name: string;
  category: ProductCategory;
  collection: string | null;
  keyActives: string[];
  targets: string[];
  benefits: string[];
  howToUse: string;
  priceUsd: number; // indicative MSRP for the smallest/standard size
  priceNote: string; // human readable price range incl. sizes
  size: string;
  productUrl: string;
}

// Section 6c: real Pixi products to seed.
export const PRODUCTS: Product[] = [
  {
    id: "glow-tonic",
    name: "Glow Tonic",
    category: "tonic",
    collection: "Glow",
    keyActives: ["5% glycolic acid", "aloe vera", "ginseng"],
    targets: ["dull", "uneven tone", "all skin types"],
    benefits: ["Brightening", "Glow Enhancing", "Gentle Exfoliation"],
    howToUse:
      "After cleansing, saturate a cotton pad and sweep over the face, neck, and decolletage. Avoid the eyes. Follow with SPF in the AM.",
    priceUsd: 15,
    priceNote: "around $15 (100ml) or $29 (250ml)",
    size: "100ml / 250ml",
    productUrl: "https://www.pixibeauty.com/products/glow-tonic",
  },
  {
    id: "glow-tonic-to-go",
    name: "Glow Tonic To-Go",
    category: "tonic",
    collection: "Glow",
    keyActives: ["5% glycolic acid", "aloe vera", "ginseng"],
    targets: ["dull", "on-the-go exfoliation", "all skin types"],
    benefits: ["Brightening", "Convenient", "Glow Enhancing"],
    howToUse:
      "Sweep one pre-soaked pad over clean skin, avoiding the eyes. Perfect for travel and the gym.",
    priceUsd: 18,
    priceNote: "around $18 (60 pads)",
    size: "60 pads",
    productUrl: "https://www.pixibeauty.com/products/glow-tonic-to-go",
  },
  {
    id: "vitamin-c-tonic",
    name: "Vitamin-C Tonic",
    category: "tonic",
    collection: "Vitamin-C",
    keyActives: ["vitamin C", "ferulic acid", "probiotics"],
    targets: ["dark spots", "uneven tone", "dullness"],
    benefits: ["Brightening", "Antioxidant", "Even Tone"],
    howToUse:
      "After cleansing, sweep a saturated cotton pad over the face and neck. Great for AM brightening. Follow with SPF.",
    priceUsd: 15,
    priceNote: "around $15 (100ml) or $29 (250ml)",
    size: "100ml / 250ml",
    productUrl: "https://www.pixibeauty.com/products/vitamin-c-tonic",
  },
  {
    id: "hydrating-milky-tonic",
    name: "Hydrating Milky Tonic",
    category: "tonic",
    collection: "Hydrating Milky",
    keyActives: ["jojoba milk", "oat", "green tea"],
    targets: ["dry", "dehydrated", "sensitive"],
    benefits: ["Hydrating", "Soothing", "Skin-loving"],
    howToUse:
      "After cleansing, sweep a saturated cotton pad over the face and neck to replenish moisture. Gentle enough for daily AM and PM use.",
    priceUsd: 22,
    priceNote: "around $22 to $29",
    size: "100ml / 250ml",
    productUrl: "https://www.pixibeauty.com/products/hydrating-milky-tonic",
  },
  {
    id: "botanical-collagen-tonic",
    name: "Botanical Collagen Tonic",
    category: "tonic",
    collection: "Collagen",
    keyActives: ["acacia collagen", "peptides"],
    targets: ["fine lines", "loss of firmness", "aging"],
    benefits: ["Firming", "Plumping", "Smoothing"],
    howToUse:
      "After cleansing, sweep a saturated cotton pad over the face and neck to help firm and plump. Use AM or PM.",
    priceUsd: 15,
    priceNote: "around $15 (100ml) or $29 (250ml)",
    size: "100ml / 250ml",
    productUrl: "https://www.pixibeauty.com/products/botanical-collagen-tonic",
  },
  {
    id: "clarity-tonic",
    name: "Clarity Tonic",
    category: "tonic",
    collection: "Clarity",
    keyActives: ["salicylic acid"],
    targets: ["acne-prone", "breakouts", "congestion"],
    benefits: ["Clarifying", "Pore Refining", "Balancing"],
    howToUse:
      "After cleansing, sweep a saturated cotton pad over congested areas, avoiding the eyes. Follow with SPF in the AM.",
    priceUsd: 15,
    priceNote: "around $15 (100ml) or $29 (250ml)",
    size: "100ml / 250ml",
    productUrl: "https://www.pixibeauty.com/products/clarity-tonic",
  },
  {
    id: "rose-tonic",
    name: "Rose Tonic",
    category: "tonic",
    collection: "Rose Infused",
    keyActives: ["rose flower extract", "elderflower", "chamomile"],
    targets: ["redness", "easily irritated", "sensitive"],
    benefits: ["Calming", "Toning", "Refreshing"],
    howToUse:
      "After cleansing, sweep a saturated cotton pad over the face and neck to calm and refresh. Lovely as an AM tonic.",
    priceUsd: 15,
    priceNote: "around $15 (100ml) or $29 (250ml)",
    size: "100ml / 250ml",
    productUrl: "https://www.pixibeauty.com/products/rose-tonic",
  },
  {
    id: "retinol-tonic",
    name: "Retinol Tonic",
    category: "tonic",
    collection: "Retinol",
    keyActives: ["time-release retinol", "peptides"],
    targets: ["fine lines", "smoothing", "anti-aging"],
    benefits: ["Smoothing", "Renewing", "Nighttime Care"],
    howToUse:
      "PM only. After cleansing, sweep a saturated cotton pad over the face and neck. Always follow with SPF the next morning.",
    priceUsd: 15,
    priceNote: "around $15 (100ml) or $29 (250ml)",
    size: "100ml / 250ml",
    productUrl: "https://www.pixibeauty.com/products/retinol-tonic",
  },
  {
    id: "glow-mud-cleanser",
    name: "Glow Mud Cleanser",
    category: "cleanser",
    collection: "Glow",
    keyActives: ["5% glycolic acid", "mud", "aloe"],
    targets: ["dull", "congestion", "deep cleanse"],
    benefits: ["Deep Cleansing", "Brightening", "Purifying"],
    howToUse:
      "Massage onto damp skin, then rinse with warm water. Use as the first step of your routine.",
    priceUsd: 18,
    priceNote: "around $18",
    size: "135ml",
    productUrl: "https://www.pixibeauty.com/products/glow-mud-cleanser",
  },
  {
    id: "vitamin-c-juice-cleanser",
    name: "Vitamin-C Juice Cleanser",
    category: "cleanser",
    collection: "Vitamin-C",
    keyActives: ["vitamin C", "ferulic acid"],
    targets: ["dull", "uneven tone"],
    benefits: ["Brightening", "No-Rinse", "Refreshing"],
    howToUse:
      "Sweep over the face with a cotton pad as a no-rinse cleanse, or rinse if preferred. Great as a quick AM step.",
    priceUsd: 18,
    priceNote: "around $18",
    size: "150ml",
    productUrl: "https://www.pixibeauty.com/products/vitamin-c-juice-cleanser",
  },
  {
    id: "rose-cream-cleanser",
    name: "Rose Cream Cleanser",
    category: "cleanser",
    collection: "Rose Infused",
    keyActives: ["rose", "chamomile"],
    targets: ["sensitive", "dry", "redness"],
    benefits: ["Gentle", "Soothing", "Nourishing"],
    howToUse:
      "Massage onto damp skin, then rinse or tissue off. Gentle enough for sensitive skin morning and night.",
    priceUsd: 18,
    priceNote: "around $18",
    size: "135ml",
    productUrl: "https://www.pixibeauty.com/products/rose-cream-cleanser",
  },
  {
    id: "botanical-collagen-retinol-serum",
    name: "Botanical Collagen & Retinol Serum",
    category: "serum",
    collection: "Collagen",
    keyActives: ["acacia collagen", "retinol", "niacinamide"],
    targets: ["fine lines", "firmness", "smoothing"],
    benefits: ["Firming", "Smoothing", "Nighttime Care"],
    howToUse:
      "PM. After tonic, smooth a few drops over the face and neck before moisturizer.",
    priceUsd: 24,
    priceNote: "around $24",
    size: "30ml",
    productUrl:
      "https://www.pixibeauty.com/products/botanical-collagen-retinol-serum",
  },
  {
    id: "vitamin-c-cremeserum",
    name: "Vitamin-C CremeSerum",
    category: "serum",
    collection: "Vitamin-C",
    keyActives: ["encapsulated vitamin C", "niacinamide", "ferulic acid"],
    targets: ["dullness", "uneven tone", "dryness"],
    benefits: ["Brightening", "2-in-1 Moisturizing", "Antioxidant"],
    howToUse:
      "AM. After tonic, smooth over the face and neck. Doubles as a brightening moisturizer. Follow with SPF.",
    priceUsd: 24,
    priceNote: "around $24",
    size: "30ml",
    productUrl: "https://www.pixibeauty.com/products/vitamin-c-cremeserum",
  },
  {
    id: "overnight-retinol-oil",
    name: "Overnight Retinol Oil",
    category: "serum",
    collection: "Retinol",
    keyActives: ["retinol blend"],
    targets: ["fine lines", "anti-aging", "smoothing"],
    benefits: ["Renewing", "Nourishing", "Nighttime Care"],
    howToUse:
      "PM only. After tonic, press a few drops into the skin. Always follow with SPF the next morning.",
    priceUsd: 24,
    priceNote: "around $24",
    size: "30ml",
    productUrl: "https://www.pixibeauty.com/products/overnight-retinol-oil",
  },
  {
    id: "rose-ceramide-cream",
    name: "Rose Ceramide Cream",
    category: "moisturizer",
    collection: "Rose Infused",
    keyActives: ["rose oil", "ceramide NP", "probiotics"],
    targets: ["dry", "sensitive", "rich hydration"],
    benefits: ["Rich Hydration", "Barrier Support", "Soothing"],
    howToUse:
      "AM or PM, as the last skincare step before SPF. Smooth over the face and neck.",
    priceUsd: 24,
    priceNote: "around $24",
    size: "50ml",
    productUrl: "https://www.pixibeauty.com/products/rose-ceramide-cream",
  },
  {
    id: "hydrating-milky-mist",
    name: "Hydrating Milky Mist",
    category: "mist",
    collection: "Hydrating Milky",
    keyActives: ["hyaluronic acid", "black oat"],
    targets: ["dehydrated", "hydration top-up", "all skin types"],
    benefits: ["Hydrating", "Refreshing", "Skin-loving"],
    howToUse:
      "Mist over the face any time skin needs a hydration boost, over or under makeup.",
    priceUsd: 16,
    priceNote: "around $16",
    size: "80ml",
    productUrl: "https://www.pixibeauty.com/products/hydrating-milky-mist",
  },
  {
    id: "makeup-fixing-mist",
    name: "Makeup Fixing Mist",
    category: "mist",
    collection: "Makeup",
    keyActives: ["rose water", "green tea"],
    targets: ["set makeup", "longwear", "all skin types"],
    benefits: ["Setting", "Refreshing", "Longwear"],
    howToUse:
      "Mist over finished makeup to set, or over bare skin to refresh.",
    priceUsd: 16,
    priceNote: "around $16",
    size: "80ml",
    productUrl: "https://www.pixibeauty.com/products/makeup-fixing-mist",
  },
  {
    id: "detoxifeye-patches",
    name: "DetoxifEYE Patches",
    category: "eye",
    collection: "Eye",
    keyActives: ["caffeine", "cucumber", "gold", "hyaluronic acid"],
    targets: ["puffiness", "dark circles", "tired eyes"],
    benefits: ["Depuffing", "Brightening", "Cooling"],
    howToUse:
      "Place under clean eyes for 10 minutes, then pat in any remaining essence. Use AM for a depuffing boost.",
    priceUsd: 24,
    priceNote: "around $24",
    size: "30 pairs",
    productUrl: "https://www.pixibeauty.com/products/detoxifeye",
  },
  {
    id: "beautifeye",
    name: "BeautifEYE",
    category: "eye",
    collection: "Eye",
    keyActives: ["vitamin C", "licorice", "ginseng"],
    targets: ["dark circles", "dullness around eyes"],
    benefits: ["Brightening", "Energizing", "Skin-loving"],
    howToUse: "Pat a small amount around the eye area AM and PM.",
    priceUsd: 24,
    priceNote: "around $24",
    size: "25ml",
    productUrl: "https://www.pixibeauty.com/products/beautifeye",
  },
  {
    id: "on-the-glow-shield-spf-50",
    name: "On-the-Glow SHIELD SPF 50",
    category: "spf",
    collection: "Glow",
    keyActives: ["avobenzone", "hyaluronic acid", "vitamin E"],
    targets: ["sun protection", "all skin types", "daily defense"],
    benefits: ["Broad-Spectrum SPF 50", "Hydrating", "Skincare-infused"],
    howToUse:
      "AM, as the final step. Smooth generously over the face and neck and reapply through the day. Ships ground only.",
    priceUsd: 18,
    priceNote: "around $18",
    size: "50ml",
    productUrl: "https://www.pixibeauty.com/products/on-the-glow-shield",
  },
  {
    id: "h2o-skintint",
    name: "H2O SkinTint",
    category: "makeup",
    collection: "ColourTreats",
    keyActives: ["hyaluronic acid gel tint"],
    targets: ["dewy coverage", "light coverage", "all skin types"],
    benefits: ["Dewy Finish", "Light Coverage", "Hydrating"],
    howToUse:
      "Smooth a small amount over moisturized skin for a fresh, dewy veil of color. Available in 18 shades.",
    priceUsd: 25,
    priceNote: "around $25",
    size: "45ml, 18 shades",
    productUrl: "https://www.pixibeauty.com/products/h2o-skintint",
  },
  {
    id: "on-the-glow-base",
    name: "On-the-Glow BASE",
    category: "makeup",
    collection: "ColourTreats",
    keyActives: ["foundation moisture stick"],
    targets: ["buildable base", "dewy coverage", "all skin types"],
    benefits: ["Buildable", "Moisturizing", "On-the-go"],
    howToUse:
      "Swipe the stick over the skin and blend with fingertips. Build for more coverage. Available in 18 shades.",
    priceUsd: 22,
    priceNote: "around $22",
    size: "Stick, 18 shades",
    productUrl: "https://www.pixibeauty.com/products/on-the-glow-base",
  },
  {
    id: "on-the-glow-blush",
    name: "On-the-Glow Blush",
    category: "makeup",
    collection: "ColourTreats",
    keyActives: ["pH-reactive cream", "ginseng", "squalane"],
    targets: ["natural flush", "dewy color"],
    benefits: ["Natural Flush", "Cream-to-Skin", "On-the-go"],
    howToUse:
      "Swipe over the cheeks and blend. The pH-reactive formula adapts to a natural-looking flush.",
    priceUsd: 12,
    priceNote: "around $12",
    size: "Stick",
    productUrl: "https://www.pixibeauty.com/products/on-the-glow-blush",
  },
  {
    id: "flawless-beauty-primer",
    name: "Flawless Beauty Primer",
    category: "makeup",
    collection: "ColourTreats",
    keyActives: ["jojoba", "rose", "vitamin E"],
    targets: ["glow base", "smooth makeup application"],
    benefits: ["Glow Priming", "Smoothing", "Skin-loving"],
    howToUse:
      "Smooth over moisturized skin before makeup for a glowing, even base.",
    priceUsd: 22,
    priceNote: "around $22",
    size: "30ml",
    productUrl: "https://www.pixibeauty.com/products/flawless-beauty-primer",
  },
  {
    id: "endless-silky-eye-pen",
    name: "Endless Silky Eye Pen",
    category: "makeup",
    collection: "ColourTreats",
    keyActives: ["waterproof gel liner", "vitamin E"],
    targets: ["eye definition", "longwear liner"],
    benefits: ["Waterproof", "Longwear", "Precise"],
    howToUse:
      "Glide along the lash line for precise definition. Waterproof, vegan formula.",
    priceUsd: 12,
    priceNote: "around $12",
    size: "Pen",
    productUrl: "https://www.pixibeauty.com/products/endless-silky-eye-pen",
  },
  {
    id: "glow-and-go-kit",
    name: "Glow & Go Kit",
    category: "set",
    collection: "Glow",
    keyActives: ["glow tonic minis"],
    targets: ["starter glow routine", "all skin types", "travel"],
    benefits: ["Starter Set", "Travel-friendly", "Great Value"],
    howToUse:
      "A bundle of Glow minis to build a starter glow routine or to travel with.",
    priceUsd: 28,
    priceNote: "around $28",
    size: "Bundle",
    productUrl: "https://www.pixibeauty.com/products/glow-and-go-kit",
  },
];

// Section 6b: the 8-tonic decision tree (concern to recommended tonic).
export interface TonicTreeEntry {
  concern: string;
  productId: string;
  collection: string;
}

export const TONIC_TREE: TonicTreeEntry[] = [
  { concern: "Dull, uneven, wants glow, exfoliation", productId: "glow-tonic", collection: "Glow" },
  { concern: "Dark spots, brightening, antioxidant", productId: "vitamin-c-tonic", collection: "Vitamin-C" },
  { concern: "Dry, dehydrated, sensitive, soothing", productId: "hydrating-milky-tonic", collection: "Hydrating Milky" },
  { concern: "Fine lines, loss of firmness, plumping", productId: "botanical-collagen-tonic", collection: "Collagen" },
  { concern: "Acne-prone, breakouts, congestion", productId: "clarity-tonic", collection: "Clarity" },
  { concern: "Redness, easily irritated, calming", productId: "rose-tonic", collection: "Rose Infused" },
  { concern: "Anti-aging, smoothing, nighttime", productId: "retinol-tonic", collection: "Retinol" },
  { concern: "Wants a 3-in-1 essence-toner-serum", productId: "antioxidant-tonic", collection: "Antioxidant" },
];

// Section 6d: official routine framework.
export const ROUTINE_FRAMEWORK = {
  steps: [
    { step: 1, name: "Cleanse", detail: "Start with a Pixi cleanser suited to your skin." },
    { step: 2, name: "Tonic", detail: "Saturate a cotton pad and sweep over the face, neck, and decolletage, avoiding the eyes." },
    { step: 3, name: "Serum or Oil", detail: "Press a targeted serum or oil into the skin." },
    { step: 4, name: "Moisturizer", detail: "Seal in hydration with a moisturizer suited to your skin." },
  ],
  amNote: "Always finish with SPF in the AM, especially when using glycolic acid or retinol.",
  signaturePairings: [
    "Petra loves Rose Tonic in the AM with Glow Tonic in the PM.",
    "Try Overnight Retinol Oil in the PM with Botanical Collagen Serum in the AM.",
  ],
};

// Section 6a: brand voice.
export const BRAND_VOICE = `Pixi is an independent, family-owned British brand founded in 1999 by Petra Strand in Soho, London, with US HQ in Century City, Los Angeles. Core idea: enhance, never mask, your natural beauty. Tone is warm, simplicity-first (you only need a few products), encouraging, never clinical or preachy. Signature language includes glow-getters, skin-loving, multi-tasking, and the hashtags PixiGlow and PixiPerfect. The hero product is Glow Tonic.`;

// Section 6e: real CX policies (Care Agent answers from these).
export interface PolicyDoc {
  id: string;
  docType: "policy" | "faq" | "routine" | "brand" | "guardrail";
  title: string;
  content: string;
}

export const POLICY_DOCS: PolicyDoc[] = [
  {
    id: "policy-returns",
    docType: "policy",
    title: "Returns and refunds",
    content:
      "Returns are accepted within 30 days, for items unopened or gently used. Email customercare@pixibeauty.com for instructions. Return shipping is generally the customer's responsibility. Free gifts, promo items, heavily used products, incomplete sets, and third-party-retailer purchases are not returnable. Refunds go to the original payment method within 2 to 5 business days.",
  },
  {
    id: "policy-shipping",
    docType: "policy",
    title: "Shipping (US)",
    content:
      "US shipping is free over $45. USPS Ground takes 2 to 7 business days. Orders ship from Las Vegas or Pennsylvania and most process within about 24 hours. Alaska and Hawaii add $10. We do not ship to APO/FPO or PO boxes. SPF and aerosol items ship ground only.",
  },
  {
    id: "policy-payments",
    docType: "policy",
    title: "Payments and tax",
    content:
      "We accept Visa, Mastercard, Amex, Discover, Klarna, and Catch. Sales tax is collected in CA and NY.",
  },
  {
    id: "policy-loyalty",
    docType: "policy",
    title: "Loyalty and saving",
    content:
      "Pixi Rewards gives 50 points just to sign up. Subscribe and Save takes 10% off. Back-in-stock email alerts are available. There is a maximum of 10 units per item.",
  },
  {
    id: "policy-contact",
    docType: "policy",
    title: "Contact",
    content:
      "Reach customer care at customercare@pixibeauty.com or US 1.201.512.5675, Monday to Friday 8am to 5pm PST.",
  },
  {
    id: "brand-voice",
    docType: "brand",
    title: "Brand voice",
    content: BRAND_VOICE,
  },
  {
    id: "routine-framework",
    docType: "routine",
    title: "Routine framework",
    content:
      "Step 1 Cleanse, Step 2 Tonic (saturate a cotton pad, sweep face, neck, and decolletage, avoid the eyes), Step 3 Serum or Oil, Step 4 Moisturizer, plus SPF in the AM especially when using glycolic acid or retinol. Signature pairings: Rose Tonic AM with Glow Tonic PM; Overnight Retinol Oil PM with Botanical Collagen Serum AM.",
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
