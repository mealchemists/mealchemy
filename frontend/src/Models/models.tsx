export interface Recipe{
    id:number;
    name:string,
    cook_time: Number;
    prep_time: Number;
    total_time: Number;
    main_ingredient?:string | null;
    ingredients: Array<string>;
    image_url: string | null; //Change later
    sourceUrl?: string | null
    steps: Array<RecipeStep>,
    needs_review?: Boolean|null
}


export interface Ingredient {
    id: Number,
    name: string,
    quantity: Number,
    unit: string,
    calories_per_100g: Number,
    protein_per_100g: Number,
    carbs_per_100g: Number,
    sugar_per_100g: Number,
    fat_per_100g: Number,
    fiber_per_100g: Number,
    sodium_per_100mg: Number,
    needs_review?: Boolean| null,
    aisle: String
}

export interface RecipeIngredient {
    id: Number,
    needs_review?: Boolean|null,
    recipe: Recipe,
    ingredients: Ingredient[]
    added_by_extractor: Boolean
}

export interface RecipeStep {
    id: Number,
    step_number: Number,
    description: String,
    recipe: Number
}

export interface FilterObject {
    searchQuery?: string;
    filters?: string[];
    sortBy?: string;
    range?: number[];
    needs_review: boolean,
    mainIngredient?: string;
}


export interface FilterObject {
    searchQuery?: string;
    filters?: string[];
    sortBy?: string;
    range?: number[];
    mainIngredient?: string;
}

export enum Unit {
    None = '',
    Teaspoon = 'tsp',
    Tablespoon = 'tbsp',
    Cup = 'cup',
    Ounce = 'oz',
    Gram = 'g',
    Pound = 'lb',
    FluidOunce = 'fl oz',
    Mililiter = 'mL',
    Liter = 'L',
    Kilogram = 'kg',
    Pint = 'pt',
    Quart = 'qt',
    Gallon = 'gal',
}
