import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { supabase } from '../services/supabase';
import type { Transaction } from '../types/database.types';

type ViewType = 'expense' | 'income';

const months = [
  'СІЧЕНЬ',
  'ЛЮТИЙ',
  'БЕРЕЗЕНЬ',
  'КВІТЕНЬ',
  'ТРАВЕНЬ',
  'ЧЕРВЕНЬ',
  'ЛИПЕНЬ',
  'СЕРПЕНЬ',
  'ВЕРЕСЕНЬ',
  'ЖОВТЕНЬ',
  'ЛИСТОПАД',
  'ГРУДЕНЬ',
];

const expenseCategories = [
  'Продукти',
  'Алкоголь',
  'Розваги',
  "Здоров'я",
  'Транспорт',
  'Все для дому',
  'Техніка',
  "Комуналка, зв'язок",
  'Спорт, хобі',
  'Навчання',
  'Інше',
];

const incomeCategories = [
  'ЗП',
  'Дод. прибуток',
];

/*
  Тут потом просто меняешь названия файлов
  на свои реальные SVG.
*/

const categoryIcons: Record<string, string> = {
  'Продукти': '/svg/Group 62.png',
  'Алкоголь': '/svg/cocktail 1.png',
  'Розваги': '/svg/kite 1 (1).png',
  "Здоров'я": '/svg/hands-holding-heart 1.png',
  'Транспорт': '/svg/car 1.png',
  'Все для дому': '/svg/couch 1.png',
  'Техніка': '/svg/tools 1.png',
  "Комуналка, зв'язок": '/svg/invoice 1.png',
  'Спорт, хобі': '/svg/clay 1.png',
  'Навчання': '/svg/book 1.png',
  'Інше': '/svg/ufo 1.png',

  'ЗП': '/svg/salary 1.png',
  'Дод. прибуток': '/svg/salary (1) 1.png',
};

export const Calculations = () => {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState('UAH');

  const [view, setView] = useState<ViewType>('expense');

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate('/');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('balance, currency')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.log(profileError.message);
      }

      if (profile) {
        setBalance(Number(profile.balance || 0));
        setCurrency(profile.currency || 'UAH');
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', {
          ascending: false,
        });

      if (error) {
        console.log(error.message);
      } else {
        setTransactions(data || []);
      }

      setLoading(false);
    };

    loadData();
  }, [navigate]);

  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();

  const monthTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);

    return (
      transactionDate.getMonth() === selectedMonth &&
      transactionDate.getFullYear() === selectedYear
    );
  });

  const expenses = monthTransactions.filter(
    (transaction) => transaction.type === 'expense'
  );

  const incomes = monthTransactions.filter(
    (transaction) => transaction.type === 'income'
  );

  const totalExpenses = expenses.reduce(
    (sum, transaction) => sum + Number(transaction.amount),
    0
  );

  const totalIncome = incomes.reduce(
    (sum, transaction) => sum + Number(transaction.amount),
    0
  );

  const visibleTransactions =
    view === 'expense' ? expenses : incomes;

  const categories =
    view === 'expense'
      ? expenseCategories
      : incomeCategories;

  const getCategoryAmount = (category: string) => {
    return visibleTransactions
      .filter(
        (transaction) =>
          transaction.category === category
      )
      .reduce(
        (sum, transaction) =>
          sum + Number(transaction.amount),
        0
      );
  };

  const previousMonth = () => {
    setSelectedDate(
      new Date(
        selectedYear,
        selectedMonth - 1,
        1
      )
    );
  };

  const nextMonth = () => {
    setSelectedDate(
      new Date(
        selectedYear,
        selectedMonth + 1,
        1
      )
    );
  };

  const changeView = () => {
    setView(
      view === 'expense'
        ? 'income'
        : 'expense'
    );
  };

  if (loading) {
    return (
      <div className="calculations-loading">
        Завантаження...
      </div>
    );
  }

  return (
    <main className="calculations-page">

      <section className="calculations-container">

        {/* ВЕРХ */}

        <div className="calculations-top">

          <button
            className="back-home"
            onClick={() => navigate('/dashboard')}
          >
            <img
              src="/svg/Vector 15.png"
              alt="back"
            />

            <span>
              Повернутись на головну
            </span>
          </button>


          {/* БАЛАНС */}

          <div className="calculations-balance">

            <span className="calculations-balance-label">
              Баланс:
            </span>

            <div className="calculations-balance-value">
              {balance.toLocaleString('uk-UA', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {currency}
            </div>

            <button className="calculations-confirm">
              ПІДТВЕРДИТИ
            </button>

          </div>


          {/* ПЕРИОД */}

          <div className="period">

            <span className="period-label">
              Поточний період
            </span>

            <div className="period-control">

              <button
                type="button"
                onClick={previousMonth}
              >
                <img
                  src="/svg/Vector 15.png"
                  alt="previous"
                />
              </button>

              <div className="period-date">
                <strong>
                  {months[selectedMonth]}
                </strong>

                <strong>
                  {selectedYear}
                </strong>
              </div>

              <button
                type="button"
                onClick={nextMonth}
              >
                <img
                  src="/svg/Vector 16.png"
                  alt="next"
                />
              </button>

            </div>

          </div>

        </div>


        {/* ОБЩАЯ СУММА */}

        <div className="calculations-summary">

          <div className="summary-value">
            <span>
              Витрати:
            </span>

            <strong className="calc-expense">
              -{' '}
              {totalExpenses.toLocaleString('uk-UA', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              грн.
            </strong>
          </div>

          <div className="calc-summary-line"></div>

          <div className="summary-value">
            <span>
              Доходи:
            </span>

            <strong className="calc-income">
              +{' '}
              {totalIncome.toLocaleString('uk-UA', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              грн.
            </strong>
          </div>

        </div>


        {/* КАТЕГОРИИ */}

        <div className="categories-card">

          <div className="categories-title">

            <button
              type="button"
              onClick={changeView}
            >
              <img
                src="/svg/Vector 15.png"
                alt="previous"
              />
            </button>

            <strong>
              {view === 'expense'
                ? 'ВИТРАТИ'
                : 'ДОХОДИ'}
            </strong>

            <button
              type="button"
              onClick={changeView}
            >
              <img
                src="/svg/Vector 16.png"
                alt="next"
              />
            </button>

          </div>


          <div
            className={
              view === 'income'
                ? 'category-grid income-grid'
                : 'category-grid'
            }
          >

            {categories.map((category) => {
              const amount =
                getCategoryAmount(category);

              const icon =
                categoryIcons[category];

              return (
                <div
                  className="category-stat"
                  key={category}
                >

                  <div className="category-amount">

                    {amount.toLocaleString(
                      'uk-UA',
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}

                  </div>


                  <div className="category-icon">

                    {icon && (
                      <img
                        src={icon}
                        alt={category}
                      />
                    )}

                  </div>


                  <span className="category-name">
                    {category}
                  </span>

                </div>
              );
            })}

          </div>

        </div>

      </section>

    </main>
  );
};