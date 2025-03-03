export interface Recipe{
    title:string,
    cookTime: Number;
    prepTime: Number;
    totalTime: Number;
    mainIngredient:string;
    ingredients: Array<string>;
    instructions: Array<string>;
    imageSrc: string; //Change later
}