import os
import sys
import django
from pathlib import Path
import spacy
import re

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../"))
sys.path.insert(0, ROOT_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()


from backend.apps.recipes.models.ingredients import Ingredient
from backend.apps.recipes.models.recipe import Recipe
from django.conf import settings


PHYSICAL_DESCRIPTOR_PATTERN = (
    r"\b("
    r"chopped|sliced|diced|shredded|grated|minced|crushed|mashed|"
    r"julienned|cubed|quartered|halved|peeled|cored|pitted|trimmed|"
    r"stemmed|deveined|zested|rinsed|washed|pre-washed|unpeeled|"
    r"untrimmed|destemmed|skinned|cut|smashed|torn|broken|separated|"
    r"cracked|split|scraped|shelled|snapped|chipped|ground|slivered|"
    r"spiralized"
    r")\b"
)

nlp = spacy.load("en_core_web_sm")


def main():
    fetch_ingredient_names()


def trim_physical(ingredient_name):
    # TODO: use named entity recognition to extract food names, and use FDC's search operators...
    ingredient_name = ingredient_name.lower()
    ingredient_name = re.sub(
        PHYSICAL_DESCRIPTOR_PATTERN,
        "",
        ingredient_name,
    )

    # trim multiple commas/spaces
    ingredient_name = re.sub(r"\s*,\s*", ", ", ingredient_name)
    ingredient_name = re.sub(r"\s+", " ", ingredient_name)
    return ingredient_name.strip()


def extract_head_noun(chunk):
    return chunk.root.lemma_.lower()


# def preprocess_ingredient_names(names):
#     for name in names:
#         trimmed = trim_physical(name)
#
#         doc = nlp(trimmed)
#
#         noun_chunks = list(doc.noun_chunks)
#         if noun_chunks:
#             core = extract_head_noun(noun_chunks[0])
#         else:
#             core = doc.root.lemma_.lower()
#
#         print(f"{trimmed} -> {str(core).strip()}")
#
#     return


# NOTE: approach 1: enough information removed, some issue w/ chicken breasts
# def extract_core_ingredient(ingredient_text):
#     """
#     Extract the core ingredient name using spaCy's noun chunk extraction and dependency parsing.
#     """
#     doc = nlp(ingredient_text)
#
#     # Use the first noun chunk if available
#     noun_chunks = list(doc.noun_chunks)
#     if noun_chunks:
#         chunk = noun_chunks[0]
#     else:
#         chunk = doc  # fallback
#
#     # Identify the head of the chunk
#     head = chunk.root
#
#     # Gather compounds and adjectives that occur before the head
#
#     # NOTE: Temp
#     # compounds = [
#     #     token
#     #     for token in chunk
#     #     if token.dep_ in ("compound", "amod") and token.i < head.i
#     # ]
#     #
#     # # Combine the compound modifiers with the head
#     # core_tokens = compounds + [head]
#     # # Sort tokens in original order
#     # core_tokens = sorted(core_tokens, key=lambda token: token.i)
#     #
#     # # Lemmatize and join tokens
#     # core_ingredient = " ".join([token.lemma_.lower() for token in core_tokens])
#     # return core_ingredient
#
#     # Get only the compound children that are directly attached to the head
#     compounds = [child for child in head.lefts if child.dep_ == "compound"]
#     # Sort compounds by their order in the text
#     compounds = sorted(compounds, key=lambda t: t.i)
#
#     # Reconstruct the core ingredient using the compounds and the head (lemmatized)
#     core_tokens = compounds + [head]
#     core = " ".join([token.lemma_.lower() for token in core_tokens])
#     return core


# NOTE: approach 2: too much information removed
# def extract_core_ingredient(text):
#     """
#
#     Extracts the core ingredient by:
#       1. Finding all NOUN/PROPN tokens in the text.
#       2. Choosing the last noun as the head (typically the main substance).
#       3. Gathering tokens directly attached to the head with dependency 'compound'.
#
#
#     This approach is less likely to include adjectives like "skinless" that modify other words.
#     """
#     doc = nlp(text)
#
#     # Get all tokens that are nouns or proper nouns.
#     noun_tokens = [t for t in doc if t.pos_ in ("NOUN", "PROPN")]
#     if not noun_tokens:
#         return text  # Fallback if no noun found.
#
#     # Use the last noun as the head.
#     head = noun_tokens[-1]
#
#     # Find tokens directly attached to the head with a 'compound' dependency.
#
#     compounds = [t for t in head.lefts if t.dep_ == "compound"]
#     compounds = sorted(compounds, key=lambda t: t.i)
#
#     # Construct the core ingredient: compounds + head.
#     core_tokens = compounds + [head]
#     # Join lemmatized tokens in document order.
#
#     core = " ".join(token.lemma_.lower() for token in core_tokens)
#     return core


def extract_core_ingredient(text):
    """

    Extract the core ingredient in a flexible way:
      1. Process the (optionally trimmed) text with spaCy.

      2. Use the first noun chunk.
         - If that chunk contains a coordinating conjunction (e.g. "salt and pepper"),
           return the full chunk.

         - Otherwise, if the chunk contains a comma (e.g. "olive oil, or as needed"),
           return only the text before the comma.
         - Otherwise, use dependency parsing to collect the head noun plus its direct
           compounds/adjectival modifiers (including nested adjectives) from the chunk.
    """
    doc = nlp(text)
    noun_chunks = list(doc.noun_chunks)
    if not noun_chunks:
        return text.strip()

    first_chunk = noun_chunks[0]
    chunk_text = first_chunk.text.strip()

    # If the chunk contains a comma and phrases like "or" (suggesting extra instructions),
    # then take only the part before the comma.
    if "," in chunk_text and "or" in chunk_text:
        return chunk_text.split(",")[0].strip()

    # If the chunk shows coordination (e.g., "salt and pepper"), return the full chunk.

    if any(token.dep_ in ("cc", "conj") for token in first_chunk):
        return chunk_text

    # Otherwise, use dependency parsing to extract key tokens.
    head = first_chunk.root
    # Collect direct left modifiers from the head.
    modifiers = []
    for token in head.lefts:
        # Include compound words and adjectives.
        if token.dep_ in ("compound", "amod"):
            # Also include any adjectives attached to these modifiers.
            nested_amod = [child for child in token.lefts if child.dep_ == "amod"]

            modifiers.extend(nested_amod + [token])

    # Sort modifiers in document order and combine with head.
    all_tokens = sorted(modifiers + [head], key=lambda t: t.i)
    # Join the tokens without lemmatizing to preserve original descriptors like "all-purpose" or "red".
    core = " ".join(token.text for token in all_tokens).strip()
    return core


def fetch_ingredient_names():
    global ingredient_names
    ingredient_names = [i.name for i in Ingredient.objects.all()]
    print(f"Loaded {len(ingredient_names)} ingredient names.")

    for ingredient in ingredient_names:
        trimmed = trim_physical(ingredient)
        core = extract_core_ingredient(trimmed)

        print(f"{trimmed} -> {str(core).strip()}")


if __name__ == "__main__":
    main()
