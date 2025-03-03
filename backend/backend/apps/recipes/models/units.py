from enum import Enum

class Unit(Enum):
    def to_base_unit(self, amount: float):
        return amount * self.value
    
    @property
    def label(self):
        return self._label_
    
    @label.setter
    def label(self, new_label):
        self._label_ = new_label

class VolumeUnit(Unit):
    TEASPOON = ("tsp", 4.92892)
    TABLESPOON = ("tbsp", 14.7868)
    CUP = ("cup", 240)
    FLUID_OUNCE = ("fl oz", 29.5735)
    LITER = ("L", 1000)
    MILLILITER = ("mL", 1)
    
    def __new__(cls, label, value):
        obj = object.__new__(cls)
        obj._value_ = value
        obj.label = label
        return obj
    
class MassUnit(Unit):
    OUNCE = ("oz", 28.3495)
    POUND = ("lb", 453.592)
    GRAM = ("g", 1)
    KILOGRAM = ("kg", 1000)

    def __new__(cls, label, value):
        obj = object.__new__(cls)
        obj._value_ = value
        obj.label = label
        return obj
    
class CountUnit(Unit):
    COUNT = ("", 1)
    
    def __new__(cls, label, value):
        obj = object.__new__(cls)
        obj._value_ = value
        obj.label = label
        return obj