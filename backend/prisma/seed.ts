import { PrismaClient, Seccion, MesaTipo, ProductoTipo, ProductoCategoria, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ─── Mesas ────────────────────────────────────────────────────────────────

  const mesasData: { identifier: string; seccion: Seccion; tipo: MesaTipo }[] = [
    // PM section – mesas
    { identifier: '1PM', seccion: 'PM', tipo: 'mesa' },
    { identifier: '2PM', seccion: 'PM', tipo: 'mesa' },
    { identifier: '3PM', seccion: 'PM', tipo: 'mesa' },
    { identifier: '4PM', seccion: 'PM', tipo: 'mesa' },
    { identifier: '5PM', seccion: 'PM', tipo: 'mesa' },
    { identifier: 'SALA', seccion: 'PM', tipo: 'mesa' },

    // T section – mesas
    { identifier: '1T', seccion: 'T', tipo: 'mesa' },
    { identifier: '2T', seccion: 'T', tipo: 'mesa' },
    { identifier: '3T', seccion: 'T', tipo: 'mesa' },
    { identifier: '4T', seccion: 'T', tipo: 'mesa' },
    { identifier: '5T', seccion: 'T', tipo: 'mesa' },
    { identifier: '6T', seccion: 'T', tipo: 'mesa' },
    { identifier: '7T', seccion: 'T', tipo: 'mesa' },
    { identifier: '8T', seccion: 'T', tipo: 'mesa' },

    // T section – periqueras
    { identifier: '1P', seccion: 'T', tipo: 'periquera' },
    { identifier: '2P', seccion: 'T', tipo: 'periquera' },
    { identifier: '3P', seccion: 'T', tipo: 'periquera' },
    { identifier: '4P', seccion: 'T', tipo: 'periquera' },
    { identifier: '5P', seccion: 'T', tipo: 'periquera' },
  ];

  for (const mesa of mesasData) {
    await prisma.mesa.upsert({
      where: { identifier: mesa.identifier },
      update: {},
      create: mesa,
    });
  }
  console.log(`Upserted ${mesasData.length} mesas`);

  // ─── Productos ────────────────────────────────────────────────────────────

  const productosData: {
    name: string;
    categoria: ProductoCategoria;
    tipo: ProductoTipo;
  }[] = [
    // Comida / Hamburguesas
    { name: 'Hamburguesa Sirloin',  categoria: 'Hamburguesas', tipo: 'comida' },
    { name: 'Hamburguesa Ranchera', categoria: 'Hamburguesas', tipo: 'comida' },
    { name: 'Hamburguesa Cheddar',  categoria: 'Hamburguesas', tipo: 'comida' },
    { name: 'Hamburguesa Simple',   categoria: 'Hamburguesas', tipo: 'comida' },

    // Comida / Pizzas
    { name: 'Pizza Pollo Ranch (Grande)',  categoria: 'Pizzas', tipo: 'comida' },
    { name: 'Pizza Pollo Ranch (Chica)',   categoria: 'Pizzas', tipo: 'comida' },
    { name: 'Pizza Hawaiana (Grande)',     categoria: 'Pizzas', tipo: 'comida' },
    { name: 'Pizza Hawaiana (Chica)',      categoria: 'Pizzas', tipo: 'comida' },
    { name: 'Pizza Peperoni (Grande)',     categoria: 'Pizzas', tipo: 'comida' },
    { name: 'Pizza Peperoni (Chica)',      categoria: 'Pizzas', tipo: 'comida' },
    { name: 'Pizza Margarita (Grande)',    categoria: 'Pizzas', tipo: 'comida' },
    { name: 'Pizza Margarita (Chica)',     categoria: 'Pizzas', tipo: 'comida' },

    // Comida / Snacks
    { name: 'Papas a la Francesa', categoria: 'Snacks', tipo: 'comida' },
    { name: 'Nuggets',             categoria: 'Snacks', tipo: 'comida' },
    { name: 'Dedos de Queso',      categoria: 'Snacks', tipo: 'comida' },
    { name: 'Nachos',              categoria: 'Snacks', tipo: 'comida' },

    // Bebida / Naranjada
    { name: 'Naranjada Mineralizada', categoria: 'Naranjada', tipo: 'bebida' },

    // Bebida / Refrescos
    { name: 'Coca-Cola',   categoria: 'Refrescos', tipo: 'bebida' },
    { name: '7-UP',        categoria: 'Refrescos', tipo: 'bebida' },
    { name: 'Manzanita',   categoria: 'Refrescos', tipo: 'bebida' },

    // Bebida / JugosBoing
    { name: 'Boing Mango',    categoria: 'JugosBoing', tipo: 'bebida' },
    { name: 'Boing Fresa',    categoria: 'JugosBoing', tipo: 'bebida' },
    { name: 'Boing Guayaba',  categoria: 'JugosBoing', tipo: 'bebida' },

    // Bebida / SodasItalianas
    { name: 'Soda Italiana Fresa',     categoria: 'SodasItalianas', tipo: 'bebida' },
    { name: 'Soda Italiana Frambuesa', categoria: 'SodasItalianas', tipo: 'bebida' },
    { name: 'Soda Italiana Mango',     categoria: 'SodasItalianas', tipo: 'bebida' },
    { name: 'Soda Italiana Uva',       categoria: 'SodasItalianas', tipo: 'bebida' },

    // Bebida / Frappes
    { name: 'Frappe Oreo',        categoria: 'Frappes', tipo: 'bebida' },
    { name: 'Frappe Cappuccino',  categoria: 'Frappes', tipo: 'bebida' },
    { name: 'Frappe Moka',        categoria: 'Frappes', tipo: 'bebida' },

    // Bebida / Helados
    { name: 'Helado Oreo',       categoria: 'Helados', tipo: 'bebida' },
    { name: 'Helado Cappuccino', categoria: 'Helados', tipo: 'bebida' },
    { name: 'Helado Moka',       categoria: 'Helados', tipo: 'bebida' },

    // Bebida / Cafes
    { name: 'Cappuccino',        categoria: 'Cafes', tipo: 'bebida' },
    { name: 'Caramel Macchiato', categoria: 'Cafes', tipo: 'bebida' },
    { name: 'Americano',         categoria: 'Cafes', tipo: 'bebida' },
    { name: 'Espresso',          categoria: 'Cafes', tipo: 'bebida' },
  ];

  for (const producto of productosData) {
    const existing = await prisma.producto.findFirst({
      where: { name: producto.name, categoria: producto.categoria },
    });
    if (!existing) {
      await prisma.producto.create({ data: { ...producto, price: 0 } });
    }
  }
  console.log(`Seeded ${productosData.length} productos`);

  // ─── Admin user ───────────────────────────────────────────────────────────

  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@fastcom.mx' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@fastcom.mx',
      password: hashedPassword,
      role: Role.admin,
    },
  });
  console.log('Admin user upserted: admin@fastcom.mx');

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
