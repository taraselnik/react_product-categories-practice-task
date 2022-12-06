import React, { useState } from 'react';
import './App.scss';

import classNames from 'classnames';
import usersFromServer from './api/users';
import productsFromServer from './api/products';
import categoriesFromServer from './api/categories';
import {
  Category, Product, ProductTable, User,
} from './types/Product';

const getCategoryById = (id: number | null) => {
  return categoriesFromServer.find(category => category.id === id) || null;
};

const getUserById = (id: number | null) => {
  return usersFromServer.find(user => user.id === id) || null;
};

const getFullProducts: Product[] = productsFromServer.map(product => {
  const category: Category | null = getCategoryById(product.categoryId);
  let user: User | null;

  // https://www.typescriptlang.org/docs/handbook/2/functions.html#optional-parameters:~:text=with%20more%20parameters.-,When%20writing%20a%20function%20type%20for%20a%20callback%2C%20never%20write%20an%20optional%20parameter%20unless%20you%20intend%20to%20call%20the%20function%20without%20passing%20that%20argument,-Function%20Overloads

  if (category !== null) {
    user = getUserById(category.ownerId);
  } else {
    user = null;
  }

  return (
    {
      ...product,
      category,
      user,
    }
  );
});

const productTable: ProductTable = [
  'ID',
  'Product',
  'Category',
  'User',
];

export const App: React.FC = () => {
  let products = [...getFullProducts];
  const [activeId, setActiveId] = useState<number | boolean>(false);

  if (activeId) {
    products = products.filter(prod => prod.user?.id === activeId);
  }

  const [inputState, setInputState] = useState('');

  if (inputState && inputState.length > 1) {
    const normInputState = inputState.toLocaleLowerCase();

    products = products.filter(product => product.name.toLocaleLowerCase()
      .includes(normInputState));
  }

  const [activeCategory, setActiveCategory] = useState<number | boolean>(false);

  if (activeCategory) {
    products = products
      .filter(product => product.category?.id === activeCategory);
  }

  const [sort, setSort] = useState(0);
  const [colTable, setColTable] = useState('ID');

  const handleSortClick: (name: string) => void = (name) => {
    if (colTable !== name) {
      setColTable(name);
      setSort(0);
    }

    if (sort === 2) {
      setSort(0);
    } else {
      setSort((prev) => prev + 1);
    }
  };

  if (colTable === 'ID' && sort === 2) {
    products = products.sort((a, b) => b.id - a.id);
  }

  if (colTable === 'Product') {
    if (sort === 1) {
      products = products.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sort === 2) {
      products = products.sort((a, b) => b.name.localeCompare(a.name));
    }
  }

  if (colTable === 'Category') {
    if (sort === 1) {
      products = products.sort(
        (a, b) => a.category?.title.localeCompare(b.category?.title),
      );
    }

    if (sort === 2) {
      products = products.sort(
        (a, b) => b.category?.title.localeCompare(a.category?.title),
      );
    }
  }

  if (colTable === 'User') {
    if (sort === 1) {
      products = products.sort(
        (a, b) => a.user?.name.localeCompare(b.user?.name),
      );
    }

    if (sort === 2) {
      products = products.sort(
        (a, b) => b.user?.name.localeCompare(a.user?.name),
      );
    }
  }

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                onClick={() => setActiveId(false)}
                className={activeId ? undefined : 'is-active'}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  key={user.id}
                  data-cy="FilterUser"
                  href="#/"
                  onClick={() => setActiveId(user.id)}
                  className={activeId === user.id ? 'is-active' : undefined}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={inputState}
                  onChange={(e) => setInputState(e.target.value.trim())}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {inputState && (
                  <span className="icon is-right">
                    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setInputState('')}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={classNames('button is-success mr-6',
                  { 'is-outlined': activeCategory !== false })}
                onClick={() => setActiveCategory(false)}
              >
                All
              </a>

              {categoriesFromServer.map(cat => (
                <a
                  key={cat.id}
                  data-cy="Category"
                  className={classNames(
                    'button mr-2 my-1',
                    { 'is-info': activeCategory === cat.id },
                  )}
                  href="#/"
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {`Category ${cat.id}`}
                </a>
              ))}

            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={() => {
                  setActiveId(false);
                  setInputState('');
                  setActiveCategory(false);
                }}

              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {!products.length && (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          )}

          <table
            data-cy="ProductTable"
            className="table is-striped is-narrow is-fullwidth"
          >
            <thead>
              <tr>
                {productTable.map((element) => (
                  <th key={element}>
                    <span className="is-flex is-flex-wrap-nowrap">
                      {element}

                      <a
                        href="#/"
                        onClick={() => handleSortClick(element)}
                      >
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={classNames(
                              'fas',
                              { 'fa-sort': sort === 0 },
                              { 'fa-sort-up': sort === 1 },
                              { 'fa-sort-down': sort === 2 },
                            )}
                          />
                        </span>
                      </a>
                    </span>
                  </th>
                ))}

              </tr>
            </thead>

            <tbody>
              {products.map(product => (
                <tr data-cy="Product" key={product.id}>
                  <td className="has-text-weight-bold" data-cy="ProductId">
                    {product.id}
                  </td>
                  <td data-cy="ProductName">{product.name}</td>
                  <td data-cy="ProductCategory">{`${product.category?.icon} - ${product.category?.title}`}</td>
                  <td
                    data-cy="ProductUser"
                    className={product.user?.sex === 'm'
                      ? 'has-text-link'
                      : 'has-text-danger'}
                  >
                    {product.user?.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
