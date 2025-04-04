from enum import Enum


class Unit(Enum):
    # conversion factors to SI (g, mL)
    TEASPOON = ("tsp", 4.92892)
    TABLESPOON = ("tbsp", 14.7868)
    PINT = ("pt", 473.1765)
    QUART = ("qt", 946.3529)
    CUP = ("cup", 240)
    GALLON = ("gal", 3785.411784)
    OUNCE = ("oz", 28.3495)
    FLUID_OUNCE = ("fl oz", 29.5735)
    POUND = ("lb", 453.592)
    MILLILITER = ("mL", 1)
    LITER = ("L", 1000)
    GRAM = ("g", 1)
    KILOGRAM = ("kg", 1000)
    COUNT = ("", 1)

    def __new__(cls, label, factor):
        obj = object.__new__(cls)
        obj._value_ = label
        return obj

    def __init__(self, label, factor):
        self.label = label
        self.factor = factor

    def to_si(self, amount: float):
        return amount * self.factor

    @classmethod
    def from_label(cls, label: str):
        for unit in cls:
            if unit.label == label:
                return unit
        raise ValueError(f"No Unit found with label '{label}'!")


class Quantity:
    def __init__(self, amount: float, unit: Unit) -> None:
        self.amount = amount
        self.unit = unit

    def __repr__(self):
        return f"{self.unit} {self.unit.label}"

    def to_si(self) -> float:
        return self.unit.to_si(self.amount)
