from enum import Enum


class Unit(Enum):
    # Utility class used for calculating units (in the shopping list, nutritional details, etc)
    # conversion factors to SI (g, mL)
    TEASPOON = ("tsp", 4.92892, "volume")
    TABLESPOON = ("tbsp", 14.7868, "volume")
    PINT = ("pt", 473.1765, "volume")
    QUART = ("qt", 946.3529, "volume")
    CUP = ("cup", 240, "volume")
    GALLON = ("gal", 3785.411784, "volume")
    OUNCE = ("oz", 28.3495, "mass")
    FLUID_OUNCE = ("fl oz", 29.5735, "volume")
    POUND = ("lb", 453.592, "mass")
    MILLILITER = ("mL", 1, "volume")
    LITER = ("L", 1000, "volume")
    GRAM = ("g", 1, "mass")
    KILOGRAM = ("kg", 1000, "mass")
    COUNT = ("", 1, "count")

    def __new__(cls, label, si_factor, measurement_type):
        obj = object.__new__(cls)
        obj._value_ = label
        obj.si_factor = si_factor  # type: ignore
        obj.measurement_type = measurement_type  # type: ignore
        return obj

    def __init__(self, label, si_factor, measurement_type):
        self.label = label

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
        return f"{self.amount} {self.unit.label}"

    def to_si(self) -> float:
        return self.amount * self.unit.si_factor  # pyright: ignore

    def base_si_unit(self) -> str:
        measurement_type = self.unit.measurement_type  # pyright: ignore

        if measurement_type == "mass":
            return "g"
        elif measurement_type == "volume":
            return "mL"
        else:
            # we are dealing with a count unit
            return ""

    def convert_to(self, target_unit: Unit):
        current_type = self.unit.measurement_type  # pyright: ignore
        target_type = target_unit.measurement_type  # pyright: ignore

        if current_type != target_type:
            raise ValueError(
                f"Cannot convert between types {current_type} and {target_type}!"
            )

        si_amount = self.to_si()
        target_amount = si_amount / target_unit.si_factor  # pyright: ignore

        return Quantity(target_amount, target_unit)
