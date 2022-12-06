export type User = {
  id: number;
  name: string;
  sex: string;
};

export type Category = {
  id: number,
  title: string,
  icon: string,
  ownerId: number,
};

export type Product = {
  id: number;
  name: string;
  categoryId: number;
  user: User | null;
  category: Category | null;
};
