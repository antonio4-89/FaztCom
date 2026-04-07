export type ProductoTipo = 'comida' | 'bebida';

export interface Producto {
  id: number;
  name: string;
  categoria: string;
  price: number;
  tipo: ProductoTipo;
  active: boolean;
}

export interface MenuGroup { cat: string; items: Producto[]; }

// Local fallback menu when API not available or prices are 0
export const LOCAL_MENU: Record<string, MenuGroup[]> = {
  comida: [
    { cat: 'Hamburguesas', items: [
      { id: 0, name: 'Hamburguesa Sirloin', price: 0, tipo: 'comida', categoria: 'Hamburguesas', active: true },
      { id: 0, name: 'Hamburguesa Ranchera', price: 0, tipo: 'comida', categoria: 'Hamburguesas', active: true },
      { id: 0, name: 'Hamburguesa Cheddar', price: 0, tipo: 'comida', categoria: 'Hamburguesas', active: true },
      { id: 0, name: 'Hamburguesa Simple', price: 0, tipo: 'comida', categoria: 'Hamburguesas', active: true },
    ]},
    { cat: 'Pizzas', items: [
      { id: 0, name: 'Pizza Pollo Ranch (Grande)', price: 0, tipo: 'comida', categoria: 'Pizzas', active: true },
      { id: 0, name: 'Pizza Pollo Ranch (Chica)', price: 0, tipo: 'comida', categoria: 'Pizzas', active: true },
      { id: 0, name: 'Pizza Hawaiana (Grande)', price: 0, tipo: 'comida', categoria: 'Pizzas', active: true },
      { id: 0, name: 'Pizza Hawaiana (Chica)', price: 0, tipo: 'comida', categoria: 'Pizzas', active: true },
      { id: 0, name: 'Pizza Peperoni (Grande)', price: 0, tipo: 'comida', categoria: 'Pizzas', active: true },
      { id: 0, name: 'Pizza Peperoni (Chica)', price: 0, tipo: 'comida', categoria: 'Pizzas', active: true },
      { id: 0, name: 'Pizza Margarita (Grande)', price: 0, tipo: 'comida', categoria: 'Pizzas', active: true },
      { id: 0, name: 'Pizza Margarita (Chica)', price: 0, tipo: 'comida', categoria: 'Pizzas', active: true },
    ]},
    { cat: 'Snacks', items: [
      { id: 0, name: 'Papas a la Francesa', price: 0, tipo: 'comida', categoria: 'Snacks', active: true },
      { id: 0, name: 'Nuggets', price: 0, tipo: 'comida', categoria: 'Snacks', active: true },
      { id: 0, name: 'Dedos de Queso', price: 0, tipo: 'comida', categoria: 'Snacks', active: true },
      { id: 0, name: 'Nachos', price: 0, tipo: 'comida', categoria: 'Snacks', active: true },
    ]},
  ],
  bebida: [
    { cat: 'Naranjada', items: [{ id: 0, name: 'Naranjada Mineralizada', price: 0, tipo: 'bebida', categoria: 'Naranjada', active: true }]},
    { cat: 'Refrescos', items: [
      { id: 0, name: 'Coca-Cola', price: 0, tipo: 'bebida', categoria: 'Refrescos', active: true },
      { id: 0, name: '7-UP', price: 0, tipo: 'bebida', categoria: 'Refrescos', active: true },
      { id: 0, name: 'Manzanita', price: 0, tipo: 'bebida', categoria: 'Refrescos', active: true },
    ]},
    { cat: 'Jugos Boing', items: [
      { id: 0, name: 'Boing Mango', price: 0, tipo: 'bebida', categoria: 'JugosBoing', active: true },
      { id: 0, name: 'Boing Fresa', price: 0, tipo: 'bebida', categoria: 'JugosBoing', active: true },
      { id: 0, name: 'Boing Guayaba', price: 0, tipo: 'bebida', categoria: 'JugosBoing', active: true },
    ]},
    { cat: 'Sodas Italianas', items: [
      { id: 0, name: 'Soda Italiana Fresa', price: 0, tipo: 'bebida', categoria: 'SodasItalianas', active: true },
      { id: 0, name: 'Soda Italiana Frambuesa', price: 0, tipo: 'bebida', categoria: 'SodasItalianas', active: true },
      { id: 0, name: 'Soda Italiana Mango', price: 0, tipo: 'bebida', categoria: 'SodasItalianas', active: true },
      { id: 0, name: 'Soda Italiana Uva', price: 0, tipo: 'bebida', categoria: 'SodasItalianas', active: true },
    ]},
    { cat: 'Frappes', items: [
      { id: 0, name: 'Frappe Oreo', price: 0, tipo: 'bebida', categoria: 'Frappes', active: true },
      { id: 0, name: 'Frappe Cappuccino', price: 0, tipo: 'bebida', categoria: 'Frappes', active: true },
      { id: 0, name: 'Frappe Moka', price: 0, tipo: 'bebida', categoria: 'Frappes', active: true },
    ]},
    { cat: 'Helados', items: [
      { id: 0, name: 'Helado Oreo', price: 0, tipo: 'bebida', categoria: 'Helados', active: true },
      { id: 0, name: 'Helado Cappuccino', price: 0, tipo: 'bebida', categoria: 'Helados', active: true },
      { id: 0, name: 'Helado Moka', price: 0, tipo: 'bebida', categoria: 'Helados', active: true },
    ]},
    { cat: 'Cafes', items: [
      { id: 0, name: 'Cappuccino', price: 0, tipo: 'bebida', categoria: 'Cafes', active: true },
      { id: 0, name: 'Caramel Macchiato', price: 0, tipo: 'bebida', categoria: 'Cafes', active: true },
      { id: 0, name: 'Americano', price: 0, tipo: 'bebida', categoria: 'Cafes', active: true },
      { id: 0, name: 'Espresso', price: 0, tipo: 'bebida', categoria: 'Cafes', active: true },
    ]},
  ],
};
