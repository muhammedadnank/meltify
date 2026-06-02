from django.db import models


class Flavour(models.Model):
    """Ice cream flavour category — e.g. Chocolate, Fruit, Nutty"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Scoop(models.Model):
    """A single ice cream product/item"""

    SCOOP_TYPE_CHOICES = (
        ('cone', 'Cone'),
        ('cup', 'Cup'),
        ('bar', 'Bar'),
        ('sandwich', 'Sandwich'),
        ('sundae', 'Sundae'),
    )

    name = models.CharField(max_length=500)
    flavour = models.ForeignKey(Flavour, on_delete=models.CASCADE, related_name="scoops")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    stock = models.IntegerField()
    scoop_type = models.CharField(max_length=20, choices=SCOOP_TYPE_CHOICES, default='cone')
    is_active = models.BooleanField(default=True)
    is_vegan = models.BooleanField(default=False)
    is_sugar_free = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class ScoopImage(models.Model):
    scoop = models.ForeignKey(Scoop, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to='scoops/')

    def __str__(self):
        return f"Image for {self.scoop.name}"
