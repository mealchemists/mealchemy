from django.test.testcases import TestCase
from ..models.units import Quantity, Unit


class UnitsTest(TestCase):
    def test_from_label(self):
        label = "lb"
        unit = Unit.from_label(label)

        self.assertEqual(unit, Unit.POUND)

    def test_from_label_invalid(self):
        invalid_label = "foobar"

        with self.assertRaises(ValueError):
            _ = Unit.from_label(invalid_label)


class QuantityTest(TestCase):
    def test_to_si(self):
        # one_kg = Quantity(1, Unit.KILOGRAM)
        # self.assertAlmostEqual(one_kg.to_si(), 1000, places=3)

        # one_lb = Quantity(1, Unit.POUND)
        # self.assertAlmostEqual(one_lb.to_si(), 453.5, places=3)
        pass

    def test_convert_to(self):
        # one_kg = Quantity(1, Unit.KILOGRAM)
        # lb_equivalent = Quantity(2.204, Unit.POUND)
        # self.assertAlmostEqual(
        #     one_kg.convert_to(Unit.POUND).amount, lb_equivalent.amount, places=3
        # )
        pass

    def test_convert_to_invalid_type(self):
        # one_liter = Quantity(1, Unit.LITER)

        # with self.assertRaises(ValueError):
        #     one_liter.convert_to(Unit.KILOGRAM)
        pass
