export interface Recipe{
    title:String,
    cookingTime: Number;
    tags: Array<String>;
    ingredients: Array<String>;
    instructions: Array<String>
    imageSrc: String; //Change later
}