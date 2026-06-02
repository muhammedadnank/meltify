from django.core.management.base import BaseCommand
from scoop.models import Flavour, Scoop
from account.models import User


class Command(BaseCommand):
    help = 'Seed database with sample Meltify data'

    def handle(self, *args, **kwargs):
        self.stdout.write('🍦 Seeding Meltify data...')

        # ── Flavours ──────────────────────────────────────────
        flavours_data = [
            {'name': 'Chocolate',    'description': 'Rich and creamy chocolate'},
            {'name': 'Vanilla',      'description': 'Classic smooth vanilla'},
            {'name': 'Strawberry',   'description': 'Fresh strawberry burst'},
            {'name': 'Mango',        'description': 'Tropical mango delight'},
            {'name': 'Butterscotch', 'description': 'Sweet caramel butterscotch'},
            {'name': 'Pistachio',    'description': 'Nutty pistachio cream'},
        ]

        flavours = {}
        for f in flavours_data:
            obj, created = Flavour.objects.get_or_create(name=f['name'], defaults={'description': f['description']})
            flavours[f['name']] = obj
            if created:
                self.stdout.write(f"  ✅ Flavour: {obj.name}")

        # ── Scoops ────────────────────────────────────────────
        scoops_data = [
            {
                'name': 'Dark Choco Cone',
                'flavour': 'Chocolate',
                'price': 80,
                'description': 'A rich dark chocolate ice cream served in a crispy cone.',
                'stock': 50,
                'scoop_type': 'cone',
                'is_vegan': False,
                'is_sugar_free': False,
            },
            {
                'name': 'Classic Vanilla Cup',
                'flavour': 'Vanilla',
                'price': 60,
                'description': 'Smooth and creamy classic vanilla in a paper cup.',
                'stock': 40,
                'scoop_type': 'cup',
                'is_vegan': False,
                'is_sugar_free': False,
            },
            {
                'name': 'Strawberry Sundae',
                'flavour': 'Strawberry',
                'price': 120,
                'description': 'Fresh strawberry ice cream topped with fruit sauce.',
                'stock': 30,
                'scoop_type': 'sundae',
                'is_vegan': True,
                'is_sugar_free': False,
            },
            {
                'name': 'Mango Bar',
                'flavour': 'Mango',
                'price': 50,
                'description': 'Tropical mango flavour on a stick — summer in every bite.',
                'stock': 60,
                'scoop_type': 'bar',
                'is_vegan': True,
                'is_sugar_free': False,
            },
            {
                'name': 'Butterscotch Sandwich',
                'flavour': 'Butterscotch',
                'price': 90,
                'description': 'Creamy butterscotch ice cream between two cookies.',
                'stock': 25,
                'scoop_type': 'sandwich',
                'is_vegan': False,
                'is_sugar_free': False,
            },
            {
                'name': 'Pistachio Cup',
                'flavour': 'Pistachio',
                'price': 110,
                'description': 'Premium pistachio ice cream with real nut chunks.',
                'stock': 20,
                'scoop_type': 'cup',
                'is_vegan': False,
                'is_sugar_free': False,
            },
            {
                'name': 'Sugar Free Vanilla Cone',
                'flavour': 'Vanilla',
                'price': 75,
                'description': 'All the creaminess, none of the sugar. Diabetic friendly.',
                'stock': 15,
                'scoop_type': 'cone',
                'is_vegan': False,
                'is_sugar_free': True,
            },
            {
                'name': 'Choco Bar',
                'flavour': 'Chocolate',
                'price': 55,
                'description': 'Classic chocolate bar coated with a crisp chocolate shell.',
                'stock': 5,   # low stock test
                'scoop_type': 'bar',
                'is_vegan': False,
                'is_sugar_free': False,
            },
            {
                'name': 'Mango Sundae',
                'flavour': 'Mango',
                'price': 130,
                'description': 'Layered mango sundae with whipped cream and mango chunks.',
                'stock': 0,   # out of stock test
                'scoop_type': 'sundae',
                'is_vegan': True,
                'is_sugar_free': False,
            },
        ]

        for s in scoops_data:
            flavour_obj = flavours[s.pop('flavour')]
            obj, created = Scoop.objects.get_or_create(
                name=s['name'],
                defaults={**s, 'flavour': flavour_obj}
            )
            if created:
                self.stdout.write(f"  ✅ Scoop: {obj.name} (₹{obj.price})")

        # ── Test Users ────────────────────────────────────────
        users_data = [
            {
                'email': 'customer@meltify.com',
                'username': 'testcustomer',
                'first_name': 'Test',
                'last_name': 'Customer',
                'role': 'Customer',
                'password': 'test@1234',
            },
            {
                'email': 'parlour@meltify.com',
                'username': 'testparlour',
                'first_name': 'Test',
                'last_name': 'Parlour',
                'role': 'Parlour',
                'password': 'test@1234',
            },
        ]

        for u in users_data:
            if not User.objects.filter(email=u['email']).exists():
                User.objects.create_user(**u)
                self.stdout.write(f"  ✅ User: {u['email']} / {u['password']} ({u['role']})")
            else:
                self.stdout.write(f"  ⏭️  User already exists: {u['email']}")

        self.stdout.write(self.style.SUCCESS('\n🍦 Seed complete!'))
        self.stdout.write('──────────────────────────────')
        self.stdout.write('Test credentials:')
        self.stdout.write('  Customer → customer@meltify.com / test@1234')
        self.stdout.write('  Parlour  → parlour@meltify.com  / test@1234')