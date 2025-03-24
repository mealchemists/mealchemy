export interface Recipe{
    id:Number;
    name:string,
    cook_time: Number;
    prep_time: Number;
    total_time: Number;
    main_ingredient?:string | null;
    ingredients: Array<string>;
    steps: string | null;
    imageSrc: string; //Change later
    sourceUrl?: string | null
}

export interface Ingredient {
    id: Number,
    name: string
    calories_per_100g: Number,
    protein_per_100g: Number,
    carbs_per_100g: Number,
    sugar_per_100g: Number,
    fat_per_100g: Number,
    fiber_per_100g: Number,
    sodium_per_100mg: Number,
    aisle: String
}

export interface RecipeIngredient {
    id: Number,
    recipe: Recipe,
    ingredients: Ingredient[]
}