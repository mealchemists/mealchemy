export interface Recipe{
    title:string,
    cookTime: Number;
    prepTime: Number;
    totalTime: Number;
    mainIngredient:string;
    ingredients: Array<string>;
    steps: Array<string> | null;
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
    recipe: Recipe
    ingredients: Ingredient[]
}