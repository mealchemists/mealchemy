export interface Recipe{
    title:String,
    cookTime: Number;
    prepTime: Number;
    totalTime: Number;
    mainIngredient:String;
    ingredients: Array<String>;
    instructions: Array<String>;
    imageSrc: String; //Change later
}