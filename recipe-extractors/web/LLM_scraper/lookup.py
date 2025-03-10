# this is our master dictionary of supported websites
lookup_data = {
    "allrecipes": {
        "ingredient": {"tag": "ul", "attrs": {"class": "mm-recipes-structured-ingredients__list"}},
        "recipe_step": {"tag": "div", "attrs": {"id": "mm-recipes-steps_1-0"}},
        "recipe_details": {"tag": "div", "attrs":{"id": "mm-recipes-details_1-0"}},
        "nutrition_details": {"tag": "div", "attrs": {"id": "mm-recipes-nutrition-facts-summary_1-0"}}
    },
    "simplyrecipes": {
        "ingredient": {"tag": "ul", "attrs": {"class": "structured-ingredients__list text-passage"}},
        "recipe_step": {"tag": "div", "attrs": {"id": "structured-project__steps_1-0"}},
        "recipe_details": {"tag": "div", "attrs":{"id": "recipe-block_1-0"}},
        "nutrition_details": {"tag": "table", "attrs": {"class": "nutrition-info__table"}}
        
    },
}
